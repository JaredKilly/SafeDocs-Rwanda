import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import * as minioService from '../services/minioService';

const USE_MINIO = process.env.USE_MINIO === 'true';

// Ensure uploads directory exists (for local storage)
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!USE_MINIO && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage based on environment
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// Memory storage for MinIO (files stored in memory before upload to MinIO)
const memoryStorage = multer.memoryStorage();

// File filter for allowed file types
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow common document types
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/tiff',
    'image/bmp',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/json',
    'application/xml',
    'text/html',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents, images, and archives are allowed.'));
  }
};

// Configure multer based on storage type
const upload = multer({
  storage: USE_MINIO ? memoryStorage : storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB default for scans
  },
});

/**
 * Middleware to handle file upload with MinIO support
 * After multer processes the file, this middleware uploads it to MinIO if configured
 */
export const uploadWithMinio = (fieldName: string) => {
  return async (req: Request, res: any, next: any) => {
    // First, use multer to handle the multipart form data
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              error: 'File too large. Maximum size is 50MB.' 
            });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }

      // If using MinIO and a file was uploaded, upload it to MinIO
      if (USE_MINIO && req.file) {
        try {
          const file = req.file;
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const baseName = path.basename(file.originalname, ext);
          const minioPath = `documents/${timestamp}-${randomSuffix}-${baseName}${ext}`;

          // Upload to MinIO
          const uploadResult = await minioService.uploadFile(
            minioPath,
            file.buffer,
            {
              'Content-Type': file.mimetype,
              'Content-Length': file.size.toString(),
              'Original-Filename': file.originalname,
            }
          );

          // Modify the file object to include MinIO information
          (req.file as any).minioPath = minioPath;
          (req.file as any).minioEtag = uploadResult.etag;
          (req.file as any).storageType = 'minio';
          (req.file as any).path = minioPath; // Override path with MinIO path

          console.log(`File uploaded to MinIO: ${minioPath}`);
        } catch (error) {
          console.error('MinIO upload error:', error);
          return res.status(500).json({ 
            error: 'Failed to upload file to storage service' 
          });
        }
      } else if (req.file) {
        // Local storage - add storage type
        (req.file as any).storageType = 'local';
      }

      next();
    });
  };
};

/**
 * Helper function to get file stream based on storage type
 */
export const getFileStream = async (filePath: string, storageType: string = 'local') => {
  if (storageType === 'minio' || USE_MINIO) {
    return await minioService.downloadFile(filePath);
  } else {
    return fs.createReadStream(filePath);
  }
};

/**
 * Helper function to delete file based on storage type
 */
export const deleteFile = async (filePath: string, storageType: string = 'local') => {
  if (storageType === 'minio' || USE_MINIO) {
    await minioService.deleteFile(filePath);
  } else {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

/**
 * Helper function to check if file exists based on storage type
 */
export const fileExists = async (filePath: string, storageType: string = 'local'): Promise<boolean> => {
  if (storageType === 'minio' || USE_MINIO) {
    return await minioService.fileExists(filePath);
  } else {
    return fs.existsSync(filePath);
  }
};

// ── Media-specific upload (images + videos, 200MB limit) ───────

const mediaFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMediaTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'video/mp4',
    'video/webm',
    'video/x-msvideo',
    'video/quicktime',
  ];

  if (allowedMediaTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF) and videos (MP4, WebM, AVI, MOV) are allowed.'));
  }
};

const mediaUpload = multer({
  storage: USE_MINIO ? memoryStorage : storage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 209715200, // 200MB
  },
});

export const uploadMediaWithMinio = (fieldName: string) => {
  return async (req: Request, res: any, next: any) => {
    mediaUpload.single(fieldName)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: 'File too large. Maximum size for media is 200MB.',
            });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }

      if (USE_MINIO && req.file) {
        try {
          const file = req.file;
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const baseName = path.basename(file.originalname, ext);
          const minioPath = `media/${timestamp}-${randomSuffix}-${baseName}${ext}`;

          const uploadResult = await minioService.uploadFile(
            minioPath,
            file.buffer,
            {
              'Content-Type': file.mimetype,
              'Content-Length': file.size.toString(),
              'Original-Filename': file.originalname,
            }
          );

          (req.file as any).minioPath = minioPath;
          (req.file as any).minioEtag = uploadResult.etag;
          (req.file as any).storageType = 'minio';
          (req.file as any).path = minioPath;
        } catch (error) {
          console.error('MinIO media upload error:', error);
          return res.status(500).json({
            error: 'Failed to upload media file to storage service',
          });
        }
      } else if (req.file) {
        (req.file as any).storageType = 'local';
      }

      next();
    });
  };
};

export default upload;
