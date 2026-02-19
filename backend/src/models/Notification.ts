import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NotificationAttributes {
  id: number;
  recipientId: number;
  type: string;
  title: string;
  message?: string;
  isRead: boolean;
  relatedId?: number;
  relatedType?: string;
  actorId?: number;
  createdAt?: Date;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'id' | 'message' | 'isRead' | 'relatedId' | 'relatedType' | 'actorId'> {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public recipientId!: number;
  public type!: string;
  public title!: string;
  public message?: string;
  public isRead!: boolean;
  public relatedId?: number;
  public relatedType?: string;
  public actorId?: number;
  public readonly createdAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    relatedType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['recipientId', 'isRead'] },
      { fields: ['recipientId', 'createdAt'] },
    ],
  }
);

export default Notification;
