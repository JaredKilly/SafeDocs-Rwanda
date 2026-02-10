import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Stack,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  Scanner as ScannerIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  ArrowForward as ArrowForwardIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { fetchDocuments, fetchFolders } from '../store/documentsSlice';
import { AppDispatch, RootState } from '../store';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { documents, folders } = useSelector((state: RootState) => state.documents);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchDocuments({}));
      dispatch(fetchFolders());
    }
  }, [isAuthenticated, navigate, dispatch]);

  // Calculate some stats
  const totalSize = documents.reduce((acc, doc) => acc + doc.fileSize, 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Mock storage limit (you can make this dynamic)
  const storageLimit = 10 * 1024 * 1024 * 1024; // 10GB
  const storageUsed = totalSize;
  const storagePercent = (storageUsed / storageLimit) * 100;

  const recentDocs = documents
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your documents today
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              '&:hover': {
                boxShadow: '0 8px 20px rgba(11, 29, 46, 0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Total Documents
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {documents.length}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                      +12%
                    </Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: alpha('#007BFF', 0.1),
                    flexShrink: 0,
                  }}
                >
                  <DocumentIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              '&:hover': {
                boxShadow: '0 8px 20px rgba(11, 29, 46, 0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Total Folders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {folders.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Collections
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: alpha('#FF7A21', 0.1),
                    flexShrink: 0,
                  }}
                >
                  <FolderIcon sx={{ fontSize: 24, color: 'secondary.main' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              '&:hover': {
                boxShadow: '0 8px 20px rgba(11, 29, 46, 0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Storage Used
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word' }}>
                    {formatBytes(storageUsed)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {formatBytes(storageLimit)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: alpha('#1F9CEF', 0.1),
                    flexShrink: 0,
                  }}
                >
                  <FolderOpenIcon sx={{ fontSize: 24, color: 'success.main' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              '&:hover': {
                boxShadow: '0 8px 20px rgba(11, 29, 46, 0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    User Role
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, textTransform: 'capitalize' }}>
                    {user?.role}
                  </Typography>
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      height: 18,
                      bgcolor: alpha('#1F9CEF', 0.1),
                      color: 'success.main',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: alpha('#9B51E0', 0.1),
                    flexShrink: 0,
                  }}
                >
                  <GroupIcon sx={{ fontSize: 24, color: '#9B51E0' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Storage Progress */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Storage Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {storagePercent.toFixed(1)}% used
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={storagePercent}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: alpha('#007BFF', 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: 'linear-gradient(90deg, #007BFF 0%, #1F9CEF 100%)',
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {formatBytes(storageUsed)} of {formatBytes(storageLimit)} used
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ScannerIcon />}
              onClick={() => navigate('/scanner')}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                background: 'linear-gradient(135deg, #FF7A21 0%, #FF8F45 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #CC611A 0%, #FF7A21 100%)',
                },
              }}
            >
              Scan
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => navigate('/documents')}
              sx={{ py: 1.5, justifyContent: 'flex-start' }}
            >
              Upload
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FolderIcon />}
              onClick={() => navigate('/folders')}
              sx={{ py: 1.5, justifyContent: 'flex-start' }}
            >
              New Folder
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GroupIcon />}
              onClick={() => navigate('/groups')}
              sx={{ py: 1.5, justifyContent: 'flex-start' }}
            >
              Groups
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Documents */}
      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Recent Documents
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/documents')}
            sx={{ textTransform: 'none' }}
          >
            View all
          </Button>
        </Stack>

        {recentDocs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              No documents yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your first document to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<ScannerIcon />}
              onClick={() => navigate('/scanner')}
            >
              Scan Document
            </Button>
          </Box>
        ) : (
          <Stack spacing={0}>
            {recentDocs.map((doc, index) => (
              <Box
                key={doc.id}
                sx={{
                  py: 2,
                  px: 2,
                  borderBottom: index < recentDocs.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha('#007BFF', 0.04),
                  },
                }}
                onClick={() => navigate('/documents')}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha('#007BFF', 0.1),
                    mr: 2,
                  }}
                >
                  <DocumentIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {doc.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doc.fileName} • {new Date(doc.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                {doc.folder && (
                  <Chip
                    icon={<FolderIcon />}
                    label={doc.folder.name}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                )}
                <IconButton size="small">
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Layout>
  );
};

export default Dashboard;
