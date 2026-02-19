import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WaitlistAttributes {
  id: number;
  email: string;
  name?: string;
  createdAt?: Date;
}

interface WaitlistCreationAttributes extends Optional<WaitlistAttributes, 'id' | 'name'> {}

class Waitlist
  extends Model<WaitlistAttributes, WaitlistCreationAttributes>
  implements WaitlistAttributes
{
  public id!: number;
  public email!: string;
  public name?: string;
  public readonly createdAt!: Date;
}

Waitlist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'waitlist',
    timestamps: true,
    updatedAt: false,
  }
);

export default Waitlist;
