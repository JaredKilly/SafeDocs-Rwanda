import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getOverviewStats,
  getDocumentAnalytics,
  getUserActivity,
  getStorageAnalytics,
  getAuditAnalytics,
} from '../controllers/analyticsController';

const router = Router();

router.get('/overview', authenticate, authorize('admin', 'manager'), getOverviewStats);
router.get('/documents', authenticate, authorize('admin', 'manager'), getDocumentAnalytics);
router.get('/users', authenticate, authorize('admin', 'manager'), getUserActivity);
router.get('/storage', authenticate, authorize('admin', 'manager'), getStorageAnalytics);
router.get('/audit', authenticate, authorize('admin', 'manager'), getAuditAnalytics);

export default router;
