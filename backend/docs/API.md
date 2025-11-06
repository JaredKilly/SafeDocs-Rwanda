# SafeDocs Rwanda - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Documents](#document-endpoints)
3. [Folders](#folder-endpoints)
4. [Error Responses](#error-responses)

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login

**POST** `/auth/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Current User

**GET** `/auth/me`

Get currently authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user",
    "isActive": true,
    "lastLogin": "2025-01-11T10:30:00.000Z",
    "createdAt": "2025-01-10T08:00:00.000Z"
  }
}
```

---

## Document Endpoints

### Upload Document

**POST** `/documents`

Upload a new document.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
file: <binary file data>
title: "Project Proposal"
description: "Q1 2025 project proposal document"
folderId: 5
tags: ["proposal", "2025", "Q1"]
```

**Example using curl:**
```bash
curl -X POST http://localhost:5000/api/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/document.pdf" \
  -F "title=Project Proposal" \
  -F "description=Q1 2025 project proposal document" \
  -F "folderId=5" \
  -F "tags[]=proposal" \
  -F "tags[]=2025"
```

**Response (201 Created):**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": 42,
    "title": "Project Proposal",
    "description": "Q1 2025 project proposal document",
    "fileName": "document.pdf",
    "filePath": "documents/1736593200000-123456789-document.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "storageType": "local",
    "folderId": 5,
    "uploadedBy": 1,
    "currentVersion": 1,
    "isDeleted": false,
    "createdAt": "2025-01-11T10:30:00.000Z",
    "updatedAt": "2025-01-11T10:30:00.000Z"
  }
}
```

---

### Get Documents

**GET** `/documents`

Retrieve a list of documents with pagination and filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `folderId` (optional): Filter by folder ID
- `search` (optional): Search in title, description, or filename

**Examples:**
```bash
# Get first page
GET /documents?page=1&limit=20

# Get documents in specific folder
GET /documents?folderId=5

# Search documents
GET /documents?search=proposal
```

**Response (200 OK):**
```json
{
  "documents": [
    {
      "id": 42,
      "title": "Project Proposal",
      "description": "Q1 2025 project proposal document",
      "fileName": "document.pdf",
      "filePath": "documents/1736593200000-123456789-document.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "storageType": "local",
      "folderId": 5,
      "currentVersion": 1,
      "isDeleted": false,
      "createdAt": "2025-01-11T10:30:00.000Z",
      "uploader": {
        "id": 1,
        "username": "johndoe",
        "fullName": "John Doe"
      },
      "folder": {
        "id": 5,
        "name": "Projects"
      },
      "tags": [
        {
          "id": 1,
          "name": "proposal",
          "color": "#4CAF50"
        }
      ]
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### Get Document by ID

**GET** `/documents/:id`

Get details of a specific document.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "document": {
    "id": 42,
    "title": "Project Proposal",
    "description": "Q1 2025 project proposal document",
    "fileName": "document.pdf",
    "filePath": "documents/1736593200000-123456789-document.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "storageType": "local",
    "folderId": 5,
    "currentVersion": 1,
    "isDeleted": false,
    "metadata": {},
    "createdAt": "2025-01-11T10:30:00.000Z",
    "updatedAt": "2025-01-11T10:30:00.000Z",
    "uploader": {
      "id": 1,
      "username": "johndoe",
      "fullName": "John Doe"
    },
    "folder": {
      "id": 5,
      "name": "Projects"
    },
    "tags": [
      {
        "id": 1,
        "name": "proposal",
        "color": "#4CAF50"
      }
    ]
  }
}
```

---

### Download Document

**GET** `/documents/:id/download`

Download the document file.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
- Returns the file as a binary stream
- Headers include:
  - `Content-Type`: The document's MIME type
  - `Content-Disposition`: `attachment; filename="document.pdf"`

**Example using curl:**
```bash
curl -X GET http://localhost:5000/api/documents/42/download \
  -H "Authorization: Bearer <token>" \
  -O -J
```

---

### Update Document

**PUT** `/documents/:id`

Update document metadata (title, description, folder, tags).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Project Proposal",
  "description": "Updated description",
  "folderId": 6,
  "tags": ["proposal", "2025", "updated"]
}
```

**Response (200 OK):**
```json
{
  "message": "Document updated successfully",
  "document": {
    "id": 42,
    "title": "Updated Project Proposal",
    "description": "Updated description",
    "folderId": 6,
    "tags": [
      { "id": 1, "name": "proposal", "color": "#4CAF50" },
      { "id": 2, "name": "2025", "color": "#2196F3" },
      { "id": 3, "name": "updated", "color": "#FF9800" }
    ]
  }
}
```

---

### Delete Document

**DELETE** `/documents/:id`

Soft delete a document (admin/manager only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Document deleted successfully"
}
```

---

## Folder Endpoints

### Create Folder

**POST** `/folders`

Create a new folder.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Projects",
  "parentId": null
}
```

**Response (201 Created):**
```json
{
  "message": "Folder created successfully",
  "folder": {
    "id": 5,
    "name": "Projects",
    "parentId": null,
    "path": "Projects",
    "createdBy": 1,
    "createdAt": "2025-01-11T10:30:00.000Z",
    "updatedAt": "2025-01-11T10:30:00.000Z"
  }
}
```

---

### Get Folders

**GET** `/folders`

Get list of folders.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `parentId` (optional): Filter by parent folder ID (use "null" for root folders)

**Examples:**
```bash
# Get root folders
GET /folders?parentId=null

# Get subfolders of folder 5
GET /folders?parentId=5
```

**Response (200 OK):**
```json
{
  "folders": [
    {
      "id": 5,
      "name": "Projects",
      "parentId": null,
      "path": "Projects",
      "createdAt": "2025-01-11T10:30:00.000Z",
      "creator": {
        "id": 1,
        "username": "johndoe",
        "fullName": "John Doe"
      },
      "children": [
        {
          "id": 6,
          "name": "2025"
        }
      ]
    }
  ]
}
```

---

### Get Folder by ID

**GET** `/folders/:id`

Get folder details including documents.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "folder": {
    "id": 5,
    "name": "Projects",
    "parentId": null,
    "path": "Projects",
    "createdAt": "2025-01-11T10:30:00.000Z",
    "creator": {
      "id": 1,
      "username": "johndoe",
      "fullName": "John Doe"
    },
    "parent": null,
    "children": [
      {
        "id": 6,
        "name": "2025"
      }
    ],
    "documents": [
      {
        "id": 42,
        "title": "Project Proposal",
        "fileName": "document.pdf",
        "fileSize": 2048576,
        "mimeType": "application/pdf",
        "createdAt": "2025-01-11T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Get Folder Tree

**GET** `/folders/tree`

Get hierarchical folder structure.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "tree": [
    {
      "id": 1,
      "name": "Personal",
      "parentId": null,
      "path": "Personal",
      "children": [
        {
          "id": 2,
          "name": "Documents",
          "parentId": 1,
          "path": "Personal/Documents",
          "children": []
        }
      ]
    },
    {
      "id": 5,
      "name": "Projects",
      "parentId": null,
      "path": "Projects",
      "children": [
        {
          "id": 6,
          "name": "2025",
          "parentId": 5,
          "path": "Projects/2025",
          "children": []
        }
      ]
    }
  ]
}
```

---

### Update Folder

**PUT** `/folders/:id`

Update folder name.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Projects"
}
```

**Response (200 OK):**
```json
{
  "message": "Folder updated successfully",
  "folder": {
    "id": 5,
    "name": "Updated Projects",
    "path": "Updated Projects"
  }
}
```

---

### Delete Folder

**DELETE** `/folders/:id`

Delete an empty folder.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Folder deleted successfully"
}
```

**Response (400 Bad Request) - if folder not empty:**
```json
{
  "error": "Folder must be empty before deletion"
}
```

---

## Error Responses

### Common Error Formats

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## File Upload Specifications

### Supported File Types

- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, ODT
- **Images**: JPG, PNG, GIF, SVG, TIFF, BMP
- **Archives**: ZIP, RAR, 7Z
- **Others**: CSV, JSON, XML, HTML

### File Size Limits

- Maximum file size: 50MB (configurable via `MAX_FILE_SIZE` environment variable)

### Storage Types

- **local**: Files stored in local file system (default)
- **minio**: Files stored in MinIO object storage (set `USE_MINIO=true` in .env)

---

## Rate Limiting

Currently no rate limiting is implemented. Will be added in future versions.

---

## Testing with Thunder Client

1. Import the Thunder Client collection (coming soon)
2. Set the `baseUrl` variable to `http://localhost:5000/api`
3. Set the `token` variable after logging in
4. All requests will use these variables automatically

---

## Testing with cURL

### Example: Complete Workflow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "fullName": "John Doe"
  }'

# 2. Login and save token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }' | jq -r '.token')

# 3. Create folder
curl -X POST http://localhost:5000/api/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projects"
  }'

# 4. Upload document
curl -X POST http://localhost:5000/api/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf" \
  -F "title=Project Proposal" \
  -F "folderId=1"

# 5. Get documents
curl -X GET http://localhost:5000/api/documents \
  -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps

- [ ] Add Swagger/OpenAPI specification
- [ ] Add rate limiting
- [ ] Add API versioning
- [ ] Add webhooks for events
- [ ] Add GraphQL API
