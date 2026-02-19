import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '../controllers/orgController';

const router = Router();

// All organization routes require admin role
router.get('/', authenticate, authorize('admin'), getOrganizations);
router.get('/:id', authenticate, authorize('admin'), getOrganization);
router.post('/', authenticate, authorize('admin'), createOrganization);
router.put('/:id', authenticate, authorize('admin'), updateOrganization);
router.delete('/:id', authenticate, authorize('admin'), deleteOrganization);

export default router;
