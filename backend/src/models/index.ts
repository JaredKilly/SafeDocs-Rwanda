import User from './User';
import Folder from './Folder';
import Document from './Document';
import Tag from './Tag';
import AuditLog from './AuditLog';

// User relationships
User.hasMany(Folder, { foreignKey: 'createdBy', as: 'folders' });
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

// Folder relationships
Folder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' });
Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'children' });
Folder.hasMany(Document, { foreignKey: 'folderId', as: 'documents' });

// Document relationships
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Document.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });
Document.belongsToMany(Tag, { through: 'document_tags', foreignKey: 'documentId', otherKey: 'tagId', as: 'tags' });
Document.hasMany(AuditLog, { foreignKey: 'documentId', as: 'auditLogs' });

// Tag relationships
Tag.belongsToMany(Document, { through: 'document_tags', foreignKey: 'tagId', otherKey: 'documentId', as: 'documents' });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AuditLog.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

export { User, Folder, Document, Tag, AuditLog };

export const syncDatabase = async (force: boolean = false) => {
  try {
    await User.sync({ force });
    await Folder.sync({ force });
    await Tag.sync({ force });
    await Document.sync({ force });
    await AuditLog.sync({ force });
    console.log('✅ All models synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
    throw error;
  }
};
