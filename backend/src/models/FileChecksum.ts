import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FileChecksumAttributes {
  id: number;
  documentId: number;
  sha256Hash: string;
  algorithm: string;
  calculatedAt: Date;
  verifiedAt?: Date;
  verificationStatus: 'pending' | 'verified' | 'failed';
  createdAt: Date;
  updatedAt?: Date;
}

interface FileChecksumCreationAttributes extends Optional<FileChecksumAttributes, 'id' | 'algorithm' | 'verificationStatus' | 'verifiedAt'> {}

class FileChecksum extends Model<FileChecksumAttributes, FileChecksumCreationAttributes> implements FileChecksumAttributes {
  public id!: number;
  public documentId!: number;
  public sha256Hash!: string;
  public algorithm!: string;
  public calculatedAt!: Date;
  public verifiedAt?: Date;
  public verificationStatus!: 'pending' | 'verified' | 'failed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to mark as verified
  public async markVerified(): Promise<void> {
    this.verificationStatus = 'verified';
    this.verifiedAt = new Date();
    await this.save();
  }

  // Method to mark as failed
  public async markFailed(): Promise<void> {
    this.verificationStatus = 'failed';
    this.verifiedAt = new Date();
    await this.save();
  }
}

FileChecksum.init(
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
    sha256Hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    algorithm: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'SHA-256',
    },
    calculatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'verified', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'file_checksums',
    timestamps: true,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['verificationStatus'],
      },
    ],
  }
);

export default FileChecksum;
