import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  getDocumentVersions,
  downloadDocumentVersion,
} from '../controllers/documentController';
import { authenticate, requireDocumentPermission } from '../middleware/auth';
import { uploadWithMinio } from '../middleware/uploadWithMinio';
import { AccessLevel } from '../services/permissionService';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', authenticate, uploadLimiter, uploadWithMinio('file'), uploadDocument);
router.get('/', authenticate, getDocuments);
router.get('/:id', authenticate, requireDocumentPermission(AccessLevel.VIEWER), getDocumentById);
router.get(
  '/:id/download',
  authenticate,
  requireDocumentPermission(AccessLevel.VIEWER),
  downloadDocument
);
router.put(
  '/:id',
  authenticate,
  requireDocumentPermission(AccessLevel.EDITOR),
  updateDocument
);
router.delete(
  '/:id',
  authenticate,
  requireDocumentPermission(AccessLevel.OWNER),
  deleteDocument
);
router.get(
  '/:id/versions',
  authenticate,
  requireDocumentPermission(AccessLevel.VIEWER),
  getDocumentVersions
);
router.get(
  '/:id/versions/:versionId/download',
  authenticate,
  requireDocumentPermission(AccessLevel.VIEWER),
  downloadDocumentVersion
);

export default router;
