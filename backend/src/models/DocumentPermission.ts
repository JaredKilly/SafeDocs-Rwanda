import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type PermissionType = 'user' | 'group' | 'role';
export type AccessLevel = 'viewer' | 'commenter' | 'editor' | 'owner';

interface DocumentPermissionAttributes {
  id: number;
  documentId: number;
  permissionType: PermissionType;
  permissionTargetId: string;
  accessLevel: AccessLevel;
  grantedBy: number;
  grantedAt: Date;
  expiresAt?: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentPermissionCreationAttributes extends Optional<DocumentPermissionAttributes, 'id' | 'isRevoked' | 'expiresAt' | 'revokedAt' | 'revokedBy'> {}

class DocumentPermission extends Model<DocumentPermissionAttributes, DocumentPermissionCreationAttributes> implements DocumentPermissionAttributes {
  public id!: number;
  public documentId!: number;
  public permissionType!: PermissionType;
  public permissionTargetId!: string;
  public accessLevel!: AccessLevel;
  public grantedBy!: number;
  public grantedAt!: Date;
  public expiresAt?: Date;
  public isRevoked!: boolean;
  public revokedAt?: Date;
  public revokedBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DocumentPermission.init(
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
    permissionType: {
      type: DataTypes.ENUM('user', 'group', 'role'),
      allowNull: false,
    },
    permissionTargetId: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    accessLevel: {
      type: DataTypes.ENUM('viewer', 'commenter', 'editor', 'owner'),
      allowNull: false,
    },
    grantedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    grantedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revokedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'document_permissions',
    timestamps: true,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['permissionType', 'permissionTargetId'],
      },
      {
        fields: ['isRevoked'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);

export default DocumentPermission;
