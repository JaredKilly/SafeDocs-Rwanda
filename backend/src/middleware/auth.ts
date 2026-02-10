import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { User } from '../models';
import {
  AccessLevel,
  checkDocumentPermission,
  checkFolderPermission,
} from '../services/permissionService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  (async () => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      const dbUser = await User.findByPk(decoded.userId);
      if (!dbUser || !dbUser.isActive) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      if (dbUser.tokenVersion !== decoded.tokenVersion) {
        res.status(401).json({ error: 'Token revoked' });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  })();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Require a specific document access level.
 * Looks for document ID on `req.params.documentId` or `req.params.id`.
 */
export const requireDocumentPermission = (level: AccessLevel) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const documentId = req.params.documentId || req.params.id;
      if (!documentId) {
        res.status(400).json({ error: 'Document ID is required' });
        return;
      }

      const hasPermission = await checkDocumentPermission(
        req.user.userId,
        Number(documentId),
        level
      );

      if (!hasPermission) {
        res.status(403).json({ error: 'Insufficient document permissions' });
        return;
      }

      next();
    } catch (error) {
      console.error('Require document permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Require a specific folder access level.
 * Looks for folder ID on `req.params.folderId` or `req.params.id`.
 */
export const requireFolderPermission = (level: AccessLevel) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const folderId = req.params.folderId || req.params.id;
      if (!folderId) {
        res.status(400).json({ error: 'Folder ID is required' });
        return;
      }

      const hasPermission = await checkFolderPermission(
        req.user.userId,
        Number(folderId),
        level
      );

      if (!hasPermission) {
        res.status(403).json({ error: 'Insufficient folder permissions' });
        return;
      }

      next();
    } catch (error) {
      console.error('Require folder permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
