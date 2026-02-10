import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  Stack,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import apiService from '../services/api';
import { AccessRequest } from '../types';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const AccessRequests: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [myRequests, setMyRequests] = useState<AccessRequest[]>([]);

  const [requestDocumentId, setRequestDocumentId] = useState('');
  const [requestAccessLevel, setRequestAccessLevel] = useState<'viewer' | 'commenter' | 'editor'>('viewer');
  const [requestMessage, setRequestMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);
  const [actionRequest, setActionRequest] = useState<AccessRequest | null>(null);
  const [actionAccessLevel, setActionAccessLevel] = useState<'viewer' | 'commenter' | 'editor'>('viewer');
  const [actionResponse, setActionResponse] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadRequests();
  }, [isAuthenticated, navigate]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, mine] = await Promise.all([
        apiService.getPendingAccessRequests(),
        apiService.getMyAccessRequests(),
      ]);
      setPendingRequests(pending);
      setMyRequests(mine);
    } catch (err) {
      setError('Failed to load access requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    const documentId = Number(requestDocumentId);
    if (!documentId) {
      setFormError('Document ID is required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      await apiService.submitAccessRequest({
        documentId,
        requestedAccess: requestAccessLevel,
        message: requestMessage || undefined,
      });
      setRequestDocumentId('');
      setRequestAccessLevel('viewer');
      setRequestMessage('');
      await loadRequests();
      setTab(1);
    } catch (err) {
      setFormError('Failed to submit access request.');
    } finally {
      setFormLoading(false);
    }
  };

  const openActionDialog = (request: AccessRequest, type: 'approve' | 'deny') => {
    setActionRequest(request);
    setActionType(type);
    setActionAccessLevel(request.requestedAccess);
    setActionResponse('');
    setActionOpen(true);
  };

  const closeActionDialog = () => {
    setActionOpen(false);
    setActionRequest(null);
    setActionType(null);
    setActionResponse('');
  };

  const handleActionSubmit = async () => {
    if (!actionRequest || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        await apiService.approveAccessRequest(actionRequest.id, {
          accessLevel: actionAccessLevel,
          response: actionResponse || undefined,
        });
      } else {
        await apiService.denyAccessRequest(actionRequest.id, {
          response: actionResponse || undefined,
        });
      }
      closeActionDialog();
      await loadRequests();
    } catch (err) {
      setError('Failed to update access request.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <PageHeader
        title="Access Requests"
        subtitle="Submit new requests and review pending access approvals"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Access Requests' },
        ]}
      />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Request access to a document
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Document ID"
              value={requestDocumentId}
              onChange={(event) => setRequestDocumentId(event.target.value)}
              size="small"
              sx={{ minWidth: 160 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Access level</InputLabel>
              <Select
                label="Access level"
                value={requestAccessLevel}
                onChange={(event) =>
                  setRequestAccessLevel(event.target.value as 'viewer' | 'commenter' | 'editor')
                }
              >
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="commenter">Commenter</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Message (optional)"
              value={requestMessage}
              onChange={(event) => setRequestMessage(event.target.value)}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleSubmitRequest}
              disabled={formLoading}
              sx={{ minWidth: 160 }}
            >
              Submit request
            </Button>
          </Stack>
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 2 }}>
            <Tab label={`Pending (${pendingRequests.length})`} />
            <Tab label={`My Requests (${myRequests.length})`} />
          </Tabs>

          {loading && <Typography>Loading requests...</Typography>}

          {!loading && tab === 0 && (
            <Stack spacing={2}>
              {pendingRequests.length === 0 ? (
                <Typography color="text.secondary">No pending requests right now.</Typography>
              ) : (
                pendingRequests.map((request) => (
                  <Paper key={request.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {request.document?.title || `Document #${request.documentId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Requested by {request.requester?.fullName || request.requester?.username || `User #${request.requesterId}`}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                          <Chip label={request.requestedAccess} size="small" color="primary" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(request.createdAt)}
                          </Typography>
                        </Stack>
                        {request.message && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            "{request.message}"
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => openActionDialog(request, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DenyIcon />}
                          onClick={() => openActionDialog(request, 'deny')}
                        >
                          Deny
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          )}

          {!loading && tab === 1 && (
            <Stack spacing={2}>
              {myRequests.length === 0 ? (
                <Typography color="text.secondary">You have not submitted any requests.</Typography>
              ) : (
                myRequests.map((request) => (
                  <Paper key={request.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {request.document?.title || `Document #${request.documentId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Requested access: {request.requestedAccess}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Submitted {formatDate(request.createdAt)}
                        </Typography>
                        {request.responseMessage && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Response: {request.responseMessage}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={request.status}
                        color={
                          request.status === 'approved'
                            ? 'success'
                            : request.status === 'denied'
                            ? 'error'
                            : 'warning'
                        }
                        sx={{ textTransform: 'capitalize', alignSelf: 'flex-start' }}
                      />
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          )}
        </Paper>

      <Dialog open={actionOpen} onClose={closeActionDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {actionType === 'approve' ? 'Approve access request' : 'Deny access request'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'approve' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Access level</InputLabel>
              <Select
                label="Access level"
                value={actionAccessLevel}
                onChange={(event) =>
                  setActionAccessLevel(event.target.value as 'viewer' | 'commenter' | 'editor')
                }
              >
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="commenter">Commenter</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField
            label="Response (optional)"
            value={actionResponse}
            onChange={(event) => setActionResponse(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleActionSubmit}
            disabled={actionLoading}
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approve' : 'Deny'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AccessRequests;
