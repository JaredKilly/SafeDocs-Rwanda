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

// User relationships
User.hasMany(Folder, { foreignKey: 'createdBy', as: 'folders' });
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
User.hasMany(Group, { foreignKey: 'createdBy', as: 'createdGroups' });
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId', otherKey: 'groupId', as: 'groups' });
User.hasMany(DocumentPermission, { foreignKey: 'grantedBy', as: 'grantedPermissions' });
User.hasMany(ShareLink, { foreignKey: 'createdBy', as: 'shareLinks' });
User.hasMany(AccessRequest, { foreignKey: 'requesterId', as: 'accessRequests' });

// Folder relationships
Folder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' });
Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'children' });
Folder.hasMany(Document, { foreignKey: 'folderId', as: 'documents' });
Folder.hasMany(FolderPermission, { foreignKey: 'folderId', as: 'permissions' });

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
  EncryptionMetadata
};

export const syncDatabase = async (force: boolean = false) => {
  try {
    await User.sync({ force });
    await Group.sync({ force });
    await GroupMember.sync({ force });
    await Folder.sync({ force });
    await FolderPermission.sync({ force });
    await Tag.sync({ force });
    await Document.sync({ force });
    await DocumentPermission.sync({ force });
    await ShareLink.sync({ force });
    await AccessRequest.sync({ force });
    await FileChecksum.sync({ force });
    await EncryptionMetadata.sync({ force });
    await AuditLog.sync({ force });
    console.log('✅ All models synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
    throw error;
  }
};
