import { Request, Response } from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { Document, User, AuditLog, Organization, Folder, MediaItem } from '../models';

function buildDateFilter(range?: string): Date | null {
  if (!range || range === 'all') return null;
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 0;
  if (days === 0) return null;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function orgScope(orgId: number | null | undefined): Record<string, any> {
  return orgId ? { organizationId: orgId } : {};
}

// ── Overview Stats ──────────────────────────────────────────────

export const getOverviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = req.query.range as string | undefined;
    const since = buildDateFilter(range);
    const orgId = (req.user as any)?.organizationId;

    const dateWhere = since ? { createdAt: { [Op.gte]: since } } : {};
    const docWhere = { isDeleted: false, ...orgScope(orgId), ...dateWhere };
    const userWhere = { isActive: true, ...orgScope(orgId) };

    const [totalDocuments, totalUsers, storageSumResult, totalOrganizations, totalFolders] =
      await Promise.all([
        Document.count({ where: docWhere }),
        User.count({ where: userWhere }),
        Document.findOne({
          where: { isDeleted: false, ...orgScope(orgId) },
          attributes: [
            [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('fileSize')), 0), 'totalBytes'],
          ],
          raw: true,
        }),
        orgId ? Promise.resolve(1) : Organization.count({ where: { isActive: true } }),
        Folder.count({ where: { ...orgScope(orgId), ...dateWhere } }),
      ]);

    const totalStorageBytes = parseInt((storageSumResult as any)?.totalBytes || '0', 10);

    res.json({
      totalDocuments,
      totalUsers,
      totalStorageBytes,
      totalOrganizations,
      totalFolders,
    });
  } catch (error) {
    console.error('getOverviewStats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Document Analytics ──────────────────────────────────────────

export const getDocumentAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = req.query.range as string | undefined;
    const since = buildDateFilter(range);
    const orgId = (req.user as any)?.organizationId;

    const dateWhere = since ? { createdAt: { [Op.gte]: since } } : {};
    const baseWhere = { isDeleted: false, ...orgScope(orgId), ...dateWhere };

    const [documentsOverTime, byMimeType, totalDocs, mediaCount] = await Promise.all([
      Document.findAll({
        where: baseWhere,
        attributes: [
          [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
        order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']],
        raw: true,
      }),

      Document.findAll({
        where: baseWhere,
        attributes: ['mimeType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['mimeType'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        raw: true,
        limit: 10,
      }),

      Document.count({ where: baseWhere }),

      MediaItem.count({
        where: { isDeleted: false, ...orgScope(orgId), ...dateWhere },
      }),
    ]);

    // Count module-specific documents using JSONB queries
    let govCount = 0;
    let hcCount = 0;
    let hrCount = 0;
    try {
      const [govResult] = await sequelize.query(
        `SELECT COUNT(*) as count FROM documents WHERE "isDeleted" = false AND metadata->>'classificationLevel' IS NOT NULL${orgId ? ` AND "organizationId" = ${parseInt(String(orgId), 10)}` : ''}${since ? ` AND "createdAt" >= '${since.toISOString()}'` : ''}`
      );
      govCount = parseInt((govResult as any[])[0]?.count || '0', 10);

      const [hcResult] = await sequelize.query(
        `SELECT COUNT(*) as count FROM documents WHERE "isDeleted" = false AND metadata->>'privacyLevel' IS NOT NULL${orgId ? ` AND "organizationId" = ${parseInt(String(orgId), 10)}` : ''}${since ? ` AND "createdAt" >= '${since.toISOString()}'` : ''}`
      );
      hcCount = parseInt((hcResult as any[])[0]?.count || '0', 10);

      const [hrResult] = await sequelize.query(
        `SELECT COUNT(*) as count FROM documents WHERE "isDeleted" = false AND metadata->>'hrCategory' IS NOT NULL${orgId ? ` AND "organizationId" = ${parseInt(String(orgId), 10)}` : ''}${since ? ` AND "createdAt" >= '${since.toISOString()}'` : ''}`
      );
      hrCount = parseInt((hrResult as any[])[0]?.count || '0', 10);
    } catch {
      // If JSONB queries fail, fall back to 0
    }

    const generalCount = Math.max(0, totalDocs - govCount - hcCount - hrCount);

    res.json({
      documentsOverTime: (documentsOverTime as any[]).map((r: any) => ({
        date: r.date,
        count: parseInt(r.count, 10),
      })),
      byMimeType: (byMimeType as any[]).map((r: any) => ({
        mimeType: r.mimeType || 'unknown',
        count: parseInt(r.count, 10),
      })),
      byModule: [
        { module: 'General', count: generalCount },
        { module: 'Government', count: govCount },
        { module: 'Healthcare', count: hcCount },
        { module: 'HR', count: hrCount },
        { module: 'Media', count: mediaCount },
      ],
    });
  } catch (error) {
    console.error('getDocumentAnalytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── User Activity ───────────────────────────────────────────────

export const getUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = req.query.range as string | undefined;
    const since = buildDateFilter(range);
    const orgId = (req.user as any)?.organizationId;

    const dateWhere = since ? { createdAt: { [Op.gte]: since } } : {};

    const [activeUsers, totalUsers, newUsersOverTime, topUploaders, recentActivity] =
      await Promise.all([
        User.count({ where: { isActive: true, ...orgScope(orgId) } }),
        User.count({ where: { ...orgScope(orgId) } }),

        User.findAll({
          where: { ...orgScope(orgId), ...dateWhere },
          attributes: [
            [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          ],
          group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
          order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']],
          raw: true,
        }),

        Document.findAll({
          where: { isDeleted: false, ...orgScope(orgId), ...dateWhere },
          attributes: [
            'uploadedBy',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('fileSize')), 0), 'totalSize'],
          ],
          group: ['uploadedBy'],
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
          limit: 10,
          raw: true,
        }),

        AuditLog.findAll({
          where: dateWhere,
          include: [
            { model: User, as: 'user', attributes: ['id', 'username', 'fullName'] },
          ],
          order: [['createdAt', 'DESC']],
          limit: 20,
        }),
      ]);

    // Enrich top uploaders with user names
    const uploaderIds = (topUploaders as any[]).map((u: any) => u.uploadedBy);
    const uploaderUsers =
      uploaderIds.length > 0
        ? await User.findAll({
            where: { id: { [Op.in]: uploaderIds } },
            attributes: ['id', 'username', 'fullName'],
            raw: true,
          })
        : [];
    const userMap = new Map(uploaderUsers.map((u: any) => [u.id, u]));

    res.json({
      activeUsers,
      totalUsers,
      newUsersOverTime: (newUsersOverTime as any[]).map((r: any) => ({
        date: r.date,
        count: parseInt(r.count, 10),
      })),
      topUploaders: (topUploaders as any[]).map((r: any) => {
        const u = userMap.get(r.uploadedBy) as any;
        return {
          userId: r.uploadedBy,
          username: u?.username || 'Unknown',
          fullName: u?.fullName || u?.username || 'Unknown',
          count: parseInt(r.count, 10),
          totalSize: parseInt(r.totalSize || '0', 10),
        };
      }),
      recentActivity: recentActivity.map((log: any) => ({
        id: log.id,
        action: log.action,
        userId: log.userId,
        user: log.user
          ? { id: log.user.id, username: log.user.username, fullName: log.user.fullName }
          : null,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error('getUserActivity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Storage Analytics ───────────────────────────────────────────

export const getStorageAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = req.query.range as string | undefined;
    const since = buildDateFilter(range);
    const orgId = (req.user as any)?.organizationId;

    const dateWhere = since ? { createdAt: { [Op.gte]: since } } : {};
    const baseWhere = { isDeleted: false, ...orgScope(orgId), ...dateWhere };

    const [storageByUser, storageGrowth, storageByOrg] = await Promise.all([
      Document.findAll({
        where: baseWhere,
        attributes: [
          'uploadedBy',
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('fileSize')), 0), 'totalSize'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['uploadedBy'],
        order: [[sequelize.fn('SUM', sequelize.col('fileSize')), 'DESC']],
        limit: 10,
        raw: true,
      }),

      Document.findAll({
        where: baseWhere,
        attributes: [
          [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('fileSize')), 0), 'bytes'],
        ],
        group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
        order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']],
        raw: true,
      }),

      !orgId
        ? Document.findAll({
            where: { isDeleted: false, ...dateWhere },
            attributes: [
              'organizationId',
              [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('fileSize')), 0), 'totalSize'],
              [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: ['organizationId'],
            order: [[sequelize.fn('SUM', sequelize.col('fileSize')), 'DESC']],
            raw: true,
          })
        : Promise.resolve([]),
    ]);

    // Enrich user names
    const userIds = (storageByUser as any[]).map((r: any) => r.uploadedBy);
    const users =
      userIds.length > 0
        ? await User.findAll({
            where: { id: { [Op.in]: userIds } },
            attributes: ['id', 'username', 'fullName'],
            raw: true,
          })
        : [];
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    // Enrich org names
    const orgIds = (storageByOrg as any[]).map((r: any) => r.organizationId).filter(Boolean);
    const orgs =
      orgIds.length > 0
        ? await Organization.findAll({
            where: { id: { [Op.in]: orgIds } },
            attributes: ['id', 'name'],
            raw: true,
          })
        : [];
    const orgMap = new Map(orgs.map((o: any) => [o.id, o.name]));

    res.json({
      storageByUser: (storageByUser as any[]).map((r: any) => {
        const u = userMap.get(r.uploadedBy) as any;
        return {
          userId: r.uploadedBy,
          fullName: u?.fullName || u?.username || 'Unknown',
          totalSize: parseInt(r.totalSize || '0', 10),
          count: parseInt(r.count, 10),
        };
      }),
      storageGrowth: (storageGrowth as any[]).map((r: any) => ({
        date: r.date,
        bytes: parseInt(r.bytes || '0', 10),
      })),
      storageByOrg: (storageByOrg as any[]).map((r: any) => ({
        organizationId: r.organizationId,
        organizationName: r.organizationId ? orgMap.get(r.organizationId) || 'Unknown' : 'Unassigned',
        totalSize: parseInt(r.totalSize || '0', 10),
        count: parseInt(r.count, 10),
      })),
    });
  } catch (error) {
    console.error('getStorageAnalytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Audit Analytics ─────────────────────────────────────────────

export const getAuditAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const range = req.query.range as string | undefined;
    const since = buildDateFilter(range);

    const dateWhere = since ? { createdAt: { [Op.gte]: since } } : {};

    const [actionsOverTime, topActions, totalActions] = await Promise.all([
      AuditLog.findAll({
        where: dateWhere,
        attributes: [
          [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
        order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']],
        raw: true,
      }),

      AuditLog.findAll({
        where: dateWhere,
        attributes: ['action', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['action'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10,
        raw: true,
      }),

      AuditLog.count({ where: dateWhere }),
    ]);

    res.json({
      totalActions,
      actionsOverTime: (actionsOverTime as any[]).map((r: any) => ({
        date: r.date,
        count: parseInt(r.count, 10),
      })),
      topActions: (topActions as any[]).map((r: any) => ({
        action: r.action,
        count: parseInt(r.count, 10),
      })),
    });
  } catch (error) {
    console.error('getAuditAnalytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
