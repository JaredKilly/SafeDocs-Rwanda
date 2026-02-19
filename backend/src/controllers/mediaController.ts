import { Request, Response } from 'express';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import sequelize from '../config/database';
import { MediaItem, User } from '../models';
import { getFileStream } from '../middleware/uploadWithMinio';

// ── Media Items ──────────────────────────────────────────────

export const getMediaItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, mediaType, category } = req.query;
    const where: any = { isDeleted: false };

    // Org scoping: non-admin users only see their org's media
    const mediaOrgId = (req.user as any)?.organizationId;
    if (mediaOrgId) {
      where.organizationId = mediaOrgId;
    }

    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { fileName: { [Op.iLike]: `%${q}%` } },
      ];
    }
    if (mediaType) where.mediaType = mediaType;
    if (category) where.category = category;

    const items = await MediaItem.findAll({
      where,
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'username', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(items);
  } catch (error) {
    console.error('getMediaItems error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMediaItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await MediaItem.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'username', 'fullName'] },
      ],
    });

    if (!item) {
      res.status(404).json({ error: 'Media item not found' });
      return;
    }

    res.json(item);
  } catch (error) {
    console.error('getMediaItem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = req.file as any;
    const { title, description, category, tags } = req.body;

    // Determine media type from MIME
    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    // Build file path
    const filePath = file.storageType === 'minio' ? file.path : file.path;
    const storageType = file.storageType || 'local';

    // Use filename without extension as default title
    const defaultTitle = path.basename(file.originalname, path.extname(file.originalname));

    const mediaItem = await MediaItem.create({
      title: title || defaultTitle,
      description: description || undefined,
      fileName: file.originalname,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      mediaType,
      storageType,
      category: category || 'general',
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      uploadedBy: req.user!.id,
      organizationId: (req.user as any).organizationId ?? undefined,
    });

    // Reload with uploader relation
    const result = await MediaItem.findByPk(mediaItem.id, {
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'username', 'fullName'] },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('uploadMedia error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await MediaItem.findOne({ where: { id, isDeleted: false } });

    if (!item) {
      res.status(404).json({ error: 'Media item not found' });
      return;
    }

    const { title, description, category, tags } = req.body;

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (category !== undefined) item.category = category;
    if (tags !== undefined) item.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    await item.save();

    const result = await MediaItem.findByPk(item.id, {
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'username', 'fullName'] },
      ],
    });

    res.json(result);
  } catch (error) {
    console.error('updateMedia error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await MediaItem.findOne({ where: { id, isDeleted: false } });

    if (!item) {
      res.status(404).json({ error: 'Media item not found' });
      return;
    }

    item.isDeleted = true;
    await item.save();

    res.json({ message: 'Media item deleted' });
  } catch (error) {
    console.error('deleteMedia error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const downloadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await MediaItem.findOne({ where: { id, isDeleted: false } });

    if (!item) {
      res.status(404).json({ error: 'Media item not found' });
      return;
    }

    const stream = await getFileStream(item.filePath, item.storageType);

    res.setHeader('Content-Type', item.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${item.fileName}"`);
    if (item.fileSize) {
      res.setHeader('Content-Length', item.fileSize.toString());
    }

    (stream as any).pipe(res);
  } catch (error) {
    console.error('downloadMedia error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const streamMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await MediaItem.findOne({ where: { id, isDeleted: false } });

    if (!item) {
      res.status(404).json({ error: 'Media item not found' });
      return;
    }

    // For local storage, support range requests (needed for video seeking)
    if (item.storageType === 'local') {
      const filePath = item.filePath;
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'File not found on disk' });
        return;
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const fileStream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': item.mimeType,
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': item.mimeType,
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } else {
      // MinIO: stream without range support
      const stream = await getFileStream(item.filePath, item.storageType);
      res.setHeader('Content-Type', item.mimeType);
      (stream as any).pipe(res);
    }
  } catch (error) {
    console.error('streamMedia error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Media Stats ──────────────────────────────────────────────

export const getMediaStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const where: any = { isDeleted: false };
    const statsOrgId = (req.user as any)?.organizationId;
    if (statsOrgId) {
      where.organizationId = statsOrgId;
    }

    const [total, images, videos, storageSumResult, categoryBreakdown] = await Promise.all([
      MediaItem.count({ where }),
      MediaItem.count({ where: { ...where, mediaType: 'image' } }),
      MediaItem.count({ where: { ...where, mediaType: 'video' } }),
      MediaItem.findOne({
        where,
        attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('fileSize')), 0), 'totalBytes']],
        raw: true,
      }),
      MediaItem.findAll({
        where,
        attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['category'],
        raw: true,
      }),
    ]);

    const totalStorageBytes = parseInt((storageSumResult as any)?.totalBytes || '0', 10);

    res.json({
      total,
      images,
      videos,
      totalStorageBytes,
      categories: categoryBreakdown.map((c: any) => ({
        category: c.category,
        count: parseInt(c.count, 10),
      })),
    });
  } catch (error) {
    console.error('getMediaStats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
