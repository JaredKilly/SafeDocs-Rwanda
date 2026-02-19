import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  alpha,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  AccountBalance as GovIcon,
  LocalHospital as HealthIcon,
  Business as HRIcon,
} from '@mui/icons-material';
import { uploadDocument, createFolder } from '../store/documentsSlice';
import { AppDispatch, RootState } from '../store';
import {
  Tag,
  HRCategory,
  HR_CATEGORY_LABELS,
  HCRecordType,
  HCPrivacyLevel,
  HC_RECORD_LABELS,
  HC_PRIVACY_LABELS,
  HCMeta,
} from '../types';
import apiService from '../services/api';
import { PDFDocument } from 'pdf-lib';

// ── Government classification types ──
type ClassificationLevel = 'public' | 'internal' | 'restricted' | 'confidential' | 'top_secret';

const CLASSIFICATION_OPTIONS: { value: ClassificationLevel; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'top_secret', label: 'Top Secret' },
];

const GOV_RETENTION_OPTIONS = [
  { value: 1, label: '1 year' }, { value: 3, label: '3 years' },
  { value: 5, label: '5 years' }, { value: 7, label: '7 years' },
  { value: 10, label: '10 years' }, { value: 15, label: '15 years' },
  { value: 20, label: '20 years' }, { value: 0, label: 'Permanent' },
];

const HC_RETENTION_OPTIONS = [
  { value: 5, label: '5 years' }, { value: 7, label: '7 years' },
  { value: 10, label: '10 years' }, { value: 15, label: '15 years' },
  { value: 25, label: '25 years' }, { value: 0, label: 'Permanent' },
];

type ModuleType = 'none' | 'government' | 'healthcare' | 'hr';

interface GovForm {
  classification?: ClassificationLevel;
  govRef?: string;
  subject?: string;
  issuingAuthority?: string;
  retentionYears?: number;
}

interface HrForm {
  hrOrganization?: string;
  hrDepartment?: string;
  hrCategory?: HRCategory;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const UploadDocumentModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { folders, loading, error } = useSelector((state: RootState) => state.documents);

  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState<number | ''>('');
  const [dragActive, setDragActive] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);
  const [folderLoading, setFolderLoading] = useState(false);
  const [combineImages, setCombineImages] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [enableExpiry, setEnableExpiry] = useState(false);

  // Tags
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Module assignment
  const [moduleType, setModuleType] = useState<ModuleType>('none');
  const [govForm, setGovForm] = useState<GovForm>({});
  const [hcForm, setHcForm] = useState<HCMeta>({});
  const [hrForm, setHrForm] = useState<HrForm>({});
  const [moduleError, setModuleError] = useState<string | null>(null);

  // Load tags when dialog opens
  useEffect(() => {
    if (open) {
      setTagsLoading(true);
      apiService.getTags()
        .then(setAvailableTags)
        .catch(() => {})
        .finally(() => setTagsLoading(false));
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      if (!title) setTitle(selectedFiles[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(droppedFiles);
      if (!title) setTitle(droppedFiles[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    const formData = new FormData();
    const isMultiImage = combineImages && files.length > 1;

    if (isMultiImage) {
      const pdfBytes = await buildPdfFromImages(files);
      const pdfFile = new File([pdfBytes], `${title || 'scan'}.pdf`, { type: 'application/pdf' });
      formData.append('file', pdfFile);
      formData.append('convertToPdf', 'true');
    } else {
      formData.append('file', files[0]);
      if (combineImages && files.length === 1 && files[0].type.startsWith('image/')) {
        formData.append('convertToPdf', 'true');
      }
    }

    formData.append('title', title);
    if (description) formData.append('description', description);
    if (folderId) formData.append('folderId', folderId.toString());
    if (enableExpiry && expiresAt) formData.append('expiresAt', new Date(expiresAt).toISOString());

    // Append tags as JSON array of IDs
    if (selectedTags.length > 0) {
      formData.append('tags', JSON.stringify(selectedTags.map((t) => t.id)));
    }

    let hadModuleError = false;
    try {
      setModuleError(null);
      const result = await dispatch(uploadDocument(formData)).unwrap();
      const docId = (result as any)?.document?.id;

      // Apply module metadata after upload
      if (docId && moduleType === 'government' && govForm.classification) {
        try {
          await apiService.setGovMetadata(docId, govForm);
        } catch {
          setModuleError('Document uploaded but failed to set government classification. You can set it from the Government page.');
          hadModuleError = true;
        }
      } else if (docId && moduleType === 'healthcare' && hcForm.hcRecordType) {
        try {
          await apiService.setHealthcareMetadata(docId, hcForm);
        } catch {
          setModuleError('Document uploaded but failed to set healthcare metadata. You can set it from the Healthcare page.');
          hadModuleError = true;
        }
      } else if (docId && moduleType === 'hr' && hrForm.hrOrganization) {
        try {
          await apiService.setHRDocMetadata(docId, hrForm);
        } catch {
          setModuleError('Document uploaded but failed to set HR classification. You can set it from the HR page.');
          hadModuleError = true;
        }
      }

      if (!hadModuleError) {
        handleClose();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setTitle('');
    setDescription('');
    setFolderId('');
    setNewFolderName('');
    setFolderError(null);
    setSelectedTags([]);
    setEnableExpiry(false);
    setExpiresAt('');
    setModuleType('none');
    setGovForm({});
    setHcForm({});
    setHrForm({});
    setModuleError(null);
    onClose();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setFolderError(null);
    setFolderLoading(true);
    try {
      const created = await dispatch(createFolder({ name: newFolderName.trim() })).unwrap();
      setFolderId(created.id);
      setNewFolderName('');
    } catch (err: any) {
      setFolderError(typeof err === 'string' ? err : 'Failed to create folder');
    } finally {
      setFolderLoading(false);
    }
  };

  const handleCreateTag = async (name: string) => {
    try {
      const newTag = await apiService.createTag({ name, color: '#607D8B' });
      setAvailableTags((prev) => [...prev, newTag]);
      setSelectedTags((prev) => [...prev, newTag]);
    } catch {}
  };

  const buildPdfFromImages = async (images: File[]): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    for (const file of images) {
      const arrayBuf = await file.arrayBuffer();
      const isJpeg = file.type.includes('jpeg') || file.type.includes('jpg');
      const embedded = isJpeg ? await pdfDoc.embedJpg(arrayBuf) : await pdfDoc.embedPng(arrayBuf);
      const page = pdfDoc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    }
    return await pdfDoc.save();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Minimum datetime: now
  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {moduleError && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => { setModuleError(null); handleClose(); }}>{moduleError}</Alert>}

          {/* Drag & Drop Zone */}
          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input-upload')?.click()}
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: dragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.3s',
              mb: 3,
            }}
          >
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              {files.length > 0 ? `${files.length} file(s) selected` : 'Drag & drop files here or click to browse'}
            </Typography>
            {files.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
              </Typography>
            )}
            <input
              id="file-input-upload"
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileChange}
              title="Select files to upload"
              aria-label="Select files to upload"
              className="visually-hidden"
            />
          </Box>

          <TextField
            fullWidth
            label="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          {/* Tags */}
          <Autocomplete
            multiple
            options={availableTags}
            value={selectedTags}
            onChange={(_, newValue) => {
              // Handle "create new tag" option
              const lastItem = newValue[newValue.length - 1];
              if (lastItem && typeof (lastItem as any).inputValue === 'string') {
                handleCreateTag((lastItem as any).inputValue);
                return;
              }
              setSelectedTags(newValue as Tag[]);
            }}
            getOptionLabel={(option) => {
              if (typeof (option as any).inputValue === 'string') return (option as any).inputValue;
              return (option as Tag).name;
            }}
            filterOptions={(options, params) => {
              const filtered = options.filter((o) =>
                o.name.toLowerCase().includes(params.inputValue.toLowerCase())
              );
              if (params.inputValue.trim() && !options.find((o) => o.name.toLowerCase() === params.inputValue.toLowerCase())) {
                filtered.push({ inputValue: params.inputValue, name: `Create "${params.inputValue}"`, id: -1, createdAt: '' } as any);
              }
              return filtered;
            }}
            loading={tagsLoading}
            renderTags={(value, getTagProps) =>
              value.map((tag, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  sx={{
                    bgcolor: tag.color ? `${tag.color}22` : undefined,
                    color: tag.color || undefined,
                    fontWeight: 600,
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags (Optional)"
                placeholder="Search or create tags…"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {tagsLoading ? <CircularProgress size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
            sx={{ mb: 2 }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Folder (Optional)</InputLabel>
            <Select
              value={folderId}
              label="Folder (Optional)"
              onChange={(e) => setFolderId(e.target.value as number | '')}
            >
              <MenuItem value=""><em>No Folder</em></MenuItem>
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>{folder.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="New folder name"
              size="small"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || folderLoading}
            >
              Create folder
            </Button>
          </Box>

          <FormControlLabel
            control={<Switch checked={combineImages} onChange={(e) => setCombineImages(e.target.checked)} />}
            label="Combine selected images into a single PDF"
            sx={{ mb: 1 }}
          />

          <FormControlLabel
            control={<Switch checked={enableExpiry} onChange={(e) => setEnableExpiry(e.target.checked)} />}
            label="Set document expiry date"
          />

          {enableExpiry && (
            <TextField
              fullWidth
              label="Expires on"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              slotProps={{
                htmlInput: { min: minDateTime },
                inputLabel: { shrink: true },
              }}
              sx={{ mt: 1.5, mb: 1 }}
            />
          )}

          {/* ── Module Assignment ── */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Assign to Module (Optional)
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Module</InputLabel>
            <Select
              label="Module"
              value={moduleType}
              onChange={(e) => {
                setModuleType(e.target.value as ModuleType);
                setGovForm({});
                setHcForm({});
                setHrForm({});
              }}
            >
              <MenuItem value="none"><em>None</em></MenuItem>
              <MenuItem value="government">
                <Stack direction="row" spacing={1} alignItems="center">
                  <GovIcon fontSize="small" sx={{ color: '#1565C0' }} />
                  <span>Government Classification</span>
                </Stack>
              </MenuItem>
              <MenuItem value="healthcare">
                <Stack direction="row" spacing={1} alignItems="center">
                  <HealthIcon fontSize="small" sx={{ color: '#2E7D32' }} />
                  <span>Healthcare Record</span>
                </Stack>
              </MenuItem>
              <MenuItem value="hr">
                <Stack direction="row" spacing={1} alignItems="center">
                  <HRIcon fontSize="small" sx={{ color: '#E65100' }} />
                  <span>HR / Organization</span>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Government fields */}
          {moduleType === 'government' && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#1565C0', 0.04), border: '1px solid', borderColor: alpha('#1565C0', 0.15), mb: 1 }}>
              <Stack spacing={2}>
                <FormControl size="small" fullWidth required>
                  <InputLabel>Classification Level *</InputLabel>
                  <Select
                    label="Classification Level *"
                    value={govForm.classification || ''}
                    onChange={(e) => setGovForm(f => ({ ...f, classification: e.target.value as ClassificationLevel }))}
                  >
                    {CLASSIFICATION_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Reference Number"
                    placeholder="e.g. GOV/RW/2026/001"
                    size="small"
                    fullWidth
                    value={govForm.govRef || ''}
                    onChange={(e) => setGovForm(f => ({ ...f, govRef: e.target.value }))}
                  />
                  <TextField
                    label="Issuing Authority"
                    placeholder="e.g. Ministry of Finance"
                    size="small"
                    fullWidth
                    value={govForm.issuingAuthority || ''}
                    onChange={(e) => setGovForm(f => ({ ...f, issuingAuthority: e.target.value }))}
                  />
                </Stack>
                <TextField
                  label="Subject"
                  placeholder="Brief subject of the document"
                  size="small"
                  fullWidth
                  value={govForm.subject || ''}
                  onChange={(e) => setGovForm(f => ({ ...f, subject: e.target.value }))}
                />
                <FormControl size="small" fullWidth>
                  <InputLabel>Retention Period</InputLabel>
                  <Select
                    label="Retention Period"
                    value={govForm.retentionYears ?? ''}
                    onChange={(e) => setGovForm(f => ({ ...f, retentionYears: e.target.value as number }))}
                  >
                    <MenuItem value=""><em>Not set</em></MenuItem>
                    {GOV_RETENTION_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          )}

          {/* Healthcare fields */}
          {moduleType === 'healthcare' && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#2E7D32', 0.04), border: '1px solid', borderColor: alpha('#2E7D32', 0.15), mb: 1 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <FormControl size="small" fullWidth required>
                    <InputLabel>Record Type *</InputLabel>
                    <Select
                      label="Record Type *"
                      value={hcForm.hcRecordType || ''}
                      onChange={(e) => setHcForm(f => ({ ...f, hcRecordType: e.target.value as HCRecordType }))}
                    >
                      {(Object.keys(HC_RECORD_LABELS) as HCRecordType[]).map(k => (
                        <MenuItem key={k} value={k}>{HC_RECORD_LABELS[k]}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Privacy Level</InputLabel>
                    <Select
                      label="Privacy Level"
                      value={hcForm.hcPrivacyLevel || ''}
                      onChange={(e) => setHcForm(f => ({ ...f, hcPrivacyLevel: e.target.value as HCPrivacyLevel }))}
                    >
                      <MenuItem value=""><em>Not set</em></MenuItem>
                      {(Object.keys(HC_PRIVACY_LABELS) as HCPrivacyLevel[]).map(k => (
                        <MenuItem key={k} value={k}>{HC_PRIVACY_LABELS[k]}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Patient ID"
                    placeholder="e.g. PT-00123"
                    size="small"
                    fullWidth
                    value={hcForm.hcPatientId || ''}
                    onChange={(e) => setHcForm(f => ({ ...f, hcPatientId: e.target.value }))}
                  />
                  <TextField
                    label="Patient Name"
                    size="small"
                    fullWidth
                    value={hcForm.hcPatientName || ''}
                    onChange={(e) => setHcForm(f => ({ ...f, hcPatientName: e.target.value }))}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Facility"
                    placeholder="e.g. King Faisal Hospital"
                    size="small"
                    fullWidth
                    value={hcForm.hcFacility || ''}
                    onChange={(e) => setHcForm(f => ({ ...f, hcFacility: e.target.value }))}
                  />
                  <TextField
                    label="Provider"
                    placeholder="Doctor / nurse name"
                    size="small"
                    fullWidth
                    value={hcForm.hcProvider || ''}
                    onChange={(e) => setHcForm(f => ({ ...f, hcProvider: e.target.value }))}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={hcForm.hcConsentObtained || false}
                        onChange={(e) => setHcForm(f => ({ ...f, hcConsentObtained: e.target.checked }))}
                        size="small"
                      />
                    }
                    label="Patient consent obtained"
                  />
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Retention</InputLabel>
                    <Select
                      label="Retention"
                      value={hcForm.hcRetentionYears ?? ''}
                      onChange={(e) => setHcForm(f => ({ ...f, hcRetentionYears: e.target.value as number }))}
                    >
                      <MenuItem value=""><em>Not set</em></MenuItem>
                      {HC_RETENTION_OPTIONS.map(o => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* HR / Organization fields */}
          {moduleType === 'hr' && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#E65100', 0.04), border: '1px solid', borderColor: alpha('#E65100', 0.15), mb: 1 }}>
              <Stack spacing={2}>
                <TextField
                  label="Organization *"
                  placeholder="e.g. Bobaat Technologies"
                  size="small"
                  fullWidth
                  required
                  value={hrForm.hrOrganization || ''}
                  onChange={(e) => setHrForm(f => ({ ...f, hrOrganization: e.target.value }))}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Department"
                    placeholder="e.g. Human Resources"
                    size="small"
                    fullWidth
                    value={hrForm.hrDepartment || ''}
                    onChange={(e) => setHrForm(f => ({ ...f, hrDepartment: e.target.value }))}
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={hrForm.hrCategory || ''}
                      onChange={(e) => setHrForm(f => ({ ...f, hrCategory: e.target.value as HRCategory }))}
                    >
                      <MenuItem value=""><em>Not set</em></MenuItem>
                      {(Object.keys(HR_CATEGORY_LABELS) as HRCategory[]).map(k => (
                        <MenuItem key={k} value={k}>{HR_CATEGORY_LABELS[k]}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Box>
          )}

          {folderError && <Alert severity="error" sx={{ mt: 1 }}>{folderError}</Alert>}
          {loading && <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={files.length === 0 || !title || loading}
          startIcon={<UploadIcon />}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDocumentModal;
