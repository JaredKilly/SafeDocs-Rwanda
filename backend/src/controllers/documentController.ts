import { Request, Response } from 'express';
import { Document, User, Folder, Tag, AuditLog, DocumentVersion } from '../models';
import { Op } from 'sequelize';
import fs from 'fs';
import { deleteFile } from '../middleware/uploadWithMinio';
import { scanFile } from '../services/malwareService';
import { encryptFile, decryptFile } from '../services/encryptionService';
import { convertImageToPdf } from '../services/imageToPdfService';
import { processOCR } from '../services/ocrService';
import * as minioService from '../services/minioService';
import {
  AccessLevel,
  checkDocumentPermission,
  checkFolderPermission,
  listUserAccessibleDocuments,
} from '../services/permissionService';

const streamToBuffer = async (stream: NodeJS.ReadableStream): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });

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

    const { title, description, folderId, tags, expiresAt } = req.body;

    if (folderId) {
      const hasFolderAccess = await checkFolderPermission(
        req.user.userId,
        Number(folderId),
        AccessLevel.EDITOR
      );

      if (!hasFolderAccess) {
        res.status(403).json({ error: 'You do not have permission to add documents to this folder' });
        return;
      }
    }

    // Malware scan
    let fileBuffer: Buffer | undefined;
    try {
      fileBuffer = (req.file as any).buffer || fs.readFileSync(req.file.path);
      if (fileBuffer) {
        const scanResult = await scanFile(fileBuffer, req.file.originalname);
        if (scanResult.isMalicious) {
          await deleteFile(req.file.path, (req.file as any).storageType || 'local');
          res.status(400).json({ error: 'Uploaded file is malicious', details: scanResult });
          return;
        }
      }
    } catch (scanError) {
      console.error('Malware scan error:', scanError);
      // Continue upload but log; could optionally block here
    }

    // Optional image -> PDF conversion
    const convertFlag = req.body.convertToPdf === 'true' || process.env.CONVERT_IMAGES_TO_PDF === 'true';
    if (
      convertFlag &&
      fileBuffer &&
      req.file.mimetype.startsWith('image/') &&
      (req.file.mimetype.includes('jpeg') || req.file.mimetype.includes('png'))
    ) {
      try {
        const { pdfBuffer, pdfFileName } = await convertImageToPdf(fileBuffer, req.file.originalname, req.file.mimetype);

        // Overwrite stored file
        if ((req.file as any).storageType === 'minio') {
          await minioService.uploadFile(
            req.file.path,
            pdfBuffer,
            {
              'Content-Type': 'application/pdf',
              'Content-Length': pdfBuffer.length.toString(),
              'Original-Filename': pdfFileName,
            }
          );
        } else {
          fs.writeFileSync(req.file.path, pdfBuffer);
        }

        // Update request file metadata
        fileBuffer = pdfBuffer;
        req.file.originalname = pdfFileName;
        req.file.mimetype = 'application/pdf';
        req.file.size = pdfBuffer.length;
      } catch (convError) {
        console.error('Image to PDF conversion error:', convError);
      }
    }

    // Optional OCR
    let ocrText: string | null = null;
    try {
      if (req.file?.path) {
        const ocrResult = await processOCR(req.file.path);
        ocrText = ocrResult.text;
      }
    } catch (ocrError) {
      console.error('OCR error:', ocrError);
    }

    // Ensure we still have the file buffer (e.g., when using disk storage)
    if (!fileBuffer && req.file?.path) {
      if ((req.file as any).storageType === 'minio') {
        const stream = await minioService.downloadFile(req.file.path);
        fileBuffer = await streamToBuffer(stream);
      } else {
        fileBuffer = fs.readFileSync(req.file.path);
      }
    }

    // Create document record (size will be updated after encryption)
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
      metadata: ocrText ? { ocrText } : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    // Encrypt and persist the file
    try {
      if (fileBuffer) {
        const { encryptedBuffer } = await encryptFile(fileBuffer, document.id);

        if ((req.file as any).storageType === 'minio') {
          await minioService.uploadFile(document.filePath, encryptedBuffer, {
            'Content-Type': req.file.mimetype,
            'Content-Length': encryptedBuffer.length.toString(),
            'Original-Filename': req.file.originalname,
          });
        } else {
          fs.writeFileSync(document.filePath, encryptedBuffer);
        }

        await document.update({ fileSize: encryptedBuffer.length });
      }
    } catch (encryptError) {
      console.error('Encryption error:', encryptError);
      // Cleanup stored file and document record if encryption fails
      try {
        await deleteFile(document.filePath, document.storageType);
      } catch (cleanupError) {
        console.error('Cleanup error after encryption failure:', cleanupError);
      }
      await document.destroy();
      res.status(500).json({ error: 'Failed to encrypt and store the file' });
      return;
    }

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

    const accessibleIds = await listUserAccessibleDocuments(req.user.userId, {
      folderId: folderId ? Number(folderId) : undefined,
      minAccessLevel: AccessLevel.VIEWER,
    });

    if (accessibleIds.length === 0) {
      res.status(200).json({
        documents: [],
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0,
        },
      });
      return;
    }

    whereClause.id = { [Op.in]: accessibleIds };

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

    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      Number(id),
      AccessLevel.VIEWER
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to view this document' });
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

    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      Number(id),
      AccessLevel.VIEWER
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to download this document' });
      return;
    }

    try {
      let encryptedBuffer: Buffer;

      if (document.storageType === 'minio') {
        const stream = await minioService.downloadFile(document.filePath);
        encryptedBuffer = await streamToBuffer(stream);
      } else {
        encryptedBuffer = fs.readFileSync(document.filePath);
      }

      const decryptedBuffer = await decryptFile(encryptedBuffer, document.id);

      // Log audit trail
      await AuditLog.create({
        userId: req.user.userId,
        documentId: document.id,
        action: 'DOCUMENT_DOWNLOADED',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Set headers and send file
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Length', decryptedBuffer.length.toString());
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);

      res.send(decryptedBuffer);
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
    const { title, description, folderId, tags, expiresAt } = req.body;

    const document = await Document.findOne({
      where: { id, isDeleted: false },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const hasPermission = await checkDocumentPermission(
      req.user.userId,
      Number(id),
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to update this document' });
      return;
    }

    // Update document
    if (folderId !== undefined && folderId !== document.folderId) {
      const folderAccess = await checkFolderPermission(
        req.user.userId,
        Number(folderId),
        AccessLevel.EDITOR
      );
      if (!folderAccess) {
        res.status(403).json({ error: 'You do not have permission to move this document to the target folder' });
        return;
      }
    }

    await document.update({
      title: title || document.title,
      description: description !== undefined ? description : document.description,
      folderId: folderId !== undefined ? folderId : document.folderId,
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : (null as any) }),
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

    const canDelete =
      req.user.role === 'admin' ||
      (await checkDocumentPermission(req.user.userId, Number(id), AccessLevel.OWNER));

    if (!canDelete) {
      res.status(403).json({ error: 'You do not have permission to delete this document' });
      return;
    }

    // Soft delete
    await document.update({ isDeleted: true });

    // Remove stored file
    try {
      await deleteFile(document.filePath, document.storageType);
    } catch (fileError) {
      console.error('Error deleting stored file:', fileError);
    }

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

// ─── Get document version history ────────────────────────────────────────────

export const getDocumentVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { id } = req.params;
    const document = await Document.findOne({ where: { id, isDeleted: false } });
    if (!document) { res.status(404).json({ error: 'Document not found' }); return; }

    const versions = await DocumentVersion.findAll({
      where: { documentId: Number(id) },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'username', 'fullName'] }],
      order: [['versionNumber', 'DESC']],
    });

    res.status(200).json({ versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── Download a specific version ─────────────────────────────────────────────

export const downloadDocumentVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { id, versionId } = req.params;
    const version = await DocumentVersion.findOne({
      where: { id: Number(versionId), documentId: Number(id) },
    });

    if (!version) { res.status(404).json({ error: 'Version not found' }); return; }

    // Serve file from storage
    if (version.storageType === 'minio') {
      const stream = await minioService.downloadFile(version.filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${version.fileName}"`);
      if (version.mimeType) res.setHeader('Content-Type', version.mimeType);
      stream.pipe(res);
    } else {
      if (!fs.existsSync(version.filePath)) {
        res.status(404).json({ error: 'Version file not found on disk' });
        return;
      }
      res.setHeader('Content-Disposition', `attachment; filename="${version.fileName}"`);
      if (version.mimeType) res.setHeader('Content-Type', version.mimeType);
      res.sendFile(version.filePath);
    }
  } catch (error) {
    console.error('Download version error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
