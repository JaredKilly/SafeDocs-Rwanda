import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  linkDocument,
  unlinkDocument,
  getHRStats,
} from '../controllers/hrController';

const router = Router();

// All HR routes require authentication; most also require manager or admin
router.get('/stats', authenticate, authorize('admin', 'manager'), getHRStats);
router.get('/', authenticate, authorize('admin', 'manager'), getEmployees);
router.get('/:id', authenticate, authorize('admin', 'manager'), getEmployee);
router.post('/', authenticate, authorize('admin', 'manager'), createEmployee);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateEmployee);
router.delete('/:id', authenticate, authorize('admin'), deleteEmployee);

// Link/unlink documents
router.post('/:id/documents', authenticate, authorize('admin', 'manager'), linkDocument);
router.delete('/:id/documents/:documentId', authenticate, authorize('admin', 'manager'), unlinkDocument);

export default router;
