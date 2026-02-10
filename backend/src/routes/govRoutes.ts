import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getGovDocuments, setGovMetadata, clearGovMetadata, getGovStats } from '../controllers/govController';

const router = Router();

router.get('/stats', authenticate, authorize('admin', 'manager'), getGovStats);
router.get('/documents', authenticate, getGovDocuments);
router.put('/documents/:id', authenticate, setGovMetadata);
router.delete('/documents/:id', authenticate, authorize('admin', 'manager'), clearGovMetadata);

export default router;
