import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * OCR Service for extracting text from images
 *
 * Supports multiple OCR backends:
 * 1. External OCR API (configured via env)
 * 2. Tesseract.js (fallback, local processing)
 * 3. Mock OCR for development
 */

interface OCRResult {
  text: string;
  confidence?: number;
  language?: string;
  processingTime?: number;
}

/**
 * Process OCR using external API endpoint
 */
async function processWithExternalAPI(filePath: string): Promise<OCRResult> {
  const ocrEndpoint = process.env.OCR_ENDPOINT;
  const ocrApiKey = process.env.OCR_API_KEY;

  if (!ocrEndpoint) {
    throw new Error('OCR_ENDPOINT not configured');
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  const headers = {
    ...formData.getHeaders(),
    ...(ocrApiKey ? { 'Authorization': `Bearer ${ocrApiKey}` } : {}),
  };

  const response = await axios.post(ocrEndpoint, formData, { headers });

  return {
    text: response.data.text || response.data.result || '',
    confidence: response.data.confidence,
    language: response.data.language || 'en',
  };
}

/**
 * Process OCR using Tesseract.js (local processing)
 * NOTE: Requires tesseract.js to be installed
 */
async function processWithTesseract(filePath: string): Promise<OCRResult> {
  try {
    // Dynamic require to avoid TypeScript compilation errors if tesseract is not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Tesseract = require('tesseract.js');

    const worker = await Tesseract.createWorker('eng');
    const { data } = await worker.recognize(filePath);
    await worker.terminate();

    return {
      text: data.text,
      confidence: data.confidence,
      language: 'eng',
    };
  } catch (error) {
    console.error('Tesseract OCR failed:', error);
    throw new Error('Tesseract OCR not available. Please install tesseract.js or configure an external OCR endpoint.');
  }
}

/**
 * Mock OCR for development/testing
 */
async function processMockOCR(filePath: string): Promise<OCRResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    text: `[Mock OCR Result]\n\nThis is simulated text extracted from the image.\nFile: ${filePath}\n\nIn production, this would contain the actual OCR text extracted from your scanned document.\n\nConfigure OCR_ENDPOINT in .env to use a real OCR service.`,
    confidence: 0.95,
    language: 'en',
  };
}

/**
 * Main OCR processing function
 */
export async function processOCR(filePath: string): Promise<OCRResult> {
  const startTime = Date.now();

  try {
    let result: OCRResult;

    // Check if OCR is enabled
    if (process.env.OCR_ENABLED === 'false') {
      throw new Error('OCR is disabled in configuration');
    }

    // Try external API first
    if (process.env.OCR_ENDPOINT) {
      console.log('Processing OCR with external API...');
      result = await processWithExternalAPI(filePath);
    }
    // Fall back to Tesseract
    else if (process.env.NODE_ENV === 'production') {
      console.log('Processing OCR with Tesseract...');
      result = await processWithTesseract(filePath);
    }
    // Use mock in development
    else {
      console.log('Processing OCR with mock service (development mode)...');
      result = await processMockOCR(filePath);
    }

    const processingTime = Date.now() - startTime;
    return {
      ...result,
      processingTime,
    };
  } catch (error: any) {
    console.error('OCR processing error:', error);

    // In development, fall back to mock OCR
    if (process.env.NODE_ENV === 'development') {
      console.log('Falling back to mock OCR...');
      return processMockOCR(filePath);
    }

    throw error;
  }
}

/**
 * Batch process multiple files
 */
export async function batchProcessOCR(filePaths: string[]): Promise<OCRResult[]> {
  const results: OCRResult[] = [];

  for (const filePath of filePaths) {
    try {
      const result = await processOCR(filePath);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process ${filePath}:`, error);
      results.push({
        text: '',
        confidence: 0,
      });
    }
  }

  return results;
}

/**
 * Check if OCR is available and configured
 */
export function isOCRAvailable(): boolean {
  return (
    process.env.OCR_ENABLED !== 'false' &&
    (!!process.env.OCR_ENDPOINT || process.env.NODE_ENV === 'development')
  );
}

export default {
  processOCR,
  batchProcessOCR,
  isOCRAvailable,
};
