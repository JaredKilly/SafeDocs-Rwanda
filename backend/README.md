# SafeDocs Rwanda - Backend API

A Document Management System backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 JWT Authentication & Authorization
- 📁 Folder/Category Management
- 📄 Document Upload & Management
- 🔍 Advanced Search
- 🏷️ Document Tagging
- 📊 Audit Logging
- 👥 User Role Management
- 🔒 Secure File Storage

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=safedocs_rwanda
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

4. Create PostgreSQL database:
```bash
createdb safedocs_rwanda
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Documents
- `POST /api/documents` - Upload document (requires auth)
- `GET /api/documents` - Get all documents (requires auth)
- `GET /api/documents/:id` - Get document by ID (requires auth)
- `GET /api/documents/:id/download` - Download document (requires auth)
- `PUT /api/documents/:id` - Update document (requires auth)
- `DELETE /api/documents/:id` - Delete document (requires admin/manager)

### Folders
- `POST /api/folders` - Create folder (requires auth)
- `GET /api/folders` - Get all folders (requires auth)
- `GET /api/folders/tree` - Get folder tree (requires auth)
- `GET /api/folders/:id` - Get folder by ID (requires auth)
- `PUT /api/folders/:id` - Update folder (requires auth)
- `DELETE /api/folders/:id` - Delete folder (requires admin/manager)

## User Roles

- `admin` - Full access to all features
- `manager` - Can manage documents and folders
- `user` - Can view and upload documents

## Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `folders` - Document folder structure
- `documents` - Document metadata
- `tags` - Document tags
- `document_tags` - Many-to-many relationship
- `audit_logs` - Activity tracking

## File Upload

Supported file types:
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Images: JPG, JPEG, PNG, GIF
- Text: TXT, CSV

Maximum file size: 50MB (configurable)

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for security headers
- CORS protection
- Input validation
- Role-based access control

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── app.ts          # Application entry point
├── uploads/            # Uploaded files (gitignored)
├── .env                # Environment variables (gitignored)
├── package.json
└── tsconfig.json
```

## License

MIT
