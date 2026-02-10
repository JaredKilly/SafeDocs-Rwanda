import { Request, Response } from 'express';
import { processOCR, isOCRAvailable } from '../services/ocrService';
import fs from 'fs/promises';

/**
 * Process OCR on uploaded file
 */
export const processOCRFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;

    try {
      // Process OCR
      const result = await processOCR(filePath);

      res.json({
        success: true,
        data: {
          text: result.text,
          confidence: result.confidence,
          language: result.language,
          processingTime: result.processingTime,
        },
      });
    } finally {
      // Clean up uploaded file
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }
    }
  } catch (error: any) {
    console.error('OCR processing error:', error);
    res.status(500).json({
      error: 'OCR processing failed',
      message: error.message,
    });
  }
};

/**
 * Check OCR service status
 */
export const getOCRStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const available = isOCRAvailable();
    const ocrEndpoint = process.env.OCR_ENDPOINT;
    const ocrEnabled = process.env.OCR_ENABLED !== 'false';

    res.json({
      available,
      enabled: ocrEnabled,
      configured: !!ocrEndpoint,
      endpoint: ocrEndpoint ? 'Configured (hidden)' : 'Not configured',
      mode: ocrEndpoint
        ? 'External API'
        : process.env.NODE_ENV === 'development'
        ? 'Mock (Development)'
        : 'Tesseract.js',
    });
  } catch (error: any) {
    console.error('Failed to get OCR status:', error);
    res.status(500).json({
      error: 'Failed to check OCR status',
      message: error.message,
    });
  }
};
