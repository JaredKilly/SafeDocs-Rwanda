import { DocumentPermission, FolderPermission, GroupMember, User, Document, Folder } from '../models';
import { Op } from 'sequelize';

export enum AccessLevel {
  VIEWER = 'viewer',
  COMMENTER = 'commenter',
  EDITOR = 'editor',
  OWNER = 'owner'
}

export enum PermissionType {
  USER = 'user',
  GROUP = 'group',
  ROLE = 'role'
}

// Access level hierarchy for comparison
const ACCESS_HIERARCHY: { [key: string]: number } = {
  [AccessLevel.VIEWER]: 1,
  [AccessLevel.COMMENTER]: 2,
  [AccessLevel.EDITOR]: 3,
  [AccessLevel.OWNER]: 4
};

const notExpired = {
  [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
};

/**
 * Check if user has required access level to a document
 */
export async function checkDocumentPermission(
  userId: number,
  documentId: number,
  requiredLevel: AccessLevel
): Promise<boolean> {
  try {
    const effectiveLevel = await getUserDocumentAccessLevel(userId, documentId);
    
    if (!effectiveLevel) {
      return false;
    }

    return ACCESS_HIERARCHY[effectiveLevel] >= ACCESS_HIERARCHY[requiredLevel];
  } catch (error) {
    console.error('Check document permission error:', error);
    return false;
  }
}

/**
 * Check if user has required access level to a folder
 */
export async function checkFolderPermission(
  userId: number,
  folderId: number,
  requiredLevel: AccessLevel
): Promise<boolean> {
  try {
    const effectiveLevel = await getUserFolderAccessLevel(userId, folderId);
    
    if (!effectiveLevel) {
      return false;
    }

    return ACCESS_HIERARCHY[effectiveLevel] >= ACCESS_HIERARCHY[requiredLevel];
  } catch (error) {
    console.error('Check folder permission error:', error);
    return false;
  }
}

/**
 * Get user's effective access level to a document
 */
export async function getUserDocumentAccessLevel(
  userId: number,
  documentId: number
): Promise<AccessLevel | null> {
  try {
    // Check if user is the document owner
    const document = await Document.findByPk(documentId);
    if (document && document.uploadedBy === userId) {
      return AccessLevel.OWNER;
    }

    // Get user details for role-based checks
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    // Admin and manager users have owner access to everything
    if (user.role === 'admin' || user.role === 'manager') {
      return AccessLevel.OWNER;
    }

    const permissions: AccessLevel[] = [];

    // 1. Check direct user permissions (not expired and not revoked)
    const directPermission = await DocumentPermission.findOne({
      where: {
        documentId,
        permissionType: PermissionType.USER,
        permissionTargetId: userId.toString(),
        isRevoked: false,
        ...notExpired,
      }
    });

    if (directPermission) {
      permissions.push(directPermission.accessLevel as AccessLevel);
    }

    // 2. Check group permissions
    const userGroups = await GroupMember.findAll({
      where: { userId },
      attributes: ['groupId']
    });

    if (userGroups.length > 0) {
      const groupIds = userGroups.map(gm => gm.groupId.toString());
      
      const groupPermissions = await DocumentPermission.findAll({
        where: {
          documentId,
          permissionType: PermissionType.GROUP,
          permissionTargetId: { [Op.in]: groupIds },
          isRevoked: false,
          ...notExpired,
        }
      });

      groupPermissions.forEach(gp => {
        permissions.push(gp.accessLevel as AccessLevel);
      });
    }

    // 3. Check role-based permissions
    const rolePermission = await DocumentPermission.findOne({
      where: {
        documentId,
        permissionType: PermissionType.ROLE,
        permissionTargetId: user.role,
        isRevoked: false,
        ...notExpired,
      }
    });

    if (rolePermission) {
      permissions.push(rolePermission.accessLevel as AccessLevel);
    }

    // 4. Check inherited folder permissions
    if (document?.folderId) {
      const folderLevel = await getUserFolderAccessLevel(userId, document.folderId);
      if (folderLevel) {
        permissions.push(folderLevel);
      }
    }

    // Return highest access level
    return permissions.length > 0 ? resolveHighestAccessLevel(permissions) : null;
  } catch (error) {
    console.error('Get user document access level error:', error);
    return null;
  }
}

/**
 * Get user's effective access level to a folder
 */
export async function getUserFolderAccessLevel(
  userId: number,
  folderId: number
): Promise<AccessLevel | null> {
  try {
    // Check if user created the folder
    const folder = await Folder.findByPk(folderId);
    if (folder && folder.createdBy === userId) {
      return AccessLevel.OWNER;
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    // Admin and manager users have owner access
    if (user.role === 'admin' || user.role === 'manager') {
      return AccessLevel.OWNER;
    }

    const permissions: AccessLevel[] = [];

    // 1. Check direct user permissions (not expired)
    const directPermission = await FolderPermission.findOne({
      where: {
        folderId,
        permissionType: PermissionType.USER,
        permissionTargetId: userId.toString(),
        ...notExpired,
      }
    });

    if (directPermission) {
      permissions.push(directPermission.accessLevel as AccessLevel);
    }

    // 2. Check group permissions
    const userGroups = await GroupMember.findAll({
      where: { userId },
      attributes: ['groupId']
    });

    if (userGroups.length > 0) {
      const groupIds = userGroups.map(gm => gm.groupId.toString());
      
      const groupPermissions = await FolderPermission.findAll({
        where: {
          folderId,
          permissionType: PermissionType.GROUP,
          permissionTargetId: { [Op.in]: groupIds },
          ...notExpired,
        }
      });

      groupPermissions.forEach(gp => {
        permissions.push(gp.accessLevel as AccessLevel);
      });
    }

    // 3. Check role-based permissions
    const rolePermission = await FolderPermission.findOne({
      where: {
        folderId,
        permissionType: PermissionType.ROLE,
        permissionTargetId: user.role,
        ...notExpired,
      }
    });

    if (rolePermission) {
      permissions.push(rolePermission.accessLevel as AccessLevel);
    }

    // 4. Check parent folder permissions (inheritance)
    if (folder?.parentId) {
      const parentLevel = await getUserFolderAccessLevel(userId, folder.parentId);
      if (parentLevel) {
        permissions.push(parentLevel);
      }
    }

    // Return highest access level
    return permissions.length > 0 ? resolveHighestAccessLevel(permissions) : null;
  } catch (error) {
    console.error('Get user folder access level error:', error);
    return null;
  }
}

/**
 * Resolve the highest access level from an array of levels
 */
function resolveHighestAccessLevel(levels: AccessLevel[]): AccessLevel {
  let highest = levels[0];
  let highestValue = ACCESS_HIERARCHY[highest];

  for (const level of levels) {
    const value = ACCESS_HIERARCHY[level];
    if (value > highestValue) {
      highest = level;
      highestValue = value;
    }
  }

  return highest;
}

/**
 * Grant document access to a user, group, or role
 */
export async function grantDocumentAccess(
  documentId: number,
  permissionType: PermissionType,
  permissionTargetId: string,
  accessLevel: AccessLevel,
  grantedBy: number,
  expiresAt?: Date
): Promise<DocumentPermission> {
  try {
    // Check if permission already exists
    const existing = await DocumentPermission.findOne({
      where: {
        documentId,
        permissionType,
        permissionTargetId
      }
    });

    if (existing) {
      // Update existing permission
      await existing.update({
        accessLevel,
        grantedBy,
        expiresAt: expiresAt || undefined,
        isRevoked: false
      });
      return existing;
    }

    // Create new permission
    const permission = await DocumentPermission.create({
      documentId,
      permissionType,
      permissionTargetId,
      accessLevel,
      grantedBy,
      grantedAt: new Date(),
      expiresAt: expiresAt || undefined
    });

    return permission;
  } catch (error) {
    console.error('Grant document access error:', error);
    throw error;
  }
}

/**
 * Grant folder access to a user, group, or role
 */
export async function grantFolderAccess(
  folderId: number,
  permissionType: PermissionType,
  permissionTargetId: string,
  accessLevel: AccessLevel,
  grantedBy: number,
  expiresAt?: Date
): Promise<FolderPermission> {
  try {
    // Check if permission already exists
    const existing = await FolderPermission.findOne({
      where: {
        folderId,
        permissionType,
        permissionTargetId
      }
    });

    if (existing) {
      // Update existing permission
      await existing.update({
        accessLevel,
        grantedBy,
        expiresAt: expiresAt || undefined
      });
      return existing;
    }

    // Create new permission
    const permission = await FolderPermission.create({
      folderId,
      permissionType,
      permissionTargetId,
      accessLevel,
      grantedBy,
      grantedAt: new Date(),
      expiresAt: expiresAt || undefined
    });

    return permission;
  } catch (error) {
    console.error('Grant folder access error:', error);
    throw error;
  }
}

/**
 * Revoke document access
 */
export async function revokeDocumentAccess(
  permissionId: number,
  revokedBy: number
): Promise<boolean> {
  try {
    const permission = await DocumentPermission.findByPk(permissionId);
    
    if (!permission) {
      return false;
    }

    await permission.update({
      isRevoked: true,
      revokedBy,
      revokedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Revoke document access error:', error);
    return false;
  }
}

/**
 * Delete folder permission (FolderPermission doesn't have revoke fields)
 */
export async function revokeFolderAccess(
  permissionId: number
): Promise<boolean> {
  try {
    const permission = await FolderPermission.findByPk(permissionId);
    
    if (!permission) {
      return false;
    }

    // Delete the permission since FolderPermission doesn't have revoke fields
    await permission.destroy();
    return true;
  } catch (error) {
    console.error('Revoke folder access error:', error);
    return false;
  }
}

/**
 * List all documents a user has access to
 */
export async function listUserAccessibleDocuments(
  userId: number,
  filters?: {
    folderId?: number;
    minAccessLevel?: AccessLevel;
  }
): Promise<number[]> {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return [];
    }

    // Get all documents — scoped by organization for non-admin users
    const whereClause: any = { isDeleted: false };
    if (filters?.folderId) {
      whereClause.folderId = filters.folderId;
    }
    if (user.organizationId && user.role !== 'admin') {
      whereClause.organizationId = user.organizationId;
    }

    const documents = await Document.findAll({
      where: whereClause,
      attributes: ['id']
    });

    // Filter documents user has access to
    const accessibleDocIds: number[] = [];
    const minLevel = filters?.minAccessLevel || AccessLevel.VIEWER;

    for (const doc of documents) {
      const hasAccess = await checkDocumentPermission(userId, doc.id, minLevel);
      if (hasAccess) {
        accessibleDocIds.push(doc.id);
      }
    }

    return accessibleDocIds;
  } catch (error) {
    console.error('List user accessible documents error:', error);
    return [];
  }
}

/**
 * Get all permissions for a document
 */
export async function getDocumentPermissions(documentId: number): Promise<DocumentPermission[]> {
  try {
    return await DocumentPermission.findAll({
      where: {
        documentId,
        isRevoked: false
      },
      include: [
        {
          model: User,
          as: 'grantor',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.error('Get document permissions error:', error);
    return [];
  }
}

/**
 * Get all permissions for a folder
 */
export async function getFolderPermissions(folderId: number): Promise<FolderPermission[]> {
  try {
    return await FolderPermission.findAll({
      where: {
        folderId
      },
      include: [
        {
          model: User,
          as: 'grantor',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.error('Get folder permissions error:', error);
    return [];
  }
}
