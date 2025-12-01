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

async function createDocumentTagsTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Create document_tags junction table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS document_tags (
        "documentId" INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "tagId" INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("documentId", "tagId")
      );
    `);

    console.log('✅ document_tags table created successfully!');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDocumentTagsTable();
