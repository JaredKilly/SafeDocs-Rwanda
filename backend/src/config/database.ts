import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Support DATABASE_URL (used by Render, Railway, Heroku, Supabase, etc.)
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: isProduction ? false : console.log,
      dialectOptions: isProduction
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
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
      dialectOptions: isProduction
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    });

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;
