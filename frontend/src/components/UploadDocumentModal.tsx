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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { uploadDocument, createFolder } from '../store/documentsSlice';
import { AppDispatch, RootState } from '../store';
import { Tag } from '../types';
import apiService from '../services/api';
import { PDFDocument } from 'pdf-lib';

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

    try {
      await dispatch(uploadDocument(formData)).unwrap();
      handleClose();
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
