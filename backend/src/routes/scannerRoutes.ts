import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listScanners, scanFromDevice } from '../controllers/scannerController';

const router = Router();

// GET  /api/scanner/devices  — list connected WIA scanners
router.get('/devices', authenticate, listScanners);

// POST /api/scanner/scan     — trigger scan from a WIA device
router.post('/scan', authenticate, scanFromDevice);

export default router;
