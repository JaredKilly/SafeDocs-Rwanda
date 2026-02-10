import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = parseInt(value || '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const isEnabled = process.env.RATE_LIMIT_ENABLED !== 'false';

const passThrough = (_req: Request, _res: Response, next: NextFunction) => next();

export const generalLimiter = isEnabled
  ? rateLimit({
      windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      limit: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests, please try again later.',
    })
  : passThrough;

export const authLimiter = isEnabled
  ? rateLimit({
      windowMs: toNumber(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 15 * 60 * 1000),
      limit: toNumber(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS, 5),
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many login attempts, please try again later.',
    })
  : passThrough;

export const uploadLimiter = isEnabled
  ? rateLimit({
      windowMs: toNumber(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS, 60 * 60 * 1000),
      limit: toNumber(process.env.RATE_LIMIT_UPLOAD_MAX_REQUESTS, 10),
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Upload rate limit exceeded. Please try again later.',
    })
  : passThrough;

export const shareLinkLimiter = isEnabled
  ? rateLimit({
      windowMs: toNumber(process.env.RATE_LIMIT_SHARE_WINDOW_MS, 60 * 60 * 1000),
      limit: toNumber(process.env.RATE_LIMIT_SHARE_MAX_REQUESTS, 20),
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Share link creation rate limit exceeded. Please try again later.',
    })
  : passThrough;

export default {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  shareLinkLimiter,
};
