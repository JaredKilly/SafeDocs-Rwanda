import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController';
import { authenticate, authorize } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.post('/', authenticate, upload.single('file'), uploadDocument);
router.get('/', authenticate, getDocuments);
router.get('/:id', authenticate, getDocumentById);
router.get('/:id/download', authenticate, downloadDocument);
router.put('/:id', authenticate, updateDocument);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteDocument);

export default router;
