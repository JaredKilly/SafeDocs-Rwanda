import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface GroupMemberAttributes {
  groupId: number;
  userId: number;
  role: 'admin' | 'member';
  addedAt: Date;
}

interface GroupMemberCreationAttributes extends Optional<GroupMemberAttributes, 'role' | 'addedAt'> {}

class GroupMember extends Model<GroupMemberAttributes, GroupMemberCreationAttributes> implements GroupMemberAttributes {
  public groupId!: number;
  public userId!: number;
  public role!: 'admin' | 'member';
  public readonly addedAt!: Date;
}

GroupMember.init(
  {
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'groups',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      allowNull: false,
      defaultValue: 'member',
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'group_members',
    timestamps: false,
  }
);

export default GroupMember;
