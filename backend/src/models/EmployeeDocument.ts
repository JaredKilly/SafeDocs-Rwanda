import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type HRCategory =
  | 'contract'
  | 'id_copy'
  | 'certificate'
  | 'performance_review'
  | 'onboarding'
  | 'medical'
  | 'payslip'
  | 'other';

interface EmployeeDocumentAttributes {
  id: number;
  employeeId: number;
  documentId: number;
  hrCategory: HRCategory;
  addedBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EmployeeDocumentCreationAttributes extends Optional<EmployeeDocumentAttributes, 'id'> {}

class EmployeeDocument extends Model<EmployeeDocumentAttributes, EmployeeDocumentCreationAttributes>
  implements EmployeeDocumentAttributes {
  public id!: number;
  public employeeId!: number;
  public documentId!: number;
  public hrCategory!: HRCategory;
  public addedBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmployeeDocument.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    documentId: { type: DataTypes.INTEGER, allowNull: false },
    hrCategory: {
      type: DataTypes.ENUM(
        'contract', 'id_copy', 'certificate', 'performance_review',
        'onboarding', 'medical', 'payslip', 'other'
      ),
      allowNull: false,
      defaultValue: 'other',
    },
    addedBy: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'employee_documents',
    timestamps: true,
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['documentId'] },
      { unique: true, fields: ['employeeId', 'documentId'] },
    ],
  }
);

export default EmployeeDocument;
