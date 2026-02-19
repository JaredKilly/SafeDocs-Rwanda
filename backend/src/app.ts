import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/database';
import { syncDatabase } from './models';
import { initializeBucket } from './services/minioService';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import folderRoutes from './routes/folderRoutes';
import userRoutes from './routes/userRoutes';
import groupRoutes from './routes/groupRoutes';
import shareRoutes from './routes/shareRoutes';
import accessRequestRoutes from './routes/accessRequestRoutes';
import ocrRoutes from './routes/ocrRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import scannerRoutes from './routes/scannerRoutes';
import hrRoutes from './routes/hrRoutes';
import govRoutes from './routes/govRoutes';
import healthcareRoutes from './routes/healthcareRoutes';
import mediaRoutes from './routes/mediaRoutes';
import orgRoutes from './routes/orgRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import waitlistRoutes from './routes/waitlistRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

// CORS must be registered BEFORE the rate limiter so that OPTIONS preflight
// requests are never blocked before CORS headers can be set.
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // server-to-server / curl

    // Allow explicit origins from CORS_ORIGIN env var (comma-separated)
    const explicit = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);
    if (explicit.includes(origin)) return callback(null, true);

    // Wildcard: allow any *.netlify.app or *.up.railway.app
    try {
      const { hostname } = new URL(origin);
      if (
        hostname.endsWith('.netlify.app') ||
        hostname.endsWith('.up.railway.app')
      ) {
        return callback(null, true);
      }
    } catch {}

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

app.options('*', cors(corsOptions)); // handle preflight across all routes
app.use(cors(corsOptions));

// Trust proxy in production (Railway, Render, Heroku)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to SafeDocs Rwanda API', version: '1.0.0' });
});

app.get('/api/health', async (_req: Request, res: Response) => {
  const started = Date.now();
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'ok',
      database: 'ok',
      uptime: process.uptime(),
      responseTimeMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      database: 'unavailable',
      responseTimeMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/gov', govRoutes);
app.use('/api/healthcare', healthcareRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/waitlist', waitlistRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// --- Start Server ---
const startServer = async () => {
  try {
    await testConnection();
    await syncDatabase(false);

    if (process.env.USE_MINIO === 'true') {
      console.log('🗄️  Initializing MinIO storage...');
      await initializeBucket();
      console.log('✅ MinIO storage initialized');
    } else {
      console.log('📁 Using local file storage');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
