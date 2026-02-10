import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getAuditLogs } from '../controllers/auditLogController';

const router = Router();

router.get('/', authenticate, getAuditLogs);

export default router;
