import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getHealthcareDocs,
  setHealthcareMetadata,
  clearHealthcareMetadata,
  getHealthcareStats,
} from '../controllers/healthcareController';

const router = Router();

router.get('/stats', authenticate, authorize('admin', 'manager'), getHealthcareStats);
router.get('/documents', authenticate, getHealthcareDocs);
router.put('/documents/:id', authenticate, setHealthcareMetadata);
router.delete('/documents/:id', authenticate, authorize('admin', 'manager'), clearHealthcareMetadata);

export default router;
