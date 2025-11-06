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
import { uploadWithMinio } from '../middleware/uploadWithMinio';

const router = Router();

router.post('/', authenticate, uploadWithMinio('file'), uploadDocument);
router.get('/', authenticate, getDocuments);
router.get('/:id', authenticate, getDocumentById);
router.get('/:id/download', authenticate, downloadDocument);
router.put('/:id', authenticate, updateDocument);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteDocument);

export default router;
