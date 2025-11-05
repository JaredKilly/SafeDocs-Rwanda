import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FolderAttributes {
  id: number;
  name: string;
  parentId?: number;
  path?: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FolderCreationAttributes extends Optional<FolderAttributes, 'id' | 'parentId' | 'path'> {}

class Folder extends Model<FolderAttributes, FolderCreationAttributes> implements FolderAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public path?: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Folder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'folders',
        key: 'id',
      },
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'folders',
    timestamps: true,
  }
);

export default Folder;
