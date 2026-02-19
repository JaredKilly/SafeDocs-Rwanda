import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  PermMedia as MediaIcon,
  Storage as StorageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  PlayCircleOutline as PlayIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { RootState } from '../store';
import apiService from '../services/api';
import { MediaItem, MediaStats, MediaCategory, MEDIA_CATEGORY_LABELS } from '../types';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const CATEGORIES: MediaCategory[] = ['general', 'marketing', 'training', 'event', 'documentation', 'other'];

const MediaLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  // Data
  const [items, setItems] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('general');
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview dialog
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // Edit dialog
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<MediaCategory>('general');
  const [editTags, setEditTags] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role === 'user') { navigate('/dashboard'); return; }
  }, [isAuthenticated, user, navigate]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (search) params.q = search;
      if (filterType) params.mediaType = filterType;
      if (filterCategory) params.category = filterCategory;

      const [mediaItems, mediaStats] = await Promise.all([
        apiService.getMediaItems(params),
        apiService.getMediaStats(),
      ]);
      setItems(mediaItems);
      setStats(mediaStats);
    } catch {
      setError('Failed to load media library.');
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterCategory]);

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'user') {
      loadAll();
    }
  }, [isAuthenticated, user, loadAll]);

  // ── Upload ──────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) {
        const name = file.name.replace(/\.[^/.]+$/, '');
        setUploadTitle(name);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''));
      if (uploadDescription) formData.append('description', uploadDescription);
      formData.append('category', uploadCategory);
      if (uploadTags.trim()) {
        formData.append('tags', JSON.stringify(uploadTags.split(',').map(t => t.trim()).filter(Boolean)));
      }

      // Simulate progress for UX (actual upload is single request)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const newItem = await apiService.uploadMedia(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setItems(prev => [newItem, ...prev]);
      setUploadOpen(false);
      resetUploadForm();
      // Refresh stats
      const newStats = await apiService.getMediaStats();
      setStats(newStats);
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadDescription('');
    setUploadCategory('general');
    setUploadTags('');
    setUploadProgress(0);
    setUploadError(null);
  };

  // ── Edit ────────────────────────────────────────────────────

  const openEdit = (item: MediaItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditCategory(item.category);
    setEditTags(item.tags?.join(', ') || '');
    setEditError(null);
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await apiService.updateMedia(editItem.id, {
        title: editTitle,
        description: editDescription || undefined,
        category: editCategory,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      setEditItem(null);
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Update failed.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteMedia(deleteTarget.id);
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      setDeleteTarget(null);
      const newStats = await apiService.getMediaStats();
      setStats(newStats);
    } catch {
      setError('Failed to delete media item.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Download ────────────────────────────────────────────────

  const handleDownload = (item: MediaItem) => {
    const token = localStorage.getItem('token');
    const url = apiService.getMediaDownloadUrl(item.id);
    const link = document.createElement('a');
    link.href = `${url}?token=${token}`;
    link.download = item.fileName;
    // Use fetch for auth header
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      });
  };

  // ── Render ──────────────────────────────────────────────────

  const getMediaPreviewUrl = (item: MediaItem) => {
    return apiService.getMediaStreamUrl(item.id);
  };

  return (
    <Layout>
      <PageHeader
        title="Media Library"
        subtitle="Upload and manage images and videos"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Media Library' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => { resetUploadForm(); setUploadOpen(true); }}
          >
            Upload Media
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Paper sx={{ p: 2.5, flex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.50' }}>
                <MediaIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total Media</Typography>
              </Box>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2.5, flex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.50' }}>
                <ImageIcon color="success" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats.images}</Typography>
                <Typography variant="body2" color="text.secondary">Images</Typography>
              </Box>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2.5, flex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.50' }}>
                <VideoIcon color="warning" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats.videos}</Typography>
                <Typography variant="body2" color="text.secondary">Videos</Typography>
              </Box>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2.5, flex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.50' }}>
                <StorageIcon color="info" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>{formatFileSize(stats.totalStorageBytes)}</Typography>
                <Typography variant="body2" color="text.secondary">Storage Used</Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            placeholder="Search media..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="image">Images</MenuItem>
              <MenuItem value="video">Videos</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select value={filterCategory} label="Category" onChange={e => setFilterCategory(e.target.value)}>
              <MenuItem value="">All Categories</MenuItem>
              {CATEGORIES.map(c => (
                <MenuItem key={c} value={c}>{MEDIA_CATEGORY_LABELS[c]}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
          >
            <ToggleButton value="grid"><GridViewIcon /></ToggleButton>
            <ToggleButton value="list"><ListViewIcon /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MediaIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No media files found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload images and videos to get started.
          </Typography>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={() => { resetUploadForm(); setUploadOpen(true); }}>
            Upload Media
          </Button>
        </Paper>
      )}

      {/* Gallery View */}
      {!loading && items.length > 0 && viewMode === 'grid' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {items.map(item => (
            <Card
              key={item.id}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}
              onClick={() => setPreviewItem(item)}
            >
              <Box sx={{ position: 'relative', paddingTop: '60%', bgcolor: 'grey.100', overflow: 'hidden' }}>
                {item.mediaType === 'image' ? (
                  <CardMedia
                    component="img"
                    image={getMediaPreviewUrl(item)}
                    alt={item.title}
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.800',
                    }}
                  >
                    <PlayIcon sx={{ fontSize: 56, color: 'white', opacity: 0.8 }} />
                  </Box>
                )}
                <Chip
                  label={item.mediaType === 'image' ? 'Image' : 'Video'}
                  size="small"
                  color={item.mediaType === 'image' ? 'success' : 'warning'}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                />
                {item.mediaType === 'video' && item.duration && (
                  <Chip
                    label={formatDuration(item.duration)}
                    size="small"
                    sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                  />
                )}
              </Box>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="subtitle2" noWrap fontWeight={600}>
                  {item.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Chip label={MEDIA_CATEGORY_LABELS[item.category]} size="small" variant="outlined" />
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(item.fileSize)}
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 1.5, pt: 0 }}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={e => { e.stopPropagation(); openEdit(item); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton size="small" onClick={e => { e.stopPropagation(); handleDownload(item); }}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {user?.role === 'admin' && (
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); setDeleteTarget(item); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* List View */}
      {!loading && items.length > 0 && viewMode === 'list' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60} />
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setPreviewItem(item)}
                >
                  <TableCell>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.mediaType === 'image' ? (
                        <Box
                          component="img"
                          src={getMediaPreviewUrl(item)}
                          alt={item.title}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <VideoIcon color="action" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 250 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.fileName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.mediaType === 'image' ? 'Image' : 'Video'}
                      size="small"
                      color={item.mediaType === 'image' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{MEDIA_CATEGORY_LABELS[item.category]}</TableCell>
                  <TableCell>{formatFileSize(item.fileSize)}</TableCell>
                  <TableCell>{item.uploader?.fullName || item.uploader?.username || '—'}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); openEdit(item); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); handleDownload(item); }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user?.role === 'admin' && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); setDeleteTarget(item); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Upload Dialog ────────────────────────────────────────── */}
      <Dialog open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Media</DialogTitle>
        <DialogContent>
          {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

          <Box
            sx={{
              mt: 1,
              p: 3,
              border: '2px dashed',
              borderColor: uploadFile ? 'primary.main' : 'divider',
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: uploadFile ? 'primary.50' : 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
            }}
            onClick={() => document.getElementById('media-upload-input')?.click()}
          >
            <input
              id="media-upload-input"
              type="file"
              hidden
              accept="image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={handleFileSelect}
            />
            <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            {uploadFile ? (
              <Typography variant="body2" color="primary">
                {uploadFile.name} ({formatFileSize(uploadFile.size)})
              </Typography>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Click to select an image or video
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Max 200MB. Supports JPEG, PNG, GIF, WebP, MP4, WebM, AVI, MOV
                </Typography>
              </>
            )}
          </Box>

          <TextField
            label="Title"
            fullWidth
            size="small"
            value={uploadTitle}
            onChange={e => setUploadTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={uploadDescription}
            onChange={e => setUploadDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={uploadCategory} label="Category" onChange={e => setUploadCategory(e.target.value as MediaCategory)}>
              {CATEGORIES.map(c => (
                <MenuItem key={c} value={c}>{MEDIA_CATEGORY_LABELS[c]}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            size="small"
            value={uploadTags}
            onChange={e => setUploadTags(e.target.value)}
            placeholder="e.g. logo, banner, promo"
            sx={{ mt: 2 }}
          />

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Preview Dialog ───────────────────────────────────────── */}
      <Dialog
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
        maxWidth="lg"
        fullWidth
      >
        {previewItem && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" noWrap sx={{ mr: 2 }}>{previewItem.title}</Typography>
              <IconButton onClick={() => setPreviewItem(null)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {previewItem.mediaType === 'image' ? (
                  <Box
                    component="img"
                    src={getMediaPreviewUrl(previewItem)}
                    alt={previewItem.title}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '60vh',
                      borderRadius: 1,
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Box
                    component="video"
                    controls
                    sx={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 1 }}
                  >
                    <source src={getMediaPreviewUrl(previewItem)} type={previewItem.mimeType} />
                    Your browser does not support the video tag.
                  </Box>
                )}
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip label={previewItem.mediaType === 'image' ? 'Image' : 'Video'} color={previewItem.mediaType === 'image' ? 'success' : 'warning'} size="small" />
                <Chip label={MEDIA_CATEGORY_LABELS[previewItem.category]} variant="outlined" size="small" />
                <Chip label={formatFileSize(previewItem.fileSize)} variant="outlined" size="small" />
                {previewItem.width && previewItem.height && (
                  <Chip label={`${previewItem.width} x ${previewItem.height}`} variant="outlined" size="small" />
                )}
                {previewItem.duration && (
                  <Chip label={formatDuration(previewItem.duration)} variant="outlined" size="small" />
                )}
                {previewItem.tags?.map(tag => (
                  <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                ))}
              </Stack>

              {previewItem.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {previewItem.description}
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Typography variant="caption" color="text.secondary">
                  Uploaded by {previewItem.uploader?.fullName || previewItem.uploader?.username || '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(previewItem.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {previewItem.fileName}
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => openEdit(previewItem)} startIcon={<EditIcon />}>Edit</Button>
              <Button onClick={() => handleDownload(previewItem)} startIcon={<DownloadIcon />}>Download</Button>
              <Button onClick={() => setPreviewItem(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Edit Dialog ──────────────────────────────────────────── */}
      <Dialog open={!!editItem} onClose={() => !editLoading && setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Media</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <TextField
            label="Title"
            fullWidth
            size="small"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Description"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={editCategory} label="Category" onChange={e => setEditCategory(e.target.value as MediaCategory)}>
              {CATEGORIES.map(c => (
                <MenuItem key={c} value={c}>{MEDIA_CATEGORY_LABELS[c]}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            size="small"
            value={editTags}
            onChange={e => setEditTags(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)} disabled={editLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit} disabled={editLoading || !editTitle.trim()}>
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onClose={() => !deleteLoading && setDeleteTarget(null)}>
        <DialogTitle>Delete Media</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default MediaLibrary;
