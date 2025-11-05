// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: 'admin' | 'manager' | 'user';
}

// Document Types
export interface Document {
  id: number;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  folderId?: number;
  uploadedBy: number;
  currentVersion: number;
  isDeleted: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  uploader?: User;
  folder?: Folder;
  tags?: Tag[];
}

export interface DocumentUpload {
  file: File;
  title: string;
  description?: string;
  folderId?: number;
  tags?: number[];
}

// Folder Types
export interface Folder {
  id: number;
  name: string;
  parentId?: number;
  path?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  children?: Folder[];
  documents?: Document[];
}

export interface FolderCreate {
  name: string;
  parentId?: number;
}

// Tag Types
export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
}

export interface TagCreate {
  name: string;
  color?: string;
}

// Audit Log Types
export interface AuditLog {
  id: number;
  userId?: number;
  documentId?: number;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
  document?: Document;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and Filter Types
export interface SearchParams {
  query?: string;
  folderId?: number;
  tags?: number[];
  uploadedBy?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
