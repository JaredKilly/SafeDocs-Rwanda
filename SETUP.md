# SafeDocs Rwanda - Complete Setup Guide

This guide will walk you through setting up SafeDocs Rwanda from scratch.

## Prerequisites Checklist

Before you begin, ensure you have:

- ✅ Node.js v16+ installed
- ✅ PostgreSQL v14+ installed and running
- ✅ npm or yarn package manager
- ✅ Git (for version control)
- ✅ A code editor (VS Code recommended)

## Step 1: Database Setup

### Install PostgreSQL (if not already installed)

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer and follow prompts
- Remember the postgres user password

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Create Database

1. Open PostgreSQL command line or pgAdmin
2. Create the database:

```sql
CREATE DATABASE safedocs_rwanda;
```

Or using command line:
```bash
createdb safedocs_rwanda
```

### Verify Database Connection

```bash
psql -U postgres -d safedocs_rwanda
```

## Step 2: Backend Setup

### Navigate to Backend Directory
```bash
cd backend
```

### Install Dependencies
```bash
npm install
```

This will install all required packages:
- express, cors, helmet, morgan
- sequelize, pg
- bcrypt, jsonwebtoken
- multer
- And all TypeScript types

### Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your settings:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration  
DB_HOST=localhost
DB_PORT=5432
DB_NAME=safedocs_rwanda
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Initialize Database Tables

The application will automatically create tables on first run, but you can manually sync:

```bash
npm run dev
```

The tables will be created automatically:
- users
- folders
- documents
- tags
- document_tags
- audit_logs

### Verify Backend is Running

Open http://localhost:5000 in your browser. You should see:
```json
{
  "message": "Welcome to SafeDocs Rwanda API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "documents": "/api/documents",
    "folders": "/api/folders"
  }
}
```

## Step 3: Frontend Setup

### Navigate to Frontend Directory
```bash
cd frontend
```

### Install Dependencies
```bash
npm install
```

### Configure API Endpoint

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Start Development Server
```bash
npm start
```

The app will open at http://localhost:3000

## Step 4: Create First Admin User

### Option 1: Using API (Postman/cURL)

**Register Admin User:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@safedocs.rw",
  "password": "Admin@123",
  "fullName": "System Administrator",
  "role": "admin"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@safedocs.rw",
    "fullName": "System Administrator",
    "role": "admin"
  }
}
```

### Option 2: Using Frontend UI

1. Open http://localhost:3000
2. Click "Register" 
3. Fill in the form:
   - Username: admin
   - Email: admin@safedocs.rw
   - Password: Admin@123
   - Full Name: System Administrator
4. Click "Register"

## Step 5: Verify Installation

### Test Backend Endpoints

1. **Login:**
```bash
POST http://localhost:5000/api/auth/login
{
  "username": "admin",
  "password": "Admin@123"
}
```

2. **Get Profile:**
```bash
GET http://localhost:5000/api/auth/profile
Authorization: Bearer YOUR_TOKEN
```

3. **Create Folder:**
```bash
POST http://localhost:5000/api/folders
Authorization: Bearer YOUR_TOKEN
{
  "name": "My Documents"
}
```

4. **Upload Document:**
```bash
POST http://localhost:5000/api/documents
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: [select file]
title: "Test Document"
```

### Test Frontend Features

1. ✅ Login with admin credentials
2. ✅ Create a folder
3. ✅ Upload a document
4. ✅ Search for documents
5. ✅ View audit logs

## Common Issues & Solutions

### Issue 1: Database Connection Error

**Error:** `Unable to connect to the database`

**Solution:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `psql -l`

### Issue 2: Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
- Change PORT in backend `.env` file
- Kill process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill
  ```

### Issue 3: CORS Error

**Error:** `Access to fetch at 'http://localhost:5000' has been blocked by CORS`

**Solution:**
- Verify CORS_ORIGIN in backend `.env` matches frontend URL
- Restart backend server after changes

### Issue 4: File Upload Error

**Error:** `File size exceeds limit`

**Solution:**
- Check MAX_FILE_SIZE in `.env`
- Ensure uploads directory exists
- Check file permissions

### Issue 5: JWT Token Expired

**Error:** `Invalid or expired token`

**Solution:**
- Login again to get new token
- Increase JWT_EXPIRES_IN in `.env`

## Development Workflow

### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### Making Changes

1. **Backend Changes:**
   - Edit files in `backend/src/`
   - Server auto-restarts with nodemon
   
2. **Frontend Changes:**
   - Edit files in `frontend/src/`
   - Browser auto-refreshes

### Database Management

**View Tables:**
```bash
psql -U postgres -d safedocs_rwanda
\dt
```

**Reset Database (Development Only):**
```bash
dropdb safedocs_rwanda
createdb safedocs_rwanda
```

Then restart backend to recreate tables.

## Production Deployment

### Backend

1. Build TypeScript:
```bash
cd backend
npm run build
```

2. Set production environment variables
3. Start with PM2:
```bash
pm2 start dist/app.js --name safedocs-api
```

### Frontend

1. Build React app:
```bash
cd frontend
npm run build
```

2. Deploy `build` folder to hosting service (Netlify, Vercel, etc.)

### Database

1. Use migrations instead of sync
2. Set up automated backups
3. Configure connection pooling
4. Enable SSL connections

## Security Checklist

- ✅ Change JWT_SECRET to a strong random value
- ✅ Use strong passwords for database
- ✅ Enable HTTPS in production
- ✅ Set up firewall rules
- ✅ Regular security updates
- ✅ Configure CORS properly
- ✅ Set up rate limiting
- ✅ Enable audit logging

## Next Steps

1. 📚 Read the [API Documentation](backend/README.md)
2. 🎨 Customize the UI theme
3. 👥 Create additional user accounts
4. 📁 Set up folder structure
5. 📄 Upload documents
6. 🔍 Test search functionality
7. 📊 Review audit logs

## Support

For issues or questions:
- Email: support@safedocs.rw
- Documentation: See README.md
- Report bugs: Create an issue on GitHub

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Guide](https://nodejs.org/en/docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

**Congratulations! 🎉** SafeDocs Rwanda is now set up and ready to use!
