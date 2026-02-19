require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'safedocs_rwanda',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME_TEST || 'safedocs_rwanda_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    ...(process.env.DATABASE_URL
      ? { use_env_variable: 'DATABASE_URL' }
      : {
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
        }),
    dialect: 'postgres',
    logging: false,
    // Railway internal connections (*.railway.internal) don't use SSL
    ...(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('.railway.internal')
      ? {}
      : { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }),
  },
};
