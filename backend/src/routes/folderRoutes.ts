import { Router } from 'express';
import {
  createFolder,
  getFolders,
  getFolderById,
  updateFolder,
  deleteFolder,
  getFolderTree,
} from '../controllers/folderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createFolder);
router.get('/', authenticate, getFolders);
router.get('/tree', authenticate, getFolderTree);
router.get('/:id', authenticate, getFolderById);
router.put('/:id', authenticate, updateFolder);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteFolder);

export default router;
