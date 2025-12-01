const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function addStorageTypeColumn() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Add storageType column to documents table
    await sequelize.query(`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS "storageType" VARCHAR(10) DEFAULT 'local';
    `);

    console.log('✅ storageType column added successfully!');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addStorageTypeColumn();
