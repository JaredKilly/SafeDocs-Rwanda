import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EncryptionMetadataAttributes {
  id: number;
  documentId: number;
  encryptionAlgorithm: string;
  kmsKeyId: string;
  encryptedDataKey: string;
  iv: string;
  authTag?: string;
  encryptedAt: Date;
  keyVersion: number;
  createdAt: Date;
  updatedAt?: Date;
}

interface EncryptionMetadataCreationAttributes extends Optional<EncryptionMetadataAttributes, 'id' | 'encryptionAlgorithm' | 'keyVersion' | 'authTag'> {}

class EncryptionMetadata extends Model<EncryptionMetadataAttributes, EncryptionMetadataCreationAttributes> implements EncryptionMetadataAttributes {
  public id!: number;
  public documentId!: number;
  public encryptionAlgorithm!: string;
  public kmsKeyId!: string;
  public encryptedDataKey!: string;
  public iv!: string;
  public authTag?: string;
  public encryptedAt!: Date;
  public keyVersion!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EncryptionMetadata.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'documents',
        key: 'id',
      },
    },
    encryptionAlgorithm: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'AES-256-GCM',
    },
    kmsKeyId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'AWS KMS Key ID',
    },
    encryptedDataKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Encrypted data encryption key (base64)',
    },
    iv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Initialization vector (base64)',
    },
    authTag: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Authentication tag for GCM mode (base64)',
    },
    encryptedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    keyVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'encryption_metadata',
    timestamps: true,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['kmsKeyId'],
      },
    ],
  }
);

export default EncryptionMetadata;
