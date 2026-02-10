import { Router } from 'express';
import {
  createFolder,
  getFolders,
  getFolderById,
  updateFolder,
  deleteFolder,
  getFolderTree,
} from '../controllers/folderController';
import { authenticate, requireFolderPermission } from '../middleware/auth';
import { AccessLevel } from '../services/permissionService';

const router = Router();

router.post('/', authenticate, createFolder);
router.get('/', authenticate, getFolders);
router.get('/tree', authenticate, getFolderTree);
router.get('/:id', authenticate, requireFolderPermission(AccessLevel.VIEWER), getFolderById);
router.put('/:id', authenticate, requireFolderPermission(AccessLevel.EDITOR), updateFolder);
router.delete('/:id', authenticate, requireFolderPermission(AccessLevel.OWNER), deleteFolder);

export default router;
