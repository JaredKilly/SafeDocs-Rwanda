import { Router } from 'express';
import { processOCRFile, getOCRStatus } from '../controllers/ocrController';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// OCR status endpoint
router.get('/status', authenticate, getOCRStatus);

// Process OCR on uploaded file
router.post('/process', authenticate, upload.single('file'), processOCRFile);

export default router;
