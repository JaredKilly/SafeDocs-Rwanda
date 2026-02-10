import { Request, Response } from 'express';
import { Document, DocumentPermission, ShareLink, User, AuditLog } from '../models';
import { grantDocumentAccess, checkDocumentPermission } from '../services/permissionService';
import { AccessLevel, PermissionType } from '../services/permissionService';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendShareNotification, sendShareLink } from '../services/emailService';

/**
 * Share document with user, group, or role
 */
export const shareDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { documentId } = req.params;
    const { targetType, targetId, accessLevel, expiresAt } = req.body;

    if (!targetType || !targetId || !accessLevel) {
      res.status(400).json({ error: 'Target type, target ID, and access level are required' });
      return;
    }

    // Validate targetType
    if (!['user', 'group', 'role'].includes(targetType)) {
      res.status(400).json({ error: 'Invalid target type. Must be user, group, or role' });
      return;
    }

    // Validate accessLevel
    if (!['viewer', 'commenter', 'editor', 'owner'].includes(accessLevel)) {
      res.status(400).json({ error: 'Invalid access level' });
      return;
    }

    // Check if document exists
    const document = await Document.findByPk(documentId);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check if user has permission to share (at least editor level)
    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      parseInt(documentId),
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to share this document' });
      return;
    }

    // Grant access
    const permission = await grantDocumentAccess(
      parseInt(documentId),
      targetType as PermissionType,
      targetId,
      accessLevel as AccessLevel,
      req.user.userId,
      expiresAt ? new Date(expiresAt) : undefined
    );

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: parseInt(documentId),
      action: 'DOCUMENT_SHARED',
      details: { targetType, targetId, accessLevel },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send email notification if sharing with a specific user
    if (targetType === 'user') {
      try {
        const targetUser = await User.findByPk(targetId);
        const sharer = await User.findByPk(req.user.userId);
        if (targetUser?.email) {
          await sendShareNotification({
            recipientEmail: targetUser.email,
            recipientName: targetUser.fullName || targetUser.username,
            senderName: sharer?.fullName || sharer?.username || 'A user',
            documentTitle: document.title,
            accessLevel,
            appUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/documents/${documentId}`,
          });
        }
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    res.status(201).json({
      message: 'Document shared successfully',
      permission
    });
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all shares for a document
 */
export const getDocumentShares = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { documentId } = req.params;

    // Check if user has permission to view shares
    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      parseInt(documentId),
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to view this document' });
      return;
    }

    // Get all permissions
    const permissions = await DocumentPermission.findAll({
      where: {
        documentId,
        isRevoked: false
      },
      include: [
        {
          model: User,
          as: 'grantor',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ permissions });
  } catch (error) {
    console.error('Get document shares error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Revoke document share
 */
export const revokeDocumentShare = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { permissionId } = req.params;

    // Get the permission
    const permission = await DocumentPermission.findByPk(permissionId);
    if (!permission) {
      res.status(404).json({ error: 'Permission not found' });
      return;
    }

    // Check if user has permission to revoke
    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      permission.documentId,
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to revoke this share' });
      return;
    }

    // Revoke permission
    await permission.update({
      isRevoked: true,
      revokedBy: req.user.userId,
      revokedAt: new Date()
    });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: permission.documentId,
      action: 'DOCUMENT_SHARE_REVOKED',
      details: { permissionId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({ message: 'Share revoked successfully' });
  } catch (error) {
    console.error('Revoke document share error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a share link for a document
 */
export const createShareLink = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { documentId } = req.params;
    const { password, expiresAt, maxUses, allowDownload = true, accessLevel = 'viewer', emailTo } = req.body;

    if (!['viewer', 'commenter'].includes(accessLevel)) {
      res.status(400).json({ error: 'Invalid share link access level' });
      return;
    }

    // Check if document exists
    const document = await Document.findByPk(documentId);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check if user has permission to create share link
    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      parseInt(documentId),
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to create share links for this document' });
      return;
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Hash password with bcrypt if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const expiryDate = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days

    // Create share link
    const shareLink = await ShareLink.create({
      documentId: parseInt(documentId),
      token,
      passwordHash,
      accessLevel,
      expiresAt: expiryDate,
      maxUses: maxUses || null,
      allowDownload,
      createdBy: req.user.userId,
      createdAt: new Date()
    });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: parseInt(documentId),
      action: 'SHARE_LINK_CREATED',
      details: { token, hasPassword: !!password },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const linkUrl = `${req.protocol}://${req.get('host')}/share/${token}`;

    // Optionally email the link
    if (emailTo) {
      try {
        const sharer = await User.findByPk(req.user.userId);
        await sendShareLink({
          recipientEmail: emailTo,
          senderName: sharer?.fullName || sharer?.username || 'A user',
          documentTitle: document.title,
          shareUrl: linkUrl,
          expiresAt: expiryDate.toISOString(),
          allowDownload,
        });
      } catch (emailError) {
        console.error('Share link email failed:', emailError);
      }
    }

    res.status(201).json({
      message: 'Share link created successfully',
      shareLink: {
        ...shareLink.toJSON(),
        passwordHash: undefined,
        url: linkUrl,
      }
    });
  } catch (error) {
    console.error('Create share link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Access document via share link
 */
export const accessViaShareLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find share link
    const shareLink = await ShareLink.findOne({
      where: { token, isActive: true },
      include: [
        {
          model: Document,
          as: 'document',
          where: { isDeleted: false }
        }
      ]
    });

    if (!shareLink) {
      res.status(404).json({ error: 'Share link not found or expired' });
      return;
    }

    // Check if expired
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      res.status(403).json({ error: 'Share link has expired' });
      return;
    }

    // Check max uses
    if (shareLink.maxUses && shareLink.currentUses >= shareLink.maxUses) {
      res.status(403).json({ error: 'Share link has reached maximum uses' });
      return;
    }

    // Check password if required
    if (shareLink.passwordHash) {
      if (!password) {
        res.status(401).json({ error: 'Password required', requiresPassword: true });
        return;
      }

      const isValid = await bcrypt.compare(password, shareLink.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }
    }

    // Increment usage count
    await shareLink.update({
      currentUses: shareLink.currentUses + 1
    });

    // Return document info
    res.status(200).json({
      document: (shareLink as any).document,
      allowDownload: shareLink.allowDownload
    });
  } catch (error) {
    console.error('Access via share link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Deactivate share link
 */
export const deactivateShareLink = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { token } = req.params;

    // Find share link
    const shareLink = await ShareLink.findOne({ where: { token } });

    if (!shareLink) {
      res.status(404).json({ error: 'Share link not found' });
      return;
    }

    // Check if user has permission
    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      shareLink.documentId,
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to deactivate this share link' });
      return;
    }

    // Deactivate link
    await shareLink.update({ isActive: false });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: shareLink.documentId,
      action: 'SHARE_LINK_DEACTIVATED',
      details: { token },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({ message: 'Share link deactivated successfully' });
  } catch (error) {
    console.error('Deactivate share link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all share links for a document
 */
export const getDocumentShareLinks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { documentId } = req.params;

    // Check if user has permission
    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      parseInt(documentId),
      AccessLevel.VIEWER
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to view this document' });
      return;
    }

    // Get all share links
    const shareLinks = await ShareLink.findAll({
      where: { documentId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Remove password hashes from response
    const sanitizedLinks = shareLinks.map(link => ({
      ...link.toJSON(),
      passwordHash: undefined,
      url: `${req.protocol}://${req.get('host')}/api/shares/link/${link.token}`
    }));

    res.status(200).json({ shareLinks: sanitizedLinks });
  } catch (error) {
    console.error('Get document share links error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
