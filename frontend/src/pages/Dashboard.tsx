import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import { fetchDocuments, fetchFolders } from '../store/documentsSlice';
import { AppDispatch, RootState } from '../store';

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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SafeDocs Rwanda
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.fullName} ({user?.role})
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to SafeDocs Rwanda
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Document Management System - Your documents are safe with us
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DocumentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h3" component="div">
                      {documents.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Documents
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FolderIcon sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="h3" component="div">
                      {folders.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Folders
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              startIcon={<DocumentIcon />}
              onClick={() => navigate('/documents')}
            >
              View All Documents
            </Button>
            <Button variant="outlined" startIcon={<FolderIcon />}>
              Manage Folders
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Documents
          </Typography>
          {documents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No documents yet. Upload your first document to get started!
            </Typography>
          ) : (
            <Box>
              {documents.slice(0, 5).map((doc) => (
                <Box key={doc.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body1">{doc.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doc.fileName} • {new Date(doc.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
