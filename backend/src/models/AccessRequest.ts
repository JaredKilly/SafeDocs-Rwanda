import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AccessRequestAttributes {
  id: number;
  documentId: number;
  requesterId: number;
  requestedAccess: 'viewer' | 'commenter' | 'editor';
  message?: string;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: number;
  reviewedAt?: Date;
  responseMessage?: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface AccessRequestCreationAttributes extends Optional<AccessRequestAttributes, 'id' | 'status' | 'message' | 'reviewedBy' | 'reviewedAt' | 'responseMessage'> {}

class AccessRequest extends Model<AccessRequestAttributes, AccessRequestCreationAttributes> implements AccessRequestAttributes {
  public id!: number;
  public documentId!: number;
  public requesterId!: number;
  public requestedAccess!: 'viewer' | 'commenter' | 'editor';
  public message?: string;
  public status!: 'pending' | 'approved' | 'denied';
  public reviewedBy?: number;
  public reviewedAt?: Date;
  public responseMessage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to approve request
  public async approve(reviewerId: number, responseMessage?: string): Promise<void> {
    this.status = 'approved';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.responseMessage = responseMessage;
    await this.save();
  }

  // Method to deny request
  public async deny(reviewerId: number, responseMessage?: string): Promise<void> {
    this.status = 'denied';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.responseMessage = responseMessage;
    await this.save();
  }
}

AccessRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'documents',
        key: 'id',
      },
    },
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    requestedAccess: {
      type: DataTypes.ENUM('viewer', 'commenter', 'editor'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'denied'),
      allowNull: false,
      defaultValue: 'pending',
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    responseMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'access_requests',
    timestamps: true,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['requesterId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default AccessRequest;
