import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import { fetchDocuments, deleteDocument, fetchFolders } from '../store/documentsSlice';
import { AppDispatch, RootState } from '../store';
import UploadDocumentModal from '../components/UploadDocumentModal';
import apiService from '../services/api';

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { documents, loading } = useSelector((state: RootState) => state.documents);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchDocuments({}));
      dispatch(fetchFolders());
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, docId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocId(docId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocId(null);
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

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SafeDocs Rwanda - Documents
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            Dashboard
          </Button>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.fullName}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header Actions */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadModalOpen(true)}
          >
            Upload Document
          </Button>
        </Box>

        {/* Documents Grid */}
        {loading ? (
          <Typography>Loading documents...</Typography>
        ) : filteredDocuments.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No documents found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchQuery
                ? 'Try adjusting your search'
                : 'Upload your first document to get started'}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setUploadModalOpen(true)}
              >
                Upload Document
              </Button>
            )}
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                      {doc.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, doc.id)}
                    >
                      <MoreIcon />
                    </IconButton>
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

                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      size="small"
                      label={doc.fileName}
                      icon={<DocumentIcon />}
                    />
                    {doc.folder && (
                      <Chip
                        size="small"
                        label={doc.folder.name}
                        icon={<FolderIcon />}
                        color="secondary"
                      />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                    {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedDocId && handleDownload(selectedDocId, documents.find(d => d.id === selectedDocId)?.fileName || '')}>
            <DownloadIcon sx={{ mr: 1 }} /> Download
          </MenuItem>
          <MenuItem onClick={() => selectedDocId && handleDelete(selectedDocId)} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Container>

      {/* Upload Modal */}
      <UploadDocumentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </Box>
  );
};

export default Documents;
