import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  Document,
  Folder,
  FolderCreate,
  Tag,
  TagCreate,
  AuditLog,
  SearchParams,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/auth/profile');
    return response.data;
  }

  // Documents
  async uploadDocument(formData: FormData): Promise<Document> {
    const response = await this.api.post<Document>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getDocuments(params?: SearchParams): Promise<Document[]> {
    const response = await this.api.get<{ documents: Document[]; pagination: any }>('/documents', { params });
    return response.data.documents;
  }

  async getDocument(id: number): Promise<Document> {
    const response = await this.api.get<Document>(`/documents/${id}`);
    return response.data;
  }

  async updateDocument(id: number, data: Partial<Document>): Promise<Document> {
    const response = await this.api.put<Document>(`/documents/${id}`, data);
    return response.data;
  }

  async deleteDocument(id: number): Promise<void> {
    await this.api.delete(`/documents/${id}`);
  }

  async downloadDocument(id: number): Promise<Blob> {
    const response = await this.api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const response = await this.api.get<Document[]>('/documents/search', {
      params: { query },
    });
    return response.data;
  }

  // Folders
  async createFolder(data: FolderCreate): Promise<Folder> {
    const response = await this.api.post<Folder>('/folders', data);
    return response.data;
  }

  async getFolders(): Promise<Folder[]> {
    const response = await this.api.get<{ folders: Folder[] }>('/folders');
    return response.data.folders;
  }

  async getFolderTree(): Promise<Folder[]> {
    const response = await this.api.get<{ tree: Folder[] }>('/folders/tree');
    return response.data.tree;
  }

  async getFolder(id: number): Promise<Folder> {
    const response = await this.api.get<Folder>(`/folders/${id}`);
    return response.data;
  }

  async updateFolder(id: number, data: Partial<FolderCreate>): Promise<Folder> {
    const response = await this.api.put<Folder>(`/folders/${id}`, data);
    return response.data;
  }

  async deleteFolder(id: number): Promise<void> {
    await this.api.delete(`/folders/${id}`);
  }

  // Tags
  async createTag(data: TagCreate): Promise<Tag> {
    const response = await this.api.post<Tag>('/tags', data);
    return response.data;
  }

  async getTags(): Promise<Tag[]> {
    const response = await this.api.get<Tag[]>('/tags');
    return response.data;
  }

  async updateTag(id: number, data: Partial<TagCreate>): Promise<Tag> {
    const response = await this.api.put<Tag>(`/tags/${id}`, data);
    return response.data;
  }

  async deleteTag(id: number): Promise<void> {
    await this.api.delete(`/tags/${id}`);
  }

  // Audit Logs
  async getAuditLogs(params?: any): Promise<AuditLog[]> {
    const response = await this.api.get<AuditLog[]>('/audit-logs', { params });
    return response.data;
  }
}

export default new ApiService();
