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

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to SafeDocs Rwanda API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents',
      folders: '/api/folders',
      users: '/api/users',
    },
  });
});

// Health check
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
  } catch (error) {
    console.error('Health check failed:', error);
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

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size exceeds limit' });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models only in development; use migrations otherwise
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase(false); // Set to true to force recreate tables
    } else {
      console.log('Skipping syncDatabase in non-development environment. Run migrations instead.');
    }
    
    // Initialize MinIO if enabled
    if (process.env.USE_MINIO === 'true') {
      console.log('🗄️  Initializing MinIO storage...');
      await initializeBucket();
      console.log('✅ MinIO storage initialized');
    } else {
      console.log('📁 Using local file storage');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
