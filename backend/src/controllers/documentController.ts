import { Request, Response } from 'express';
import { Document, User, Folder, Tag, AuditLog } from '../models';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { getFileStream } from '../middleware/uploadWithMinio';

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { title, description, folderId, tags } = req.body;

    // Create document record
    const document = await Document.create({
      title: title || req.file.originalname,
      description,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      storageType: (req.file as any).storageType || 'local',
      folderId: folderId || null,
      uploadedBy: req.user.userId,
    });

    // Add tags if provided
    if (tags && Array.isArray(tags)) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName: string) => {
          const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
          return tag;
        })
      );
      await (document as any).setTags(tagInstances);
    }

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: document.id,
      action: 'DOCUMENT_UPLOADED',
      details: { fileName: document.fileName, fileSize: document.fileSize },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { folderId, page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { isDeleted: false };

    if (folderId) {
      whereClause.folderId = folderId;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { fileName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: documents, count } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'username', 'fullName'] },
        { model: Folder, as: 'folder', attributes: ['id', 'name'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'] },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      documents,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const document = await Document.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'username', 'fullName'] },
        { model: Folder, as: 'folder', attributes: ['id', 'name'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'] },
      ],
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: document.id,
      action: 'DOCUMENT_VIEWED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const document = await Document.findOne({
      where: { id, isDeleted: false },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check if file exists and get the stream
    try {
      const fileStream = await getFileStream(document.filePath, document.storageType);
      
      // Log audit trail
      await AuditLog.create({
        userId: req.user.userId,
        documentId: document.id,
        action: 'DOCUMENT_DOWNLOADED',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Set headers
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
      
      // Pipe the file stream to response
      fileStream.pipe(res);
    } catch (error) {
      console.error('File download error:', error);
      res.status(404).json({ error: 'File not found on server' });
      return;
    }
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, description, folderId, tags } = req.body;

    const document = await Document.findOne({
      where: { id, isDeleted: false },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Update document
    await document.update({
      title: title || document.title,
      description: description !== undefined ? description : document.description,
      folderId: folderId !== undefined ? folderId : document.folderId,
    });

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName: string) => {
          const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
          return tag;
        })
      );
      await (document as any).setTags(tagInstances);
    }

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: document.id,
      action: 'DOCUMENT_UPDATED',
      details: { title, description, folderId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const updatedDocument = await Document.findByPk(id, {
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'username', 'fullName'] },
        { model: Folder, as: 'folder', attributes: ['id', 'name'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'] },
      ],
    });

    res.status(200).json({
      message: 'Document updated successfully',
      document: updatedDocument,
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const document = await Document.findOne({
      where: { id, isDeleted: false },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Soft delete
    await document.update({ isDeleted: true });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      documentId: document.id,
      action: 'DOCUMENT_DELETED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
