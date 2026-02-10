import { Request, Response } from 'express';
import { AccessRequest, Document, User, AuditLog } from '../models';
import { grantDocumentAccess, checkDocumentPermission } from '../services/permissionService';
import { AccessLevel, PermissionType } from '../services/permissionService';
import { sendAccessRequestNotification, sendAccessRequestResponse } from '../services/emailService';

/**
 * Submit an access request for a document
 */
export const submitAccessRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { documentId, message, requestedAccess = 'viewer' } = req.body;

    if (!['viewer', 'commenter', 'editor'].includes(requestedAccess)) {
      res.status(400).json({ error: 'Invalid requested access level' });
      return;
    }

    if (!documentId) {
      res.status(400).json({ error: 'Document ID is required' });
      return;
    }

    // Check if document exists
    const document = await Document.findByPk(documentId);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check if user already has access
    const hasAccess = await checkDocumentPermission(
      req.user.userId,
      documentId,
      AccessLevel.VIEWER
    );

    if (hasAccess) {
      res.status(400).json({ error: 'You already have access to this document' });
      return;
    }

    // Check if there's already a pending request
    const existingRequest = await AccessRequest.findOne({
      where: {
        documentId,
        requesterId: req.user.userId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      res.status(400).json({ error: 'You already have a pending request for this document' });
      return;
    }

    // Create access request
    const accessRequest = await AccessRequest.create({
      documentId,
      requesterId: req.user.userId,
      message: message || null,
      requestedAccess,
      status: 'pending',
      createdAt: new Date()
    });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId,
      action: 'ACCESS_REQUEST_SUBMITTED',
      details: { requestId: accessRequest.id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Notify document owner
    try {
      const owner = await User.findByPk(document.uploadedBy);
      const requester = await User.findByPk(req.user.userId);
      if (owner?.email) {
        await sendAccessRequestNotification({
          ownerEmail: owner.email,
          ownerName: owner.fullName || owner.username,
          requesterName: requester?.fullName || requester?.username || 'A user',
          documentTitle: document.title,
          requestedAccess,
          message: message || undefined,
          appUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/access-requests`,
        });
      }
    } catch (emailError) {
      console.error('Access request email failed:', emailError);
    }

    res.status(201).json({
      message: 'Access request submitted successfully',
      accessRequest
    });
  } catch (error) {
    console.error('Submit access request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get pending access requests for documents the user owns/manages
 */
export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get pending requests for documents user has editor access to
    // For simplicity, get all pending requests and filter by permission
    const allPendingRequests = await AccessRequest.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Document,
          as: 'document',
          attributes: ['id', 'title', 'fileName', 'uploadedBy'],
          where: { isDeleted: false }
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter to only requests for documents user can manage
    const manageableRequests = [];
    for (const request of allPendingRequests) {
      const hasPermission = await checkDocumentPermission(
        req.user.userId,
        request.documentId,
        AccessLevel.EDITOR
      );

      if (hasPermission) {
        manageableRequests.push(request);
      }
    }

    res.status(200).json({ requests: manageableRequests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get access requests submitted by the current user
 */
export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const requests = await AccessRequest.findAll({
      where: { requesterId: req.user.userId },
      include: [
        {
          model: Document,
          as: 'document',
          attributes: ['id', 'title', 'fileName'],
          where: { isDeleted: false }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Approve an access request
 */
export const approveRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { accessLevel = 'viewer', response } = req.body;

    // Validate access level
    if (!['viewer', 'commenter', 'editor'].includes(accessLevel)) {
      res.status(400).json({ error: 'Invalid access level' });
      return;
    }

    // Get access request
    const accessRequest = await AccessRequest.findByPk(id);
    if (!accessRequest) {
      res.status(404).json({ error: 'Access request not found' });
      return;
    }

    if (accessRequest.status !== 'pending') {
      res.status(400).json({ error: 'Access request has already been processed' });
      return;
    }

    // Check if user has permission to approve
    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      accessRequest.documentId,
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to approve this request' });
      return;
    }

    // Grant access to requester
    await grantDocumentAccess(
      accessRequest.documentId,
      PermissionType.USER,
      accessRequest.requesterId.toString(),
      accessLevel as AccessLevel,
      req.user.userId
    );

    // Update request status
    await accessRequest.update({
      status: 'approved',
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      responseMessage: response || null
    });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: accessRequest.documentId,
      action: 'ACCESS_REQUEST_APPROVED',
      details: { requestId: id, requesterId: accessRequest.requesterId, accessLevel },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Notify requester of approval
    try {
      const requester = await User.findByPk(accessRequest.requesterId);
      const doc = await Document.findByPk(accessRequest.documentId, { attributes: ['title'] });
      if (requester?.email && doc) {
        await sendAccessRequestResponse({
          requesterEmail: requester.email,
          requesterName: requester.fullName || requester.username,
          documentTitle: doc.title,
          status: 'approved',
          responseMessage: response || undefined,
          appUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/documents/${accessRequest.documentId}`,
        });
      }
    } catch (emailError) {
      console.error('Approval email failed:', emailError);
    }

    res.status(200).json({
      message: 'Access request approved successfully',
      accessRequest
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Deny an access request
 */
export const denyRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { response } = req.body;

    // Get access request
    const accessRequest = await AccessRequest.findByPk(id);
    if (!accessRequest) {
      res.status(404).json({ error: 'Access request not found' });
      return;
    }

    if (accessRequest.status !== 'pending') {
      res.status(400).json({ error: 'Access request has already been processed' });
      return;
    }

    // Check if user has permission to deny
    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      accessRequest.documentId,
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to deny this request' });
      return;
    }

    // Update request status
    await accessRequest.update({
      status: 'denied',
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      responseMessage: response || null
    });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: accessRequest.documentId,
      action: 'ACCESS_REQUEST_DENIED',
      details: { requestId: id, requesterId: accessRequest.requesterId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Notify requester of denial
    try {
      const requester = await User.findByPk(accessRequest.requesterId);
      const doc = await Document.findByPk(accessRequest.documentId, { attributes: ['title'] });
      if (requester?.email && doc) {
        await sendAccessRequestResponse({
          requesterEmail: requester.email,
          requesterName: requester.fullName || requester.username,
          documentTitle: doc.title,
          status: 'denied',
          responseMessage: response || undefined,
          appUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
        });
      }
    } catch (emailError) {
      console.error('Denial email failed:', emailError);
    }

    res.status(200).json({
      message: 'Access request denied',
      accessRequest
    });
  } catch (error) {
    console.error('Deny request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
