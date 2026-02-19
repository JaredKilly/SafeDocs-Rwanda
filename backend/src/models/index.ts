import sequelize from '../config/database';
import User from './User';
import Folder from './Folder';
import Document from './Document';
import Tag from './Tag';
import AuditLog from './AuditLog';
import Group from './Group';
import GroupMember from './GroupMember';
import DocumentPermission from './DocumentPermission';
import FolderPermission from './FolderPermission';
import ShareLink from './ShareLink';
import AccessRequest from './AccessRequest';
import FileChecksum from './FileChecksum';
import EncryptionMetadata from './EncryptionMetadata';
import DocumentVersion from './DocumentVersion';
import Employee from './Employee';
import EmployeeDocument from './EmployeeDocument';
import MediaItem from './MediaItem';
import Organization from './Organization';
import Notification from './Notification';
import Waitlist from './Waitlist';

// Organization relationships
Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });
Organization.hasMany(Document, { foreignKey: 'organizationId', as: 'documents' });
Organization.hasMany(Folder, { foreignKey: 'organizationId', as: 'folders' });
Organization.hasMany(MediaItem, { foreignKey: 'organizationId', as: 'mediaItems' });
Organization.hasMany(Employee, { foreignKey: 'organizationId', as: 'employees' });

// User relationships
User.hasMany(Folder, { foreignKey: 'createdBy', as: 'folders' });
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
User.hasMany(Group, { foreignKey: 'createdBy', as: 'createdGroups' });
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId', otherKey: 'groupId', as: 'groups' });
User.hasMany(DocumentPermission, { foreignKey: 'grantedBy', as: 'grantedPermissions' });
User.hasMany(ShareLink, { foreignKey: 'createdBy', as: 'shareLinks' });
User.hasMany(AccessRequest, { foreignKey: 'requesterId', as: 'accessRequests' });
User.hasMany(Employee, { foreignKey: 'createdBy', as: 'employeesCreated' });
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Folder relationships
Folder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' });
Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'children' });
Folder.hasMany(Document, { foreignKey: 'folderId', as: 'documents' });
Folder.hasMany(FolderPermission, { foreignKey: 'folderId', as: 'permissions' });
Folder.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Document relationships
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Document.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });
Document.belongsToMany(Tag, { through: 'document_tags', foreignKey: 'documentId', otherKey: 'tagId', as: 'tags' });
Document.hasMany(AuditLog, { foreignKey: 'documentId', as: 'auditLogs' });
Document.hasMany(DocumentPermission, { foreignKey: 'documentId', as: 'permissions' });
Document.hasMany(ShareLink, { foreignKey: 'documentId', as: 'shareLinks' });
Document.hasMany(AccessRequest, { foreignKey: 'documentId', as: 'accessRequests' });
Document.hasOne(FileChecksum, { foreignKey: 'documentId', as: 'checksum' });
Document.hasOne(EncryptionMetadata, { foreignKey: 'documentId', as: 'encryption' });
Document.hasMany(DocumentVersion, { foreignKey: 'documentId', as: 'versions' });
Document.belongsToMany(Employee, { through: EmployeeDocument, foreignKey: 'documentId', otherKey: 'employeeId', as: 'linkedEmployees' });
Document.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
DocumentVersion.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
DocumentVersion.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// Tag relationships
Tag.belongsToMany(Document, { through: 'document_tags', foreignKey: 'tagId', otherKey: 'documentId', as: 'documents' });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AuditLog.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

// Group relationships
Group.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', otherKey: 'userId', as: 'members' });

// DocumentPermission relationships
DocumentPermission.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
DocumentPermission.belongsTo(User, { foreignKey: 'grantedBy', as: 'grantor' });

// FolderPermission relationships
FolderPermission.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });
FolderPermission.belongsTo(User, { foreignKey: 'grantedBy', as: 'grantor' });

// ShareLink relationships
ShareLink.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
ShareLink.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// AccessRequest relationships
AccessRequest.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
AccessRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
AccessRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// FileChecksum relationships
FileChecksum.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

// EncryptionMetadata relationships
EncryptionMetadata.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

// Employee relationships
Employee.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Employee.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Employee.belongsToMany(Document, { through: EmployeeDocument, foreignKey: 'employeeId', otherKey: 'documentId', as: 'documents' });
Employee.hasMany(EmployeeDocument, { foreignKey: 'employeeId', as: 'employeeDocuments' });

// EmployeeDocument relationships
EmployeeDocument.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
EmployeeDocument.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
EmployeeDocument.belongsTo(User, { foreignKey: 'addedBy', as: 'addedByUser' });

// MediaItem relationships
MediaItem.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
MediaItem.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
User.hasMany(MediaItem, { foreignKey: 'uploadedBy', as: 'mediaItems' });

// Notification relationships
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });

export {
  User,
  Folder,
  Document,
  Tag,
  AuditLog,
  Group,
  GroupMember,
  DocumentPermission,
  FolderPermission,
  ShareLink,
  AccessRequest,
  FileChecksum,
  EncryptionMetadata,
  DocumentVersion,
  Employee,
  EmployeeDocument,
  MediaItem,
  Organization,
  Notification,
  Waitlist,
};

export const syncDatabase = async (force: boolean = false) => {
  const opts = { force };
  try {
    // Sync all tables — creates tables that don't exist, no destructive alters
    await Organization.sync(opts);
    await User.sync(opts);
    await Group.sync(opts);
    await GroupMember.sync(opts);
    await Folder.sync(opts);
    await FolderPermission.sync(opts);
    await Tag.sync(opts);
    await Document.sync(opts);
    await DocumentPermission.sync(opts);
    await ShareLink.sync(opts);
    await AccessRequest.sync(opts);
    await FileChecksum.sync(opts);
    await EncryptionMetadata.sync(opts);
    await DocumentVersion.sync(opts);
    await AuditLog.sync(opts);
    await Employee.sync(opts);
    await EmployeeDocument.sync(opts);
    await MediaItem.sync(opts);
    await Notification.sync(opts);
    await Waitlist.sync(opts);

    // Safe idempotent column patches — ADD COLUMN IF NOT EXISTS never fails on re-run
    if (!force) {
      await sequelize.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0`
      );
      await sequelize.query(
        `ALTER TABLE documents ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP WITH TIME ZONE`
      );
      // Organization multi-tenancy columns
      await sequelize.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS "organizationId" INTEGER REFERENCES organizations(id)`
      );
      await sequelize.query(
        `ALTER TABLE documents ADD COLUMN IF NOT EXISTS "organizationId" INTEGER REFERENCES organizations(id)`
      );
      await sequelize.query(
        `ALTER TABLE folders ADD COLUMN IF NOT EXISTS "organizationId" INTEGER REFERENCES organizations(id)`
      );
      await sequelize.query(
        `ALTER TABLE media_items ADD COLUMN IF NOT EXISTS "organizationId" INTEGER REFERENCES organizations(id)`
      );
      await sequelize.query(
        `ALTER TABLE employees ADD COLUMN IF NOT EXISTS "organizationId" INTEGER REFERENCES organizations(id)`
      );
    }

    console.log('✅ All models synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
    throw error;
  }
};
