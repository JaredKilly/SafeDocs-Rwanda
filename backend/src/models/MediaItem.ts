import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MediaItemAttributes {
  id: number;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  mediaType: 'image' | 'video';
  storageType: 'local' | 'minio';
  thumbnailPath?: string;
  width?: number;
  height?: number;
  duration?: number;
  category: 'general' | 'marketing' | 'training' | 'event' | 'documentation' | 'other';
  tags: string[];
  uploadedBy: number;
  isDeleted: boolean;
  metadata?: object;
  organizationId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MediaItemCreationAttributes extends Optional<MediaItemAttributes, 'id' | 'description' | 'thumbnailPath' | 'width' | 'height' | 'duration' | 'category' | 'tags' | 'isDeleted' | 'metadata' | 'storageType' | 'organizationId'> {}

class MediaItem extends Model<MediaItemAttributes, MediaItemCreationAttributes> implements MediaItemAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public fileName!: string;
  public filePath!: string;
  public fileSize!: number;
  public mimeType!: string;
  public mediaType!: 'image' | 'video';
  public storageType!: 'local' | 'minio';
  public thumbnailPath?: string;
  public width?: number;
  public height?: number;
  public duration?: number;
  public category!: 'general' | 'marketing' | 'training' | 'event' | 'documentation' | 'other';
  public tags!: string[];
  public uploadedBy!: number;
  public isDeleted!: boolean;
  public metadata?: object;
  public organizationId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MediaItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fileName: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { notEmpty: true },
    },
    filePath: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      validate: { notEmpty: true },
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
    },
    storageType: {
      type: DataTypes.ENUM('local', 'minio'),
      allowNull: false,
      defaultValue: 'local',
    },
    thumbnailPath: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('general', 'marketing', 'training', 'event', 'documentation', 'other'),
      allowNull: false,
      defaultValue: 'general',
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'media_items',
    timestamps: true,
    indexes: [
      { fields: ['mediaType'] },
      { fields: ['category'] },
      { fields: ['uploadedBy'] },
      { fields: ['isDeleted'] },
    ],
  }
);

export default MediaItem;
