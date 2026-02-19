import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Stack, Button, TextField, InputAdornment,
  Avatar, Chip, IconButton, Tooltip, Alert, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tab, Tabs, CircularProgress,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Link as LinkIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { Employee, HRCategory, HRStats, HR_CATEGORY_LABELS, EmployeeStatus } from '../types';
import apiService from '../services/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import DocumentPicker from '../components/DocumentPicker';
import { Document } from '../types';

// ─── helpers ────────────────────────────────────────────────

const statusColor: Record<EmployeeStatus, 'success' | 'warning' | 'error'> = {
  active: 'success', inactive: 'warning', terminated: 'error',
};

const categoryColor: Record<HRCategory, string> = {
  contract: '#007BFF', id_copy: '#9B51E0', certificate: '#00B89F',
  performance_review: '#FF7A21', onboarding: '#0288D1', medical: '#E5484D',
  payslip: '#2E7D32', other: '#666',
};

const daysUntil = (d: string) =>
  Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

const initForm = (): Partial<Employee> => ({
  employeeId: '', fullName: '', department: '', position: '',
  email: '', phone: '', startDate: '', status: 'active', notes: '',
});

// ─── Stat card ───────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <Paper sx={{ p: 2.5, flex: 1, minWidth: 130 }}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    </Stack>
  </Paper>
);

// ─── Main Component ──────────────────────────────────────────
const HR: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<HRStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Tabs
  const [tab, setTab] = useState(0);

  // Add / Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>(initForm());
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Link document dialog
  const [linkTarget, setLinkTarget] = useState<Employee | null>(null);
  const [linkDocId, setLinkDocId] = useState('');
  const [linkDocTitle, setLinkDocTitle] = useState('');
  const [linkCategory, setLinkCategory] = useState<HRCategory>('other');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [emps, s] = await Promise.all([
        apiService.getEmployees(),
        apiService.getHRStats(),
      ]);
      setEmployees(emps);
      setStats(s);
    } catch {
      setError('Failed to load HR data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role === 'user') { navigate('/dashboard'); return; }
    loadAll();
  }, [isAuthenticated, user, navigate, loadAll]);

  // ── Form helpers ────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setFormData(initForm());
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setFormData({
      employeeId: emp.employeeId, fullName: emp.fullName, department: emp.department,
      position: emp.position, email: emp.email || '', phone: emp.phone || '',
      startDate: emp.startDate ? emp.startDate.slice(0, 10) : '',
      endDate: emp.endDate ? emp.endDate.slice(0, 10) : '',
      status: emp.status, notes: emp.notes || '',
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editTarget) {
        const updated = await apiService.updateEmployee(editTarget.id, formData);
        setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        const created = await apiService.createEmployee(formData);
        setEmployees(prev => [created, ...prev]);
        setStats(s => s ? { ...s, stats: { ...s.stats, total: s.stats.total + 1, active: s.stats.active + 1 } } : s);
      }
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Save failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteEmployee(deleteTarget.id);
      setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete employee.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLink = async () => {
    if (!linkTarget || !linkDocId) return;
    setLinkLoading(true);
    setLinkError(null);
    try {
      await apiService.linkDocumentToEmployee(linkTarget.id, parseInt(linkDocId), linkCategory);
      await loadAll();
      setLinkTarget(null);
      setLinkDocId('');
    } catch (err: any) {
      setLinkError(err.response?.data?.error || 'Failed to link document.');
    } finally {
      setLinkLoading(false);
    }
  };

  // ── Filters ─────────────────────────────────────────────────
  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.fullName.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) || e.position.toLowerCase().includes(q);
    const matchDept = !deptFilter || e.department === deptFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchQ && matchDept && matchStatus;
  });

  const departments = stats?.departments ?? [];

  // ── Expiry alerts ────────────────────────────────────────────
  const expiringDocs = stats?.expiringDocuments ?? [];
  const criticalDocs = expiringDocs.filter(ed => {
    const d = (ed.document as any)?.expiresAt;
    return d && daysUntil(d) <= 30;
  });

  return (
    <Layout>
      <PageHeader
        title="HR Documents"
        subtitle="Manage employee records, contracts, certificates, and document expiry"
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'HR Documents' }]}
        action={
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openAdd}>
            Add Employee
          </Button>
        }
      />

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {/* Critical expiry banner */}
      {criticalDocs.length > 0 && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <strong>{criticalDocs.length} document{criticalDocs.length > 1 ? 's' : ''} expiring within 30 days</strong> — review them in the Expiry Alerts tab.
        </Alert>
      )}

      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        <StatCard label="Total Employees" value={stats?.stats.total ?? 0} icon={<PeopleIcon />} color="#007BFF" />
        <StatCard label="Active" value={stats?.stats.active ?? 0} icon={<ActiveIcon />} color="#2E7D32" />
        <StatCard label="Inactive" value={stats?.stats.inactive ?? 0} icon={<InactiveIcon />} color="#ED6C02" />
        <StatCard label="Terminated" value={stats?.stats.terminated ?? 0} icon={<WorkIcon />} color="#9E9E9E" />
        <StatCard label="Expiring (60d)" value={expiringDocs.length} icon={<WarningIcon />} color={expiringDocs.length > 0 ? '#E5484D' : '#2E7D32'} />
      </Stack>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Employees" />
          <Tab label={`Expiry Alerts${expiringDocs.length > 0 ? ` (${expiringDocs.length})` : ''}`} />
        </Tabs>
      </Paper>

      {/* ── Tab 0: Employees ── */}
      {tab === 0 && (
        <>
          {/* Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder="Search by name, ID, department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Department</InputLabel>
              <Select label="Department" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                <MenuItem value="">All Departments</MenuItem>
                {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Docs</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(emp => {
                  const initials = emp.fullName.slice(0, 2).toUpperCase();
                  const docCount = emp.employeeDocuments?.length ?? 0;
                  return (
                    <TableRow key={emp.id} sx={{ opacity: emp.status === 'terminated' ? 0.55 : 1, '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
                            {initials}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{emp.fullName}</Typography>
                            {emp.email && <Typography variant="caption" color="text.secondary">{emp.email}</Typography>}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell><Typography variant="body2" fontFamily="monospace">{emp.employeeId}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{emp.department}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{emp.position}</Typography></TableCell>
                      <TableCell align="center">
                        <Chip label={emp.status} size="small" color={statusColor[emp.status]} sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={docCount} size="small" variant="outlined" color={docCount > 0 ? 'primary' : 'default'} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Link Document">
                            <IconButton size="small" color="primary" onClick={() => { setLinkTarget(emp); setLinkDocId(''); setLinkDocTitle(''); setLinkCategory('other'); setLinkError(null); setPickerOpen(true); }}>
                              <LinkIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(emp)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(emp)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* ── Tab 1: Expiry Alerts ── */}
      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          {expiringDocs.length === 0 ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
              <ActiveIcon sx={{ fontSize: 56, color: 'success.main' }} />
              <Typography variant="h6" color="text.secondary">No documents expiring in the next 60 days</Typography>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {expiringDocs.map(ed => {
                const doc = ed.document as any;
                const emp = ed.employee as any;
                if (!doc || !emp) return null;
                const days = daysUntil(doc.expiresAt);
                const urgent = days <= 7;
                const warning = days <= 30;
                return (
                  <Paper
                    key={ed.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderColor: urgent ? 'error.main' : warning ? 'warning.main' : 'divider',
                      borderWidth: urgent ? 2 : 1,
                    }}
                  >
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Chip
                            label={days <= 0 ? 'EXPIRED' : `${days}d left`}
                            size="small"
                            color={urgent ? 'error' : warning ? 'warning' : 'default'}
                            sx={{ fontWeight: 700 }}
                          />
                          <Chip
                            label={HR_CATEGORY_LABELS[ed.hrCategory]}
                            size="small"
                            sx={{ bgcolor: `${categoryColor[ed.hrCategory]}18`, color: categoryColor[ed.hrCategory], fontWeight: 600 }}
                          />
                        </Stack>
                        <Typography variant="body2" fontWeight={600}>{doc.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.fullName} · {emp.employeeId} · {emp.department}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: { sm: 'right' } }}>
                        <Typography variant="caption" color="text.secondary">
                          Expires: {new Date(doc.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Paper>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Employee ID" required size="small" fullWidth value={formData.employeeId}
                disabled={!!editTarget}
                onChange={e => setFormData(f => ({ ...f, employeeId: e.target.value }))}
                helperText="e.g. EMP-001" />
              <TextField label="Full Name" required size="small" fullWidth value={formData.fullName}
                onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Department" required size="small" fullWidth value={formData.department}
                onChange={e => setFormData(f => ({ ...f, department: e.target.value }))} />
              <TextField label="Position / Title" required size="small" fullWidth value={formData.position}
                onChange={e => setFormData(f => ({ ...f, position: e.target.value }))} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Email" type="email" size="small" fullWidth value={formData.email}
                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
              <TextField label="Phone" size="small" fullWidth value={formData.phone}
                onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Start Date" type="date" size="small" fullWidth value={formData.startDate}
                onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }} />
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={formData.status}
                  onChange={e => setFormData(f => ({ ...f, status: e.target.value as EmployeeStatus }))}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="Notes (optional)" multiline rows={2} size="small" fullWidth value={formData.notes}
              onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={formLoading || !formData.employeeId || !formData.fullName || !formData.department || !formData.position}
            onClick={handleSave}
          >
            {formLoading ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Document Picker ── */}
      <DocumentPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={`Select Document for ${linkTarget?.fullName || ''}`}
        onSelect={(doc: Document) => {
          setLinkDocId(String(doc.id));
          setLinkDocTitle(doc.title);
          setPickerOpen(false);
        }}
      />

      {/* ── Link Document Dialog ── */}
      <Dialog open={!!linkTarget && !pickerOpen && !!linkDocId} onClose={() => setLinkTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Link Document — {linkTarget?.fullName}</DialogTitle>
        <DialogContent>
          {linkError && <Alert severity="error" sx={{ mb: 2 }}>{linkError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="body2" color="text.secondary">Selected Document</Typography>
              <Typography variant="body1" fontWeight={600}>{linkDocTitle}</Typography>
              <Typography variant="caption" color="text.secondary">ID: {linkDocId}</Typography>
            </Paper>
            <Button variant="outlined" size="small" onClick={() => setPickerOpen(true)}>
              Change Document
            </Button>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={linkCategory} onChange={e => setLinkCategory(e.target.value as HRCategory)}>
                {(Object.keys(HR_CATEGORY_LABELS) as HRCategory[]).map(k => (
                  <MenuItem key={k} value={k}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: categoryColor[k] }} />
                      <span>{HR_CATEGORY_LABELS[k]}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={linkLoading ? <CircularProgress size={14} color="inherit" /> : <LinkIcon />}
            disabled={linkLoading || !linkDocId}
            onClick={handleLink}
          >
            {linkLoading ? 'Linking…' : 'Link Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete employee?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently remove <strong>{deleteTarget?.fullName}</strong> ({deleteTarget?.employeeId})
            and all their document links. Documents themselves are not deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteLoading} onClick={handleDelete}>
            {deleteLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default HR;
