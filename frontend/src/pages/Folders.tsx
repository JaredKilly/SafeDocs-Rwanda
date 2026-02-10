import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Stack,
  Card,
  CardContent,
  Grid,
  alpha,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FolderOpen as FolderOpenIcon,
  CreateNewFolder as CreateFolderIcon,
} from '@mui/icons-material';
import { fetchFolders, createFolder, deleteFolder } from '../store/documentsSlice';
import { AppDispatch, RootState } from '../store';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const Folders: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { folders, loading } = useSelector((state: RootState) => state.documents);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchFolders());
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await dispatch(createFolder({ name })).unwrap();
      setName('');
    } catch (error) {
      console.error('Create folder failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this folder?')) {
      try {
        await dispatch(deleteFolder(id)).unwrap();
      } catch (error) {
        console.error('Delete folder failed:', error);
      }
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Folders"
        subtitle="Organize your documents into folders for better management"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Folders' },
        ]}
      />

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #FF7A21 0%, #FF8F45 100%)',
              color: 'white',
              '&:hover': {
                boxShadow: '0 12px 28px rgba(255, 122, 33, 0.3)',
                transform: 'translateY(-4px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Folders
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {folders.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <FolderIcon sx={{ fontSize: 48 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              border: '2px dashed',
              borderColor: 'primary.main',
              bgcolor: alpha('#007BFF', 0.05),
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: alpha('#007BFF', 0.1),
                transform: 'translateY(-4px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Quick Action
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Create New Folder
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Organize your documents
                  </Typography>
                </Box>
                <CreateFolderIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Folder Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
          <TextField
            label="Folder Name"
            placeholder="Enter folder name..."
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            sx={{ minWidth: 140, height: 56 }}
          >
            Create
          </Button>
        </Stack>
      </Paper>

      {/* Folders List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Your Folders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {folders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <FolderOpenIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              No folders yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first folder to organize your documents
            </Typography>
          </Box>
        ) : (
          <List>
            {folders.map((folder) => (
              <ListItem
                key={folder.id}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: alpha('#007BFF', 0.04),
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/documents')}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(folder.id);
                    }}
                    sx={{
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: alpha('#E5484D', 0.1),
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha('#FF7A21', 0.1),
                    }}
                  >
                    <FolderIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {folder.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(folder.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Layout>
  );
};

export default Folders;
