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
  TablePagination,
  Chip,
  Stack,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { AuditLog } from '../types';
import apiService from '../services/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const ACTION_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  upload: 'success',
  download: 'info',
  view: 'default',
  update: 'primary',
  delete: 'error',
  share: 'warning',
  login: 'success',
  logout: 'default',
  register: 'success',
  'access-request': 'warning',
};

const actionColor = (action: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_COLORS[key] : 'default';
};

const KNOWN_ACTIONS = [
  'upload', 'download', 'view', 'update', 'delete',
  'share', 'login', 'logout', 'register', 'access-request',
];

const AuditLogs: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchAction, setSearchAction] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Detail popover
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
  }, [isAuthenticated, navigate]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getAuditLogs({
        page: page + 1,
        limit: rowsPerPage,
        action: actionFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } catch {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, actionFilter, startDate, endDate]);

  useEffect(() => {
    if (isAuthenticated) loadLogs();
  }, [isAuthenticated, loadLogs]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleApplyFilters = () => {
    setActionFilter(searchAction);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchAction('');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <Layout>
      <PageHeader
        title="Audit Logs"
        subtitle={
          isAdmin
            ? 'Full activity trail across all users and documents'
            : 'Your personal activity history'
        }
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Audit Logs' },
        ]}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Toggle filters">
          <IconButton onClick={() => setShowFilters((v) => !v)} color={showFilters ? 'primary' : 'default'}>
            <FilterIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton onClick={loadLogs} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Filter Panel */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Action type</InputLabel>
              <Select
                label="Action type"
                value={searchAction}
                onChange={(e) => setSearchAction(e.target.value)}
              >
                <MenuItem value="">All actions</MenuItem>
                {KNOWN_ACTIONS.map((a) => (
                  <MenuItem key={a} value={a} sx={{ textTransform: 'capitalize' }}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="From date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={1}>
              <Tooltip title="Apply filters">
                <IconButton color="primary" onClick={handleApplyFilters}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear filters">
                <IconButton onClick={handleClearFilters}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>
      </Collapse>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600, width: 160 }}>Timestamp</TableCell>
                {isAdmin && <TableCell sx={{ fontWeight: 600 }}>User</TableCell>}
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 130 }}>IP Address</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5}>
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Loading logs…
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5}>
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      No audit logs found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow
                      sx={{
                        cursor: log.details ? 'pointer' : 'default',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(log.createdAt)}
                        </Typography>
                      </TableCell>

                      {isAdmin && (
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {(log.user as any)?.fullName || (log.user as any)?.username || `#${log.userId}`}
                          </Typography>
                        </TableCell>
                      )}

                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          color={actionColor(log.action)}
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell>
                        {(log.document as any)?.title ? (
                          <Typography variant="body2">
                            {(log.document as any).title}
                          </Typography>
                        ) : log.documentId ? (
                          <Typography variant="caption" color="text.secondary">
                            Document #{log.documentId}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {log.ipAddress || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {log.details && (
                          <Tooltip title="View details">
                            <IconButton size="small" color={expandedRow === log.id ? 'primary' : 'default'}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expandable details row */}
                    {expandedRow === log.id && log.details && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 5} sx={{ py: 0 }}>
                          <Collapse in={expandedRow === log.id}>
                            <Box
                              sx={{
                                m: 1,
                                p: 1.5,
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.78rem',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                maxHeight: 200,
                                overflow: 'auto',
                              }}
                            >
                              {JSON.stringify(log.details, null, 2)}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Layout>
  );
};

export default AuditLogs;
