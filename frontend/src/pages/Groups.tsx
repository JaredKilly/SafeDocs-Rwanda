import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Group as GroupIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import apiService from '../services/api';
import { Group, GroupMemberDetails } from '../types';

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState<Group | null>(null);
  const [detailUserRole, setDetailUserRole] = useState<'admin' | 'member' | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [memberUserId, setMemberUserId] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'member'>('member');
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadGroups();
  }, [isAuthenticated, navigate]);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getGroups();
      setGroups(data);
    } catch (err) {
      setError('Failed to load groups.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }
    setCreateLoading(true);
    setError(null);
    try {
      await apiService.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      await loadGroups();
    } catch (err) {
      setError('Failed to create group.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openGroupDetails = async (group: Group) => {
    setDetailOpen(true);
    setDetailGroup(null);
    setDetailUserRole(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const response = await apiService.getGroup(group.id);
      setDetailGroup(response.group);
      setDetailUserRole(response.userRole);
    } catch (err) {
      setDetailError('Failed to load group details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeGroupDetails = () => {
    setDetailOpen(false);
    setDetailGroup(null);
    setDetailUserRole(null);
    setMemberUserId('');
    setMemberRole('member');
    setDetailError(null);
  };

  const refreshGroupDetails = async (groupId: number) => {
    try {
      const response = await apiService.getGroup(groupId);
      setDetailGroup(response.group);
      setDetailUserRole(response.userRole);
    } catch (err) {
      setDetailError('Failed to refresh group details.');
    }
  };

  const handleAddMember = async () => {
    if (!detailGroup) return;
    const userId = Number(memberUserId);
    if (!userId) {
      setDetailError('Valid user ID is required.');
      return;
    }
    setMemberActionLoading(true);
    setDetailError(null);
    try {
      await apiService.addGroupMember(detailGroup.id, { userId, role: memberRole });
      setMemberUserId('');
      setMemberRole('member');
      await refreshGroupDetails(detailGroup.id);
    } catch (err) {
      setDetailError('Failed to add member.');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleRemoveMember = async (member: GroupMemberDetails) => {
    if (!detailGroup) return;
    if (!window.confirm('Remove this member from the group?')) {
      return;
    }
    setMemberActionLoading(true);
    setDetailError(null);
    try {
      await apiService.removeGroupMember(detailGroup.id, member.userId);
      await refreshGroupDetails(detailGroup.id);
    } catch (err) {
      setDetailError('Failed to remove member.');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleUpdateMemberRole = async (member: GroupMemberDetails, role: 'admin' | 'member') => {
    if (!detailGroup || member.role === role) return;
    setMemberActionLoading(true);
    setDetailError(null);
    try {
      await apiService.updateGroupMemberRole(detailGroup.id, member.userId, role);
      await refreshGroupDetails(detailGroup.id);
    } catch (err) {
      setDetailError('Failed to update member role.');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm('Delete this group?')) {
      return;
    }
    try {
      await apiService.deleteGroup(groupId);
      if (detailGroup?.id === groupId) {
        closeGroupDetails();
      }
      await loadGroups();
    } catch (err) {
      setError('Failed to delete group.');
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Groups"
        subtitle="Organize teams and share documents faster"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Groups' },
        ]}
      />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create a new group
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Group name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            />
            <TextField
              label="Description (optional)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              startIcon={<GroupIcon />}
              onClick={handleCreate}
              disabled={createLoading}
              sx={{ minWidth: 160 }}
            >
              Create group
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your groups
          </Typography>
          {loading ? (
            <Typography>Loading groups...</Typography>
          ) : groups.length === 0 ? (
            <Typography color="text.secondary">No groups yet. Create one to get started.</Typography>
          ) : (
            <Stack spacing={2}>
              {groups.map((group) => (
                <Paper key={group.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {group.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description || 'No description'}
                      </Typography>
                      <Chip
                        size="small"
                        label={`Role: ${group.userRole || 'member'}`}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button variant="outlined" onClick={() => openGroupDetails(group)}>
                        View
                      </Button>
                      {group.userRole === 'admin' && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>

      <Dialog open={detailOpen} onClose={closeGroupDetails} fullWidth maxWidth="md">
        <DialogTitle>Group details</DialogTitle>
        <DialogContent>
          {detailLoading && <Typography>Loading group details...</Typography>}
          {detailError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {detailError}
            </Alert>
          )}
          {!detailLoading && detailGroup && (
            <>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {detailGroup.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {detailGroup.description || 'No description'}
              </Typography>

              {detailUserRole === 'admin' && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Add member
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="User ID"
                      value={memberUserId}
                      onChange={(event) => setMemberUserId(event.target.value)}
                      size="small"
                      sx={{ minWidth: 140 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        label="Role"
                        value={memberRole}
                        onChange={(event) => setMemberRole(event.target.value as 'admin' | 'member')}
                      >
                        <MenuItem value="member">Member</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={handleAddMember}
                      disabled={memberActionLoading}
                    >
                      Add member
                    </Button>
                  </Stack>
                </Paper>
              )}

              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Members
              </Typography>
              <List>
                {(detailGroup.members || []).map((member) => (
                  <ListItem key={`${member.groupId}-${member.userId}`} divider>
                    <ListItemText
                      primary={member.user?.fullName || member.user?.username || `User #${member.userId}`}
                      secondary={member.user?.email || `ID ${member.userId}`}
                    />
                    {detailUserRole === 'admin' ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={member.role}
                            onChange={(event) =>
                              handleUpdateMemberRole(member, event.target.value as 'admin' | 'member')
                            }
                          >
                            <MenuItem value="member">Member</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          color="error"
                          onClick={() => handleRemoveMember(member)}
                          disabled={memberActionLoading}
                        >
                          Remove
                        </Button>
                      </Stack>
                    ) : (
                      <Chip size="small" label={member.role} />
                    )}
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {detailGroup && detailUserRole === 'admin' && (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteGroup(detailGroup.id)}
            >
              Delete group
            </Button>
          )}
          <Button onClick={closeGroupDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Groups;
