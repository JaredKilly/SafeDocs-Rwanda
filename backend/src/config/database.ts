import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const dbUrl = process.env.DATABASE_URL || '';
// Neon and other hosted Postgres providers require SSL in production
const sslOptions = isProduction
  ? { ssl: { rejectUnauthorized: false } }
  : {};

// Support DATABASE_URL (Railway, Render, Heroku, Supabase) with fallback to individual vars
const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      logging: isProduction ? false : console.log,
      dialectOptions: sslOptions,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    })
  : new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'safedocs_rwanda',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      dialect: 'postgres',
      logging: isProduction ? false : console.log,
      dialectOptions: sslOptions,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    });

export const testConnection = async () => {
  const maxRetries = 5;
  const retryDelayMs = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
      }
      const err = error as any;
      const msg = err?.parent?.message || err?.original?.message || err?.message || String(error);
      console.warn(`⚠️  DB connection attempt ${attempt}/${maxRetries} failed: ${msg}. Retrying in ${retryDelayMs / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
};

export default sequelize;
