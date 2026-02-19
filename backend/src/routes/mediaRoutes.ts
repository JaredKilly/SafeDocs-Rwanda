import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadMediaWithMinio } from '../middleware/uploadWithMinio';
import {
  getMediaItems,
  getMediaItem,
  uploadMedia,
  updateMedia,
  deleteMedia,
  downloadMedia,
  streamMedia,
  getMediaStats,
} from '../controllers/mediaController';

const router = Router();

// All media routes require authentication + admin or manager role
router.get('/stats', authenticate, authorize('admin', 'manager'), getMediaStats);
router.get('/', authenticate, authorize('admin', 'manager'), getMediaItems);
router.get('/:id', authenticate, authorize('admin', 'manager'), getMediaItem);
router.post('/', authenticate, authorize('admin', 'manager'), uploadMediaWithMinio('file'), uploadMedia);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateMedia);
router.delete('/:id', authenticate, authorize('admin'), deleteMedia);
router.get('/:id/download', authenticate, authorize('admin', 'manager'), downloadMedia);
router.get('/:id/stream', authenticate, authorize('admin', 'manager'), streamMedia);

export default router;
