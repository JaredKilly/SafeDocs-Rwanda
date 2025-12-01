import { KMSClient, GenerateDataKeyCommand, DecryptCommand } from '@aws-sdk/client-kms';
import crypto from 'crypto';
import { EncryptionMetadata, FileChecksum } from '../models';

// Initialize AWS KMS Client
const kmsClient = new KMSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const KMS_KEY_ID = process.env.AWS_KMS_KEY_ID || '';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Generate a data encryption key using AWS KMS
 * Uses envelope encryption pattern
 */
export const generateDataKey = async (): Promise<{
  plainTextKey: Buffer;
  encryptedKey: string;
  kmsKeyId: string;
}> => {
  try {
    const command = new GenerateDataKeyCommand({
      KeyId: KMS_KEY_ID,
      KeySpec: 'AES_256',
    });

    const response = await kmsClient.send(command);

    if (!response.Plaintext || !response.CiphertextBlob) {
      throw new Error('Failed to generate data key from KMS');
    }

    return {
      plainTextKey: Buffer.from(response.Plaintext),
      encryptedKey: Buffer.from(response.CiphertextBlob).toString('base64'),
      kmsKeyId: KMS_KEY_ID,
    };
  } catch (error) {
    console.error('Error generating data key:', error);
    throw new Error('Failed to generate encryption key');
  }
};

/**
 * Decrypt a data encryption key using AWS KMS
 */
export const decryptDataKey = async (encryptedKey: string): Promise<Buffer> => {
  try {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
      KeyId: KMS_KEY_ID,
    });

    const response = await kmsClient.send(command);

    if (!response.Plaintext) {
      throw new Error('Failed to decrypt data key from KMS');
    }

    return Buffer.from(response.Plaintext);
  } catch (error) {
    console.error('Error decrypting data key:', error);
    throw new Error('Failed to decrypt encryption key');
  }
};

/**
 * Calculate SHA-256 checksum of a buffer
 */
export const calculateChecksum = (buffer: Buffer): string => {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
};

/**
 * Verify checksum of a buffer
 */
export const verifyChecksum = (buffer: Buffer, expectedChecksum: string): boolean => {
  const actualChecksum = calculateChecksum(buffer);
  return actualChecksum === expectedChecksum;
};

/**
 * Encrypt file buffer using AES-256-GCM with envelope encryption
 */
export const encryptFile = async (
  fileBuffer: Buffer,
  documentId: number
): Promise<{
  encryptedBuffer: Buffer;
  encryptionMetadata: {
    kmsKeyId: string;
    encryptedDataKey: string;
    iv: string;
    authTag: string;
    algorithm: string;
  };
  checksum: string;
}> => {
  try {
    // Calculate checksum of original file
    const checksum = calculateChecksum(fileBuffer);

    // Generate data encryption key from KMS
    const { plainTextKey, encryptedKey, kmsKeyId } = await generateDataKey();

    // Generate random IV
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, plainTextKey, iv);

    // Encrypt the file
    const encryptedChunks: Buffer[] = [];
    encryptedChunks.push(cipher.update(fileBuffer));
    encryptedChunks.push(cipher.final());

    const encryptedBuffer = Buffer.concat(encryptedChunks);
    const authTag = cipher.getAuthTag();

    // Clear plaintext key from memory
    plainTextKey.fill(0);

    // Store encryption metadata
    await EncryptionMetadata.create({
      documentId,
      encryptionAlgorithm: ENCRYPTION_ALGORITHM,
      kmsKeyId,
      encryptedDataKey: encryptedKey,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      encryptedAt: new Date(),
      keyVersion: 1,
      createdAt: new Date(),
    });

    // Store checksum
    await FileChecksum.create({
      documentId,
      sha256Hash: checksum,
      algorithm: 'SHA-256',
      calculatedAt: new Date(),
      verificationStatus: 'pending',
      createdAt: new Date(),
    });

    console.log(`File encrypted for document ${documentId}`);

    return {
      encryptedBuffer,
      encryptionMetadata: {
        kmsKeyId,
        encryptedDataKey: encryptedKey,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        algorithm: ENCRYPTION_ALGORITHM,
      },
      checksum,
    };
  } catch (error) {
    console.error('Error encrypting file:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Decrypt file buffer using stored encryption metadata
 */
export const decryptFile = async (
  encryptedBuffer: Buffer,
  documentId: number
): Promise<Buffer> => {
  try {
    // Get encryption metadata
    const encryptionMeta = await EncryptionMetadata.findOne({
      where: { documentId },
    });

    if (!encryptionMeta) {
      throw new Error('Encryption metadata not found');
    }

    // Decrypt the data key using KMS
    const plainTextKey = await decryptDataKey(encryptionMeta.encryptedDataKey);

    // Prepare decryption
    const iv = Buffer.from(encryptionMeta.iv, 'base64');
    const authTag = Buffer.from(encryptionMeta.authTag || '', 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(
      encryptionMeta.encryptionAlgorithm,
      plainTextKey,
      iv
    ) as crypto.DecipherGCM;
    decipher.setAuthTag(authTag);

    // Decrypt the file
    const decryptedChunks: Buffer[] = [];
    decryptedChunks.push(decipher.update(encryptedBuffer));
    decryptedChunks.push(decipher.final());

    const decryptedBuffer = Buffer.concat(decryptedChunks);

    // Clear plaintext key from memory
    plainTextKey.fill(0);

    // Verify checksum
    const checksumRecord = await FileChecksum.findOne({
      where: { documentId },
    });

    if (checksumRecord) {
      const isValid = verifyChecksum(decryptedBuffer, checksumRecord.sha256Hash);
      if (!isValid) {
        console.error(`Checksum verification failed for document ${documentId}`);
        await checksumRecord.markFailed();
        throw new Error('File integrity check failed');
      }
      await checksumRecord.markVerified();
    }

    console.log(`File decrypted for document ${documentId}`);

    return decryptedBuffer;
  } catch (error) {
    console.error('Error decrypting file:', error);
    throw new Error('Failed to decrypt file');
  }
};

/**
 * Re-encrypt file with a new key (for key rotation)
 */
export const rotateEncryptionKey = async (documentId: number): Promise<void> => {
  try {
    // This would involve:
    // 1. Decrypt file with old key
    // 2. Encrypt with new key
    // 3. Update encryption metadata
    // 4. Increment key version
    console.log(`Key rotation for document ${documentId} - To be implemented`);
    throw new Error('Key rotation not yet implemented');
  } catch (error) {
    console.error('Error rotating encryption key:', error);
    throw error;
  }
};

/**
 * Verify file integrity without decrypting
 */
export const verifyFileIntegrity = async (
  fileBuffer: Buffer,
  documentId: number
): Promise<boolean> => {
  try {
    const checksumRecord = await FileChecksum.findOne({
      where: { documentId },
    });

    if (!checksumRecord) {
      console.error(`No checksum found for document ${documentId}`);
      return false;
    }

    // For encrypted files, we need to decrypt first before verifying
    // This is a limitation of the current approach
    // In production, you might store checksums of encrypted data separately
    const isValid = verifyChecksum(fileBuffer, checksumRecord.sha256Hash);

    if (isValid) {
      await checksumRecord.markVerified();
    } else {
      await checksumRecord.markFailed();
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying file integrity:', error);
    return false;
  }
};

export default {
  generateDataKey,
  decryptDataKey,
  calculateChecksum,
  verifyChecksum,
  encryptFile,
  decryptFile,
  rotateEncryptionKey,
  verifyFileIntegrity,
};
