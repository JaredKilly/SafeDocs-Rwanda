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

export interface HealthStatus {
  status: 'ok' | 'error';
  database?: 'ok' | 'unavailable';
  uptime?: number;
  responseTimeMs?: number;
  timestamp: string;
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
  folderId?: number | null;
  uploadedBy: number;
  currentVersion: number;
  isDeleted: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  uploader?: User;
  folder?: Folder;
  tags?: Tag[];
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType?: string;
  storageType: 'local' | 'minio';
  uploadedBy: number;
  changeNote?: string | null;
  createdAt: string;
  uploader?: User;
}

export interface DocumentUpload {
  file: File;
  title: string;
  description?: string;
  folderId?: number;
  tags?: number[];
}

// ── HR Types ──────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'inactive' | 'terminated';

export type HRCategory =
  | 'contract'
  | 'id_copy'
  | 'certificate'
  | 'performance_review'
  | 'onboarding'
  | 'medical'
  | 'payslip'
  | 'other';

export const HR_CATEGORY_LABELS: Record<HRCategory, string> = {
  contract: 'Contract',
  id_copy: 'ID Copy',
  certificate: 'Certificate',
  performance_review: 'Performance Review',
  onboarding: 'Onboarding',
  medical: 'Medical',
  payslip: 'Payslip',
  other: 'Other',
};

export interface Employee {
  id: number;
  employeeId: string;
  fullName: string;
  department: string;
  position: string;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  status: EmployeeStatus;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  employeeDocuments?: { id: number; hrCategory: HRCategory }[];
  documents?: (Document & { EmployeeDocument?: { hrCategory: HRCategory } })[];
  creator?: User;
}

export interface EmployeeDocument {
  id: number;
  employeeId: number;
  documentId: number;
  hrCategory: HRCategory;
  addedBy: number;
  createdAt: string;
  employee?: Employee;
  document?: Document;
}

export interface HRStats {
  stats: { total: number; active: number; inactive: number; terminated: number };
  expiringDocuments: EmployeeDocument[];
  departments: string[];
}

// Healthcare Types
export type HCRecordType =
  | 'patient_record' | 'lab_result' | 'prescription' | 'consent_form'
  | 'discharge_summary' | 'imaging' | 'referral' | 'immunization'
  | 'clinical_note' | 'insurance' | 'other';

export type HCPrivacyLevel = 'general' | 'sensitive' | 'restricted' | 'mental_health' | 'hiv_aids';

export const HC_RECORD_LABELS: Record<HCRecordType, string> = {
  patient_record: 'Patient Record',
  lab_result: 'Lab Result',
  prescription: 'Prescription',
  consent_form: 'Consent Form',
  discharge_summary: 'Discharge Summary',
  imaging: 'Imaging / Radiology',
  referral: 'Referral Letter',
  immunization: 'Immunization',
  clinical_note: 'Clinical Note',
  insurance: 'Insurance',
  other: 'Other',
};

export const HC_PRIVACY_LABELS: Record<HCPrivacyLevel, string> = {
  general: 'General',
  sensitive: 'Sensitive',
  restricted: 'Restricted',
  mental_health: 'Mental Health',
  hiv_aids: 'HIV/AIDS',
};

export interface HCMeta {
  hcRecordType?: HCRecordType;
  hcPrivacyLevel?: HCPrivacyLevel;
  hcPatientId?: string;
  hcPatientName?: string;
  hcFacility?: string;
  hcProvider?: string;
  hcConsentObtained?: boolean;
  hcRetentionYears?: number;
  hcNotes?: string;
}

export interface HealthcareStats {
  total: number;
  byType: Record<string, number>;
  byPrivacy: Record<string, number>;
  noConsent: number;
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

export type AccessLevel = 'viewer' | 'commenter' | 'editor' | 'owner';
export type PermissionType = 'user' | 'group' | 'role';

export interface DocumentPermission {
  id: number;
  documentId: number;
  permissionType: PermissionType;
  permissionTargetId: string;
  accessLevel: AccessLevel;
  grantedBy: number;
  grantedAt: string;
  expiresAt?: string | null;
  isRevoked: boolean;
  revokedAt?: string | null;
  revokedBy?: number | null;
  createdAt: string;
  updatedAt: string;
  grantor?: User;
}

export interface ShareLink {
  id: number;
  documentId: number;
  token: string;
  accessLevel: 'viewer' | 'commenter';
  maxUses?: number | null;
  currentUses: number;
  allowDownload: boolean;
  createdBy: number;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  url?: string;
  creator?: User;
}

export interface GroupMemberDetails {
  groupId: number;
  userId: number;
  role: 'admin' | 'member';
  addedAt?: string;
  user?: User;
}

export interface Group {
  id: number;
  name: string;
  description?: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  members?: GroupMemberDetails[];
  userRole?: 'admin' | 'member';
}

export interface AccessRequest {
  id: number;
  documentId: number;
  requesterId: number;
  requestedAccess: 'viewer' | 'commenter' | 'editor';
  message?: string | null;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  responseMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
  document?: Document;
  requester?: User;
  reviewer?: User;
}
