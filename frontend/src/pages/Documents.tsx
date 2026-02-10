import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Skeleton,
  Checkbox,
  Stack,
  alpha,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Share as ShareIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  CheckBox as SelectIcon,
  CheckBoxOutlineBlank as UnselectIcon,
  Label as TagIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { fetchDocuments, deleteDocument, fetchFolders, updateDocument } from '../store/documentsSlice';
import { AppDispatch, RootState } from '../store';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import UploadDocumentModal from '../components/UploadDocumentModal';
import DocumentPreview from '../components/DocumentPreview';
import ShareDocumentDialog from '../components/ShareDocumentDialog';
import DocumentVersionsDialog from '../components/DocumentVersionsDialog';
import { Document, Tag } from '../types';
import apiService from '../services/api';

// ─── Expiry helpers ───────────────────────────────────────────────────────────

const getExpiryInfo = (expiresAt?: string | null) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: 'Expired', color: 'error' as const };
  if (days <= 7) return { label: `Expires in ${days}d`, color: 'warning' as const };
  return null;
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

const DocumentSkeleton: React.FC = () => (
  <Card sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
    <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" sx={{ flexGrow: 1, height: 28 }} />
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
      <Skeleton variant="text" sx={{ width: '80%' }} />
      <Skeleton variant="text" sx={{ width: '60%' }} />
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Skeleton variant="rounded" width={100} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
      <Skeleton variant="text" sx={{ mt: 2, width: '50%' }} />
    </CardContent>
    <Box sx={{ px: 2, pb: 1.5, display: 'flex', gap: 1 }}>
      <Skeleton variant="rounded" width={70} height={30} />
      <Skeleton variant="rounded" width={90} height={30} />
    </Box>
  </Card>
);

// ─── Main component ───────────────────────────────────────────────────────────

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { documents, loading } = useSelector((state: RootState) => state.documents);
  const { folders } = useSelector((state: RootState) => state.documents);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [versionsModalOpen, setVersionsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<number | ''>('');
  const [moveError, setMoveError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareDocument, setShareDocument] = useState<Document | null>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<number | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Bulk mode
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchDocuments({}));
      dispatch(fetchFolders());
      apiService.getTags().then(setAvailableTags).catch(() => {});
    }
  }, [isAuthenticated, navigate, dispatch]);

  // ── Context menu ────────────────────────────────────────────────────────────

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, docId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocId(docId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocId(null);
  };

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewModalOpen(true);
    handleMenuClose();
  };

  const handlePreviewClose = () => {
    setPreviewModalOpen(false);
    setSelectedDocument(null);
  };

  const handleDownload = async (docId: number, fileName: string) => {
    try {
      const blob = await apiService.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
    handleMenuClose();
  };

  const handleDelete = async (docId: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await dispatch(deleteDocument(docId)).unwrap();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
    handleMenuClose();
  };

  const openMoveModal = (docId: number) => {
    setSelectedDocId(docId);
    setMoveModalOpen(true);
    setTargetFolderId('');
    setMoveError(null);
    handleMenuClose();
  };

  const handleMove = async () => {
    if (!selectedDocId) return;
    setMoveError(null);
    const folderIdToSend = targetFolderId === '' ? null : Number(targetFolderId);
    try {
      await dispatch(updateDocument({ id: selectedDocId, data: { folderId: folderIdToSend } })).unwrap();
      setMoveModalOpen(false);
      setTargetFolderId('');
    } catch (error) {
      console.error('Move failed:', error);
      setMoveError('Failed to move document. Please try again.');
    }
  };

  const openShareModal = (doc: Document) => {
    setShareDocument(doc);
    setShareModalOpen(true);
    handleMenuClose();
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setShareDocument(null);
  };

  const openVersionsModal = (doc: Document) => {
    setSelectedDocument(doc);
    setVersionsModalOpen(true);
    handleMenuClose();
  };

  // ── Bulk select ─────────────────────────────────────────────────────────────

  const toggleBulkMode = () => {
    setBulkMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} document(s)?`)) return;
    setBulkDeleting(true);
    for (const id of Array.from(selectedIds)) {
      try { await dispatch(deleteDocument(id)).unwrap(); } catch {}
    }
    setBulkDeleting(false);
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  // ── Filtering ────────────────────────────────────────────────────────────────

  const filteredDocuments = documents.filter((doc) => {
    const matchesQuery =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      tagFilter === null || (doc.tags && doc.tags.some((t) => t.id === tagFilter));
    return matchesQuery && matchesTag;
  });

  // ── Formatters ───────────────────────────────────────────────────────────────

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <PageHeader
        title="Documents"
        subtitle="Search, preview, and manage your files securely"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Documents' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant={bulkMode ? 'contained' : 'outlined'}
              color={bulkMode ? 'secondary' : 'inherit'}
              startIcon={bulkMode ? <SelectIcon /> : <UnselectIcon />}
              onClick={toggleBulkMode}
            >
              {bulkMode ? 'Cancel Select' : 'Select'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Document
            </Button>
          </Stack>
        }
      />

      {/* Search + Tag Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            minWidth: 260,
            bgcolor: '#F2F4F7',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': { backgroundColor: '#F2F4F7' },
          }}
        />
      </Box>

      {/* Tag filter chips */}
      {availableTags.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            size="small"
            onClick={() => setTagFilter(null)}
            color={tagFilter === null ? 'primary' : 'default'}
            icon={<TagIcon />}
          />
          {availableTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}
              sx={{
                bgcolor: tagFilter === tag.id
                  ? (tag.color || '#007BFF')
                  : alpha(tag.color || '#007BFF', 0.12),
                color: tagFilter === tag.id ? '#fff' : (tag.color || '#007BFF'),
                fontWeight: tagFilter === tag.id ? 700 : 500,
                '&:hover': { bgcolor: alpha(tag.color || '#007BFF', 0.25) },
              }}
            />
          ))}
        </Stack>
      )}

      {/* Documents Grid */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {Array.from({ length: 6 }).map((_, i) => <DocumentSkeleton key={i} />)}
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No documents found</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchQuery || tagFilter ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
          </Typography>
          {!searchQuery && !tagFilter && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUploadModalOpen(true)}>
              Upload Document
            </Button>
          )}
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {filteredDocuments.map((doc) => {
            const isSelected = selectedIds.has(doc.id);
            const expiry = getExpiryInfo((doc as any).expiresAt);
            return (
              <Card
                key={doc.id}
                onClick={bulkMode ? () => toggleSelect(doc.id) : undefined}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 8px 20px rgba(11,29,46,0.06)',
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  cursor: bulkMode ? 'pointer' : 'default',
                  bgcolor: isSelected ? alpha('#007BFF', 0.04) : 'background.paper',
                  transition: 'border-color 0.15s, background 0.15s',
                  position: 'relative',
                }}
              >
                {/* Bulk select checkbox */}
                {bulkMode && (
                  <Checkbox
                    checked={isSelected}
                    size="small"
                    sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
                    onClick={(e) => { e.stopPropagation(); toggleSelect(doc.id); }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DocumentIcon sx={{ mr: 1, color: 'primary.main', flexShrink: 0 }} />
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                      {doc.title}
                    </Typography>
                    {!bulkMode && (
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, doc.id)}>
                        <MoreIcon />
                      </IconButton>
                    )}
                  </Box>

                  {doc.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {doc.description}
                    </Typography>
                  )}

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {doc.tags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: alpha(tag.color || '#607D8B', 0.12),
                            color: tag.color || '#607D8B',
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip size="small" label={doc.fileName} icon={<DocumentIcon />} />
                    {doc.folder && (
                      <Chip size="small" label={doc.folder.name} icon={<FolderIcon />} color="secondary" />
                    )}
                    {expiry && (
                      <Chip size="small" label={expiry.label} color={expiry.color} />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                    {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                  </Typography>
                </CardContent>

                {!bulkMode && (
                  <CardActions>
                    <Button size="small" onClick={() => handlePreview(doc)}>Preview</Button>
                    <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(doc.id, doc.fileName)}>
                      Download
                    </Button>
                  </CardActions>
                )}
              </Card>
            );
          })}
        </Box>
      )}

      {/* Bulk action bar */}
      {bulkMode && selectedIds.size > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            bgcolor: 'grey.900',
            color: '#fff',
            borderRadius: 3,
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedIds.size} selected
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            sx={{ fontWeight: 700 }}
          >
            {bulkDeleting ? 'Deleting…' : 'Delete Selected'}
          </Button>
          <Button
            size="small"
            sx={{ color: 'rgba(255,255,255,0.7)' }}
            onClick={() => setSelectedIds(new Set())}
          >
            Deselect all
          </Button>
        </Box>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { const doc = documents.find(d => d.id === selectedDocId); if (doc) handlePreview(doc); }}>
          <DocumentIcon sx={{ mr: 1 }} /> Preview
        </MenuItem>
        <MenuItem onClick={() => { const doc = documents.find(d => d.id === selectedDocId); if (doc) openShareModal(doc); }}>
          <ShareIcon sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem onClick={() => selectedDocId && openMoveModal(selectedDocId)}>
          <FolderIcon sx={{ mr: 1 }} /> Move to folder
        </MenuItem>
        <MenuItem onClick={() => { const doc = documents.find(d => d.id === selectedDocId); if (doc) openVersionsModal(doc); }}>
          <HistoryIcon sx={{ mr: 1 }} /> Version history
        </MenuItem>
        <MenuItem onClick={() => selectedDocId && handleDownload(selectedDocId, documents.find(d => d.id === selectedDocId)?.fileName || '')}>
          <DownloadIcon sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={() => selectedDocId && handleDelete(selectedDocId)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Upload Modal */}
      <UploadDocumentModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />

      {/* Preview Modal */}
      <DocumentPreview open={previewModalOpen} onClose={handlePreviewClose} document={selectedDocument} />

      {/* Share Modal */}
      <ShareDocumentDialog open={shareModalOpen} document={shareDocument} onClose={closeShareModal} />

      {/* Version History Modal */}
      <DocumentVersionsDialog
        open={versionsModalOpen}
        document={selectedDocument}
        onClose={() => { setVersionsModalOpen(false); setSelectedDocument(null); }}
      />

      {/* Move to Folder Modal */}
      <Dialog open={moveModalOpen} onClose={() => setMoveModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Move Document to Folder</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Folder</InputLabel>
              <Select
                value={targetFolderId}
                label="Folder"
                onChange={(e: SelectChangeEvent<number | ''>) =>
                  setTargetFolderId(e.target.value === '' ? '' : Number(e.target.value))
                }
              >
                <MenuItem value=""><em>No Folder</em></MenuItem>
                {folders.map((folder) => (
                  <MenuItem key={folder.id} value={folder.id}>{folder.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleMove} disabled={loading}>Move</Button>
        </DialogActions>
        {moveError && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Alert severity="error">{moveError}</Alert>
          </Box>
        )}
      </Dialog>
    </Layout>
  );
};

export default Documents;
