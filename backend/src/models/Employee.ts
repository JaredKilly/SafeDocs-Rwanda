import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type EmployeeStatus = 'active' | 'inactive' | 'terminated';

interface EmployeeAttributes {
  id: number;
  employeeId: string;     // e.g. EMP-001
  fullName: string;
  department: string;
  position: string;
  email?: string;
  phone?: string;
  startDate?: Date;
  endDate?: Date;
  status: EmployeeStatus;
  notes?: string;
  createdBy: number;
  organizationId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EmployeeCreationAttributes extends Optional<
  EmployeeAttributes,
  'id' | 'email' | 'phone' | 'startDate' | 'endDate' | 'notes' | 'status' | 'organizationId'
> {}

class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes {
  public id!: number;
  public employeeId!: string;
  public fullName!: string;
  public department!: string;
  public position!: string;
  public email?: string;
  public phone?: string;
  public startDate?: Date;
  public endDate?: Date;
  public status!: EmployeeStatus;
  public notes?: string;
  public createdBy!: number;
  public organizationId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    fullName: { type: DataTypes.STRING(255), allowNull: false },
    department: { type: DataTypes.STRING(150), allowNull: false },
    position: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: true },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    startDate: { type: DataTypes.DATEONLY, allowNull: true },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'terminated'),
      allowNull: false,
      defaultValue: 'active',
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'organizations', key: 'id' },
    },
  },
  {
    sequelize,
    tableName: 'employees',
    timestamps: true,
  }
);

export default Employee;
