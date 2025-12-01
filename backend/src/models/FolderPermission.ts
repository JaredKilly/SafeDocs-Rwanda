import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { PermissionType, AccessLevel } from './DocumentPermission';

interface FolderPermissionAttributes {
  id: number;
  folderId: number;
  permissionType: PermissionType;
  permissionTargetId: string;
  accessLevel: AccessLevel;
  inheritToChildren: boolean;
  grantedBy: number;
  grantedAt: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FolderPermissionCreationAttributes extends Optional<FolderPermissionAttributes, 'id' | 'inheritToChildren' | 'expiresAt'> {}

class FolderPermission extends Model<FolderPermissionAttributes, FolderPermissionCreationAttributes> implements FolderPermissionAttributes {
  public id!: number;
  public folderId!: number;
  public permissionType!: PermissionType;
  public permissionTargetId!: string;
  public accessLevel!: AccessLevel;
  public inheritToChildren!: boolean;
  public grantedBy!: number;
  public grantedAt!: Date;
  public expiresAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FolderPermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    folderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'folders',
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
    inheritToChildren: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  },
  {
    sequelize,
    tableName: 'folder_permissions',
    timestamps: true,
    indexes: [
      {
        fields: ['folderId'],
      },
      {
        fields: ['permissionType', 'permissionTargetId'],
      },
    ],
  }
);

export default FolderPermission;
