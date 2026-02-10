import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  shareDocument,
  getDocumentShares,
  revokeDocumentShare,
  createShareLink,
  accessViaShareLink,
  deactivateShareLink,
  getDocumentShareLinks
} from '../controllers/shareController';
import { requireDocumentPermission } from '../middleware/auth';
import { AccessLevel } from '../services/permissionService';
import { shareLinkLimiter } from '../middleware/rateLimiter';

const router = Router();

// Document sharing (requires authentication)
router.post(
  '/document/:documentId',
  authenticate,
  requireDocumentPermission(AccessLevel.EDITOR),
  shareDocument
);
router.get(
  '/document/:documentId',
  authenticate,
  requireDocumentPermission(AccessLevel.EDITOR),
  getDocumentShares
);
router.delete('/:permissionId', authenticate, revokeDocumentShare);

// Share links
router.post(
  '/link/:documentId',
  authenticate,
  requireDocumentPermission(AccessLevel.EDITOR),
  shareLinkLimiter,
  createShareLink
);
router.post('/link/:token/access', accessViaShareLink); // Public endpoint
router.delete('/link/:token', authenticate, deactivateShareLink);
router.get(
  '/link/:documentId/list',
  authenticate,
  requireDocumentPermission(AccessLevel.VIEWER),
  getDocumentShareLinks
);

export default router;
