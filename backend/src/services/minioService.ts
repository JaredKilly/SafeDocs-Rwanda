import * as Minio from 'minio';
import { Readable } from 'stream';

// MinIO Client Configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'safedocs';

/**
 * Initialize MinIO bucket if it doesn't exist
 */
export const initializeBucket = async (): Promise<void> => {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`MinIO bucket '${BUCKET_NAME}' created successfully`);
      
      // Set bucket policy to allow read access (optional, for public files)
      // You can customize this based on your security requirements
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/public/*`],
          },
        ],
      };
      // await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    } else {
      console.log(`MinIO bucket '${BUCKET_NAME}' already exists`);
    }
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
    throw error;
  }
};

/**
 * Upload a file to MinIO
 * @param filePath - The path/key where the file will be stored in MinIO
 * @param fileBuffer - The file buffer or readable stream
 * @param metadata - Optional metadata for the file
 * @returns The uploaded file's metadata
 */
export const uploadFile = async (
  filePath: string,
  fileBuffer: Buffer | Readable,
  metadata?: Record<string, string>
): Promise<{ etag: string; versionId?: string }> => {
  try {
    const metaData = {
      'Content-Type': metadata?.['Content-Type'] || 'application/octet-stream',
      ...metadata,
    };

    const size = metadata?.['Content-Length'] ? parseInt(metadata['Content-Length']) : undefined;
    
    const result = await minioClient.putObject(
      BUCKET_NAME,
      filePath,
      fileBuffer,
      size,
      metaData
    );

    return {
      etag: result.etag,
      versionId: result.versionId || undefined,
    };
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw error;
  }
};

/**
 * Download a file from MinIO
 * @param filePath - The path/key of the file in MinIO
 * @returns A readable stream of the file
 */
export const downloadFile = async (filePath: string): Promise<Readable> => {
  try {
    const stream = await minioClient.getObject(BUCKET_NAME, filePath);
    return stream;
  } catch (error) {
    console.error('Error downloading file from MinIO:', error);
    throw error;
  }
};

/**
 * Delete a file from MinIO
 * @param filePath - The path/key of the file to delete
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await minioClient.removeObject(BUCKET_NAME, filePath);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw error;
  }
};

/**
 * Check if a file exists in MinIO
 * @param filePath - The path/key of the file
 * @returns true if the file exists, false otherwise
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await minioClient.statObject(BUCKET_NAME, filePath);
    return true;
  } catch (error: any) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

/**
 * Get file metadata
 * @param filePath - The path/key of the file
 * @returns File metadata including size, etag, content-type, etc.
 */
export const getFileMetadata = async (
  filePath: string
): Promise<Minio.BucketItemStat> => {
  try {
    return await minioClient.statObject(BUCKET_NAME, filePath);
  } catch (error) {
    console.error('Error getting file metadata from MinIO:', error);
    throw error;
  }
};

/**
 * Generate a presigned URL for temporary file access
 * @param filePath - The path/key of the file
 * @param expirySeconds - Expiry time in seconds (default: 24 hours)
 * @returns A presigned URL
 */
export const generatePresignedUrl = async (
  filePath: string,
  expirySeconds: number = 86400
): Promise<string> => {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, filePath, expirySeconds);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * Copy a file within MinIO
 * @param sourceFilePath - Source file path
 * @param destinationFilePath - Destination file path
 */
export const copyFile = async (
  sourceFilePath: string,
  destinationFilePath: string
): Promise<void> => {
  try {
    const conditions = new Minio.CopyConditions();
    await minioClient.copyObject(
      BUCKET_NAME,
      destinationFilePath,
      `/${BUCKET_NAME}/${sourceFilePath}`,
      conditions
    );
  } catch (error) {
    console.error('Error copying file in MinIO:', error);
    throw error;
  }
};

/**
 * List files in a directory/prefix
 * @param prefix - The prefix/directory to list files from
 * @returns Array of file information
 */
export const listFiles = async (prefix: string = ''): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const files: any[] = [];
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);

    stream.on('data', (obj) => files.push(obj));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(files));
  });
};

/**
 * Get storage statistics
 * @returns Storage usage information
 */
export const getStorageStats = async (): Promise<{
  totalFiles: number;
  totalSize: number;
}> => {
  try {
    const files = await listFiles();
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    return {
      totalFiles: files.length,
      totalSize,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw error;
  }
};

export default {
  initializeBucket,
  uploadFile,
  downloadFile,
  deleteFile,
  fileExists,
  getFileMetadata,
  generatePresignedUrl,
  copyFile,
  listFiles,
  getStorageStats,
};
