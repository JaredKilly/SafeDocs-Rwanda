import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

interface ShareLinkAttributes {
  id: number;
  documentId: number;
  token: string;
  passwordHash?: string;
  accessLevel: 'viewer' | 'commenter';
  maxUses?: number;
  currentUses: number;
  allowDownload: boolean;
  createdBy: number;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  updatedAt?: Date;
}

interface ShareLinkCreationAttributes extends Optional<ShareLinkAttributes, 'id' | 'currentUses' | 'allowDownload' | 'isActive' | 'passwordHash' | 'maxUses'> {}

class ShareLink extends Model<ShareLinkAttributes, ShareLinkCreationAttributes> implements ShareLinkAttributes {
  public id!: number;
  public documentId!: number;
  public token!: string;
  public passwordHash?: string;
  public accessLevel!: 'viewer' | 'commenter';
  public maxUses?: number;
  public currentUses!: number;
  public allowDownload!: boolean;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public expiresAt!: Date;
  public isActive!: boolean;
  public readonly updatedAt!: Date;

  // Method to verify password
  public async verifyPassword(password: string): Promise<boolean> {
    if (!this.passwordHash) return true; // No password set
    return bcrypt.compare(password, this.passwordHash);
  }

  // Method to check if link is valid
  public isValid(): boolean {
    if (!this.isActive) return false;
    if (new Date() > this.expiresAt) return false;
    if (this.maxUses && this.currentUses >= this.maxUses) return false;
    return true;
  }

  // Method to increment use count
  public async incrementUses(): Promise<void> {
    this.currentUses += 1;
    await this.save();
  }
}

ShareLink.init(
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
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    accessLevel: {
      type: DataTypes.ENUM('viewer', 'commenter'),
      allowNull: false,
      defaultValue: 'viewer',
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currentUses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    allowDownload: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'share_links',
    timestamps: true,
    indexes: [
      {
        fields: ['token'],
      },
      {
        fields: ['documentId'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);

export default ShareLink;
