import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface GroupAttributes {
  id: number;
  name: string;
  description?: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupCreationAttributes extends Optional<GroupAttributes, 'id' | 'description'> {}

class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    description: {
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
    tableName: 'groups',
    timestamps: true,
  }
);

export default Group;
