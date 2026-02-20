import axios, { AxiosInstance } from 'axios';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  HealthStatus,
  Document,
  Folder,
  FolderCreate,
  Tag,
  TagCreate,
  AuditLog,
  SearchParams,
  DocumentPermission,
  ShareLink,
  Group,
  GroupMemberDetails,
  AccessRequest,
  MediaItem,
  MediaStats,
  Organization,
  AnalyticsOverview,
  DocumentAnalytics,
  UserActivityAnalytics,
  StorageAnalytics,
  AuditAnalytics,
  AnalyticsRange,
  AppNotification,
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
        // Only force-logout on 401 for authenticated requests.
        // Skip /auth/login and /auth/register so login errors surface normally.
        const url = error.config?.url || '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
        if (error.response?.status === 401 && !isAuthEndpoint) {
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

  async register(data: RegisterData): Promise<any> {
    const response = await this.api.post<any>('/auth/register', data);
    return response.data;
  }

  async verifyOtp(userId: number, otp: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/verify-otp', { userId, otp });
    return response.data;
  }

  async resendOtp(userId: number): Promise<void> {
    await this.api.post('/auth/resend-otp', { userId });
  }

  async getHealth(): Promise<HealthStatus> {
    const response = await this.api.get<HealthStatus>('/health');
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
    const response = await this.api.put<{ message: string; document: Document }>(`/documents/${id}`, data);
    return response.data.document;
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

  // Sharing
  async shareDocument(
    documentId: number,
    data: {
      targetType: 'user' | 'group' | 'role';
      targetId: string;
      accessLevel: 'viewer' | 'commenter' | 'editor' | 'owner';
      expiresAt?: string;
    }
  ): Promise<DocumentPermission> {
    const response = await this.api.post<{ message: string; permission: DocumentPermission }>(
      `/shares/document/${documentId}`,
      data
    );
    return response.data.permission;
  }

  async getDocumentShares(documentId: number): Promise<DocumentPermission[]> {
    const response = await this.api.get<{ permissions: DocumentPermission[] }>(
      `/shares/document/${documentId}`
    );
    return response.data.permissions;
  }

  async revokeDocumentShare(permissionId: number): Promise<void> {
    await this.api.delete(`/shares/${permissionId}`);
  }

  async createShareLink(
    documentId: number,
    data: {
      password?: string;
      expiresAt?: string;
      maxUses?: number;
      allowDownload?: boolean;
      accessLevel?: 'viewer' | 'commenter';
      emailTo?: string;
    }
  ): Promise<ShareLink> {
    const response = await this.api.post<{ message: string; shareLink: ShareLink }>(
      `/shares/link/${documentId}`,
      data
    );
    return response.data.shareLink;
  }

  async getDocumentShareLinks(documentId: number): Promise<ShareLink[]> {
    const response = await this.api.get<{ shareLinks: ShareLink[] }>(
      `/shares/link/${documentId}/list`
    );
    return response.data.shareLinks;
  }

  async deactivateShareLink(token: string): Promise<void> {
    await this.api.delete(`/shares/link/${token}`);
  }

  // Access Requests
  async submitAccessRequest(data: {
    documentId: number;
    message?: string;
    requestedAccess: 'viewer' | 'commenter' | 'editor';
  }): Promise<AccessRequest> {
    const response = await this.api.post<{ message: string; accessRequest: AccessRequest }>(
      '/access-requests',
      data
    );
    return response.data.accessRequest;
  }

  async getPendingAccessRequests(): Promise<AccessRequest[]> {
    const response = await this.api.get<{ requests: AccessRequest[] }>('/access-requests/pending');
    return response.data.requests;
  }

  async getMyAccessRequests(): Promise<AccessRequest[]> {
    const response = await this.api.get<{ requests: AccessRequest[] }>('/access-requests/mine');
    return response.data.requests;
  }

  async approveAccessRequest(
    requestId: number,
    data: { accessLevel?: 'viewer' | 'commenter' | 'editor'; response?: string }
  ): Promise<AccessRequest> {
    const response = await this.api.patch<{ message: string; accessRequest: AccessRequest }>(
      `/access-requests/${requestId}/approve`,
      data
    );
    return response.data.accessRequest;
  }

  async denyAccessRequest(requestId: number, data: { response?: string }): Promise<AccessRequest> {
    const response = await this.api.patch<{ message: string; accessRequest: AccessRequest }>(
      `/access-requests/${requestId}/deny`,
      data
    );
    return response.data.accessRequest;
  }

  // Groups
  async createGroup(data: { name: string; description?: string }): Promise<Group> {
    const response = await this.api.post<{ message: string; group: Group }>('/groups', data);
    return response.data.group;
  }

  async getGroups(): Promise<Group[]> {
    const response = await this.api.get<{ groups: Group[] }>('/groups');
    return response.data.groups;
  }

  async getGroup(id: number): Promise<{ group: Group; userRole: 'admin' | 'member' }> {
    const response = await this.api.get<{ group: Group; userRole: 'admin' | 'member' }>(
      `/groups/${id}`
    );
    return response.data;
  }

  async updateGroup(id: number, data: { name?: string; description?: string }): Promise<Group> {
    const response = await this.api.put<{ message: string; group: Group }>(
      `/groups/${id}`,
      data
    );
    return response.data.group;
  }

  async deleteGroup(id: number): Promise<void> {
    await this.api.delete(`/groups/${id}`);
  }

  async addGroupMember(
    groupId: number,
    data: { userId: number; role?: 'admin' | 'member' }
  ): Promise<GroupMemberDetails> {
    const response = await this.api.post<{ message: string; membership: GroupMemberDetails }>(
      `/groups/${groupId}/members`,
      data
    );
    return response.data.membership;
  }

  async removeGroupMember(groupId: number, userId: number): Promise<void> {
    await this.api.delete(`/groups/${groupId}/members/${userId}`);
  }

  async updateGroupMemberRole(
    groupId: number,
    userId: number,
    role: 'admin' | 'member'
  ): Promise<GroupMemberDetails> {
    const response = await this.api.put<{ message: string; membership: GroupMemberDetails }>(
      `/groups/${groupId}/members/${userId}/role`,
      { role }
    );
    return response.data.membership;
  }

  // OCR
  async processOCR(formData: FormData): Promise<{
    success: boolean;
    data: {
      text: string;
      confidence?: number;
      language?: string;
      processingTime?: number;
    };
  }> {
    const response = await this.api.post('/ocr/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getOCRStatus(): Promise<{
    available: boolean;
    enabled: boolean;
    configured: boolean;
    endpoint: string;
    mode: string;
  }> {
    const response = await this.api.get('/ocr/status');
    return response.data;
  }

  // WIA Scanner
  async listScannerDevices(): Promise<{ id: string; name: string }[]> {
    const response = await this.api.get<{ scanners: { id: string; name: string }[] }>('/scanner/devices');
    return response.data.scanners;
  }

  async scanFromDevice(deviceId: string, colorMode = 4, dpi = 300): Promise<File> {
    const response = await this.api.post(
      '/scanner/scan',
      { deviceId, colorMode, dpi },
      { responseType: 'blob' }
    );
    const blob = response.data as Blob;
    return new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
  }

  // ── HR ──────────────────────────────────────────────────────
  async getHRStats(): Promise<import('../types').HRStats> {
    const r = await this.api.get('/hr/stats');
    return r.data;
  }

  async getEmployees(params?: { q?: string; department?: string; status?: string }): Promise<import('../types').Employee[]> {
    const r = await this.api.get('/hr', { params });
    return r.data;
  }

  async getEmployee(id: number): Promise<import('../types').Employee> {
    const r = await this.api.get(`/hr/${id}`);
    return r.data;
  }

  async createEmployee(data: Partial<import('../types').Employee>): Promise<import('../types').Employee> {
    const r = await this.api.post('/hr', data);
    return r.data;
  }

  async updateEmployee(id: number, data: Partial<import('../types').Employee>): Promise<import('../types').Employee> {
    const r = await this.api.put(`/hr/${id}`, data);
    return r.data;
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.api.delete(`/hr/${id}`);
  }

  async linkDocumentToEmployee(employeeId: number, documentId: number, hrCategory: string): Promise<void> {
    await this.api.post(`/hr/${employeeId}/documents`, { documentId, hrCategory });
  }

  async unlinkDocumentFromEmployee(employeeId: number, documentId: number): Promise<void> {
    await this.api.delete(`/hr/${employeeId}/documents/${documentId}`);
  }

  // HR document classification (by organization)
  async getHRDocs(params?: { q?: string; organization?: string; hrCategory?: string }): Promise<import('../types').Document[]> {
    const r = await this.api.get('/hr/documents/classified', { params });
    return r.data;
  }

  async setHRDocMetadata(documentId: number, data: { hrOrganization?: string; hrDepartment?: string; hrCategory?: string }): Promise<void> {
    await this.api.put(`/hr/documents/${documentId}/metadata`, data);
  }

  async clearHRDocMetadata(documentId: number): Promise<void> {
    await this.api.delete(`/hr/documents/${documentId}/metadata`);
  }

  async updateProfile(data: { fullName?: string; email?: string }): Promise<User> {
    const response = await this.api.put<{ message: string; user: User }>('/auth/profile', data);
    return response.data.user;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await this.api.put('/auth/change-password', data);
  }

  // Search users (for sharing — available to all authenticated users)
  async searchUsers(q: string): Promise<Pick<User, 'id' | 'username' | 'fullName' | 'email'>[]> {
    const response = await this.api.get('/users/search', { params: { q } });
    return response.data;
  }

  // Admin: User Management
  async getAllUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/users/all');
    return response.data;
  }

  async updateUserRole(userId: number, role: 'admin' | 'manager' | 'user', organizationId?: number | null): Promise<User> {
    const response = await this.api.put<User>(`/users/${userId}/role`, { role, organizationId });
    return response.data;
  }

  async toggleUserStatus(userId: number): Promise<User> {
    const response = await this.api.patch<User>(`/users/${userId}/toggle-status`);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role?: 'admin' | 'manager' | 'user';
    organizationId?: number | null;
  }): Promise<User> {
    const response = await this.api.post<{ user: User }>('/users', data);
    return response.data.user;
  }

  // ── Organizations (admin only) ──────────────────────────────
  async getOrganizations(): Promise<Organization[]> {
    const response = await this.api.get<Organization[]>('/organizations');
    return response.data;
  }

  async getOrganization(id: number): Promise<Organization & { users?: User[] }> {
    const response = await this.api.get(`/organizations/${id}`);
    return response.data;
  }

  async createOrganization(data: { name: string; slug: string; description?: string }): Promise<Organization> {
    const response = await this.api.post<{ organization: Organization }>('/organizations', data);
    return response.data.organization;
  }

  async updateOrganization(id: number, data: Partial<{ name: string; slug: string; description: string; isActive: boolean }>): Promise<Organization> {
    const response = await this.api.put<{ organization: Organization }>(`/organizations/${id}`, data);
    return response.data.organization;
  }

  async deleteOrganization(id: number): Promise<void> {
    await this.api.delete(`/organizations/${id}`);
  }

  // Document Versions
  async getDocumentVersions(documentId: number): Promise<any[]> {
    const response = await this.api.get(`/documents/${documentId}/versions`);
    return response.data.versions ?? response.data;
  }

  async downloadDocumentVersion(documentId: number, versionId: number): Promise<Blob> {
    const response = await this.api.get(
      `/documents/${documentId}/versions/${versionId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Share link: update createShareLink to support emailTo
  async createShareLinkWithEmail(
    documentId: number,
    data: {
      password?: string;
      expiresAt?: string;
      maxUses?: number;
      allowDownload?: boolean;
      accessLevel?: 'viewer' | 'commenter';
      emailTo?: string;
    }
  ): Promise<ShareLink> {
    const response = await this.api.post<{ message: string; shareLink: ShareLink }>(
      `/shares/link/${documentId}`,
      data
    );
    return response.data.shareLink;
  }

  // ── Government ─────────────────────────────────────────────
  async getGovDocuments(params?: { q?: string; classification?: string; refNumber?: string }): Promise<import('../types').Document[]> {
    const r = await this.api.get('/gov/documents', { params });
    return r.data;
  }

  async getGovStats(): Promise<{ total: number; byClassification: Record<string, number> }> {
    const r = await this.api.get('/gov/stats');
    return r.data;
  }

  async setGovMetadata(documentId: number, data: Record<string, any>): Promise<void> {
    await this.api.put(`/gov/documents/${documentId}`, data);
  }

  async clearGovMetadata(documentId: number): Promise<void> {
    await this.api.delete(`/gov/documents/${documentId}`);
  }

  // ── Healthcare ──────────────────────────────────────────────
  async getHealthcareStats(): Promise<import('../types').HealthcareStats> {
    const r = await this.api.get('/healthcare/stats');
    return r.data;
  }

  async getHealthcareDocs(params?: {
    q?: string;
    recordType?: string;
    privacyLevel?: string;
    patientId?: string;
  }): Promise<import('../types').Document[]> {
    const r = await this.api.get('/healthcare/documents', { params });
    return r.data;
  }

  async setHealthcareMetadata(
    documentId: number,
    data: import('../types').HCMeta
  ): Promise<void> {
    await this.api.put(`/healthcare/documents/${documentId}`, data);
  }

  async clearHealthcareMetadata(documentId: number): Promise<void> {
    await this.api.delete(`/healthcare/documents/${documentId}`);
  }

  // Audit Logs
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: number;
    documentId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
    const response = await this.api.get('/audit-logs', { params });
    return response.data;
  }

  // ── Media Library ─────────────────────────────────────────────
  async getMediaStats(): Promise<MediaStats> {
    const r = await this.api.get('/media/stats');
    return r.data;
  }

  async getMediaItems(params?: { q?: string; mediaType?: string; category?: string }): Promise<MediaItem[]> {
    const r = await this.api.get('/media', { params });
    return r.data;
  }

  async getMediaItem(id: number): Promise<MediaItem> {
    const r = await this.api.get(`/media/${id}`);
    return r.data;
  }

  async uploadMedia(formData: FormData): Promise<MediaItem> {
    const r = await this.api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r.data;
  }

  async updateMedia(id: number, data: Partial<MediaItem>): Promise<MediaItem> {
    const r = await this.api.put(`/media/${id}`, data);
    return r.data;
  }

  async deleteMedia(id: number): Promise<void> {
    await this.api.delete(`/media/${id}`);
  }

  getMediaStreamUrl(id: number): string {
    return `${API_URL}/media/${id}/stream`;
  }

  getMediaDownloadUrl(id: number): string {
    return `${API_URL}/media/${id}/download`;
  }

  // ── Analytics ─────────────────────────────────────────────

  async getAnalyticsOverview(range?: AnalyticsRange): Promise<AnalyticsOverview> {
    const r = await this.api.get('/analytics/overview', { params: { range } });
    return r.data;
  }

  async getDocumentAnalytics(range?: AnalyticsRange): Promise<DocumentAnalytics> {
    const r = await this.api.get('/analytics/documents', { params: { range } });
    return r.data;
  }

  async getUserActivityAnalytics(range?: AnalyticsRange): Promise<UserActivityAnalytics> {
    const r = await this.api.get('/analytics/users', { params: { range } });
    return r.data;
  }

  async getStorageAnalytics(range?: AnalyticsRange): Promise<StorageAnalytics> {
    const r = await this.api.get('/analytics/storage', { params: { range } });
    return r.data;
  }

  async getAuditAnalytics(range?: AnalyticsRange): Promise<AuditAnalytics> {
    const r = await this.api.get('/analytics/audit', { params: { range } });
    return r.data;
  }

  // ── Notifications ─────────────────────────────────────────

  async getNotifications(page = 1, limit = 20): Promise<{ notifications: AppNotification[]; total: number }> {
    const r = await this.api.get('/notifications', { params: { page, limit } });
    return r.data;
  }

  async getUnreadNotificationCount(): Promise<number> {
    const r = await this.api.get<{ count: number }>('/notifications/unread-count');
    return r.data.count;
  }

  async markNotificationRead(id: number): Promise<void> {
    await this.api.patch(`/notifications/${id}/read`);
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.api.patch('/notifications/read-all');
  }

  async joinWaitlist(email: string, name?: string): Promise<{ message: string; email: string }> {
    const response = await this.api.post<{ message: string; email: string }>('/waitlist', {
      email: email.trim(),
      name: name?.trim() || undefined,
    });
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
