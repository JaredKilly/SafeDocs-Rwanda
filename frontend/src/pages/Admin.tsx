import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Select,
  MenuItem,
  Switch,
  Tooltip,
  Alert,
  Stack,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  PersonOff as InactiveIcon,
  ManageAccounts as ManagerIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { User } from '../types';
import apiService from '../services/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color,
}) => (
  <Paper sx={{ p: 2.5, flex: 1, minWidth: 140 }}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: `${color}18`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'user'>('all');

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    username: '', email: '', password: '', fullName: '', role: 'user' as 'admin' | 'manager' | 'user',
  });

  const handleCreateUser = async () => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      const newUser = await apiService.createUser(createForm);
      setUsers((prev) => [newUser, ...prev]);
      setCreateOpen(false);
      setCreateForm({ username: '', email: '', password: '', fullName: '', role: 'user' });
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAllUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (currentUser?.role !== 'admin') { navigate('/dashboard'); return; }
    loadUsers();
  }, [isAuthenticated, currentUser, navigate, loadUsers]);

  const handleRoleChange = async (userId: number, role: 'admin' | 'manager' | 'user') => {
    try {
      const updated = await apiService.updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
    } catch {
      setError('Failed to update role.');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const updated = await apiService.toggleUserStatus(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: updated.isActive } : u)));
    } catch {
      setError('Failed to toggle status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length,
    managers: users.filter((u) => u.role === 'manager').length,
  };

  const roleColor: Record<string, 'warning' | 'primary' | 'default'> = {
    admin: 'warning',
    manager: 'primary',
    user: 'default',
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Layout>
      <PageHeader
        title="Admin Panel"
        subtitle="Manage users, roles, and account status across the platform"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Admin Panel' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => { setCreateError(null); setCreateOpen(true); }}
          >
            Add User
          </Button>
        }
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        <StatCard label="Total Users" value={stats.total} icon={<PeopleIcon />} color="#007BFF" />
        <StatCard label="Active" value={stats.active} icon={<PeopleIcon />} color="#2E7D32" />
        <StatCard label="Admins" value={stats.admins} icon={<AdminIcon />} color="#ED6C02" />
        <StatCard label="Managers" value={stats.managers} icon={<ManagerIcon />} color="#0288D1" />
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name, email or username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* User Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Active</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Loading users…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const initials = (u.fullName || u.username).slice(0, 2).toUpperCase();
                return (
                  <TableRow
                    key={u.id}
                    sx={{
                      opacity: u.isActive ? 1 : 0.6,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: isSelf ? 'secondary.main' : 'primary.main',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {u.fullName || u.username}
                            {isSelf && (
                              <Chip label="You" size="small" sx={{ ml: 1, height: 16, fontSize: '0.65rem' }} />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{u.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{u.email}</Typography>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={u.role}
                        size="small"
                        disabled={isSelf}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value as 'admin' | 'manager' | 'user')
                        }
                        sx={{ minWidth: 110, height: 30, fontSize: '0.8rem' }}
                        renderValue={(val) => (
                          <Chip
                            label={val}
                            size="small"
                            color={roleColor[val]}
                            sx={{ textTransform: 'capitalize', cursor: 'pointer', height: 20 }}
                          />
                        )}
                      >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title={isSelf ? "Can't deactivate yourself" : u.isActive ? 'Deactivate' : 'Activate'}>
                        <span>
                          <Switch
                            checked={u.isActive}
                            size="small"
                            disabled={isSelf}
                            color="success"
                            onChange={() => handleToggleStatus(u.id)}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(u.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title={isSelf ? "Can't delete yourself" : 'Delete user'}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isSelf}
                            onClick={() => setDeleteTarget(u)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Inactive legend */}
      {users.some((u) => !u.isActive) && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
          <InactiveIcon fontSize="small" color="disabled" />
          <Typography variant="caption" color="text.secondary">
            Dimmed rows are deactivated accounts — they cannot log in.
          </Typography>
        </Stack>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              required
              fullWidth
              size="small"
              value={createForm.username}
              onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
            />
            <TextField
              label="Full Name"
              fullWidth
              size="small"
              value={createForm.fullName}
              onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
            />
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              size="small"
              value={createForm.email}
              onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
            />
            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              size="small"
              value={createForm.password}
              onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={createForm.role}
                onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as typeof f.role }))}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={createLoading || !createForm.username || !createForm.email || !createForm.password}
            onClick={handleCreateUser}
          >
            {createLoading ? 'Creating…' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete{' '}
            <strong>{deleteTarget?.fullName || deleteTarget?.username}</strong> and all their data. This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteLoading}
            onClick={handleDeleteConfirm}
          >
            {deleteLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Admin;
