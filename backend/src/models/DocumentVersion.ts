import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DocumentVersionAttributes {
  id: number;
  documentId: number;
  versionNumber: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType?: string;
  storageType: 'local' | 'minio';
  uploadedBy?: number;
  changeNote?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentVersionCreationAttributes
  extends Optional<DocumentVersionAttributes, 'id' | 'versionNumber' | 'storageType'> {}

class DocumentVersion
  extends Model<DocumentVersionAttributes, DocumentVersionCreationAttributes>
  implements DocumentVersionAttributes
{
  public id!: number;
  public documentId!: number;
  public versionNumber!: number;
  public fileName!: string;
  public filePath!: string;
  public fileSize!: number;
  public mimeType?: string;
  public storageType!: 'local' | 'minio';
  public uploadedBy?: number;
  public changeNote?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DocumentVersion.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    documentId: { type: DataTypes.INTEGER, allowNull: false },
    versionNumber: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    fileName: { type: DataTypes.STRING(500), allowNull: false },
    filePath: { type: DataTypes.STRING(1000), allowNull: false },
    fileSize: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    mimeType: { type: DataTypes.STRING(255), allowNull: true },
    storageType: {
      type: DataTypes.ENUM('local', 'minio'),
      allowNull: false,
      defaultValue: 'local',
    },
    uploadedBy: { type: DataTypes.INTEGER, allowNull: true },
    changeNote: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: 'document_versions',
    timestamps: true,
  }
);

export default DocumentVersion;
