import { Request, Response } from 'express';
import { AuditLog, User, Document } from '../models';
import { Op } from 'sequelize';

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const offset = (page - 1) * limit;

    const where: any = {};

    if (req.query.userId) {
      where.userId = parseInt(req.query.userId as string);
    }

    if (req.query.documentId) {
      where.documentId = parseInt(req.query.documentId as string);
    }

    if (req.query.action) {
      where.action = { [Op.iLike]: `%${req.query.action}%` };
    }

    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) {
        where.createdAt[Op.gte] = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    // Non-admin users can only see their own logs
    const role = req.user.role;
    if (role !== 'admin' && role !== 'manager') {
      where.userId = req.user.userId;
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'email'] },
        { model: Document, as: 'document', attributes: ['id', 'title', 'fileName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      logs: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
