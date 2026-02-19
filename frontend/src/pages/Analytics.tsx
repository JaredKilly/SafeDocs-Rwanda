import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
} from '@mui/material';
import {
  Description as DocIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Assessment as AuditIcon,
  Business as OrgIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { RootState } from '../store';
import apiService from '../services/api';
import {
  AnalyticsOverview,
  DocumentAnalytics,
  UserActivityAnalytics,
  StorageAnalytics,
  AuditAnalytics,
  AnalyticsRange,
} from '../types';

const COLORS = {
  primary: '#007BFF',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#D32F2F',
  purple: '#9B51E0',
  info: '#0288D1',
};

const CHART_COLORS = [
  '#007BFF', '#2E7D32', '#ED6C02', '#D32F2F', '#9B51E0',
  '#0288D1', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
];

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (d: any) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return String(d);
  }
};

const formatBytesTooltip = (v: any) => [formatBytes(Number(v) || 0), 'Size'];

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [range, setRange] = useState<AnalyticsRange>('30d');

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [docAnalytics, setDocAnalytics] = useState<DocumentAnalytics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserActivityAnalytics | null>(null);
  const [storageData, setStorageData] = useState<StorageAnalytics | null>(null);
  const [auditData, setAuditData] = useState<AuditAnalytics | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin' && user?.role !== 'manager') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ov = await apiService.getAnalyticsOverview(range);
      setOverview(ov);

      switch (activeTab) {
        case 0: {
          const da = await apiService.getDocumentAnalytics(range);
          setDocAnalytics(da);
          break;
        }
        case 1:
          setDocAnalytics(await apiService.getDocumentAnalytics(range));
          break;
        case 2:
          setUserAnalytics(await apiService.getUserActivityAnalytics(range));
          break;
        case 3:
          setStorageData(await apiService.getStorageAnalytics(range));
          break;
        case 4:
          setAuditData(await apiService.getAuditAnalytics(range));
          break;
      }
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, range]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'manager')) {
      loadData();
    }
  }, [loadData, isAuthenticated, user]);

  return (
    <Layout>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Insights across documents, users, storage, and activity"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Analytics' },
        ]}
        action={
          <ToggleButtonGroup
            value={range}
            exclusive
            onChange={(_, v) => v && setRange(v)}
            size="small"
          >
            <ToggleButton value="7d">7 Days</ToggleButton>
            <ToggleButton value="30d">30 Days</ToggleButton>
            <ToggleButton value="90d">90 Days</ToggleButton>
            <ToggleButton value="all">All Time</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Overview stat cards */}
      {overview && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
          flexWrap="wrap"
        >
          <StatCard label="Total Documents" value={overview.totalDocuments} icon={<DocIcon />} color={COLORS.primary} />
          <StatCard label="Total Users" value={overview.totalUsers} icon={<PeopleIcon />} color={COLORS.success} />
          <StatCard label="Storage Used" value={formatBytes(overview.totalStorageBytes)} icon={<StorageIcon />} color={COLORS.warning} />
          <StatCard label="Organizations" value={overview.totalOrganizations} icon={<OrgIcon />} color={COLORS.purple} />
          <StatCard label="Folders" value={overview.totalFolders} icon={<FolderIcon />} color={COLORS.info} />
        </Stack>
      )}

      {/* Tab navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Documents" />
          <Tab label="Users" />
          <Tab label="Storage" />
          <Tab label="Audit" />
        </Tabs>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* ── Tab 0: Overview ────────────────────────────────────── */}
      {!loading && activeTab === 0 && docAnalytics && (
        <>
          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Documents Over Time
            </Typography>
            {docAnalytics.documentsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={docAnalytics.documentsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <RechartsTooltip labelFormatter={formatDate} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.primary}
                    fill={alpha(COLORS.primary, 0.15)}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No data available for the selected period.
              </Typography>
            )}
          </Paper>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                By File Type
              </Typography>
              {docAnalytics.byMimeType.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={docAnalytics.byMimeType.map((m) => ({
                        ...m,
                        name: m.mimeType.split('/').pop() || m.mimeType,
                      }))}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {docAnalytics.byMimeType.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No file type data yet.
                </Typography>
              )}
            </Paper>

            <Paper sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                By Module
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={docAnalytics.byModule}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="module" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {docAnalytics.byModule.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>
        </>
      )}

      {/* ── Tab 1: Documents ───────────────────────────────────── */}
      {!loading && activeTab === 1 && docAnalytics && (
        <>
          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Documents Over Time
            </Typography>
            {docAnalytics.documentsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={docAnalytics.documentsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <RechartsTooltip labelFormatter={formatDate} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No data available for the selected period.
              </Typography>
            )}
          </Paper>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <Paper sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                By File Type
              </Typography>
              {docAnalytics.byMimeType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={docAnalytics.byMimeType.map((m) => ({
                        ...m,
                        name: m.mimeType.split('/').pop() || m.mimeType,
                      }))}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {docAnalytics.byMimeType.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No file type data yet.
                </Typography>
              )}
            </Paper>

            <Paper sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                By Module
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={docAnalytics.byModule}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="module" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {docAnalytics.byModule.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>
        </>
      )}

      {/* ── Tab 2: Users ───────────────────────────────────────── */}
      {!loading && activeTab === 2 && userAnalytics && (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <StatCard label="Active Users" value={userAnalytics.activeUsers} icon={<PeopleIcon />} color={COLORS.success} />
            <StatCard label="Total Users" value={userAnalytics.totalUsers} icon={<PeopleIcon />} color={COLORS.primary} />
          </Stack>

          {userAnalytics.newUsersOverTime.length > 0 && (
            <Paper sx={{ p: 2.5, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                New Users Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userAnalytics.newUsersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <RechartsTooltip labelFormatter={formatDate} />
                  <Bar dataKey="count" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Top Uploaders
              </Typography>
              {userAnalytics.topUploaders.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Documents</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Total Size</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userAnalytics.topUploaders.map((u) => (
                        <TableRow key={u.userId}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.7rem' }}>
                                {(u.fullName || u.username).slice(0, 2).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {u.fullName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{u.count}</TableCell>
                          <TableCell align="right">{formatBytes(u.totalSize)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No upload data yet.
                </Typography>
              )}
            </Paper>

            <Paper sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Activity
              </Typography>
              {userAnalytics.recentActivity.length > 0 ? (
                <Stack spacing={1}>
                  {userAnalytics.recentActivity.map((a) => (
                    <Stack
                      key={a.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ py: 0.5 }}
                    >
                      <Chip label={a.action} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                      <Typography variant="body2">
                        {a.user?.fullName || a.user?.username || 'System'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important' }}>
                        {new Date(a.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No recent activity.
                </Typography>
              )}
            </Paper>
          </Stack>
        </>
      )}

      {/* ── Tab 3: Storage ─────────────────────────────────────── */}
      {!loading && activeTab === 3 && storageData && (
        <>
          {storageData.storageGrowth.length > 0 && (
            <Paper sx={{ p: 2.5, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Storage Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={storageData.storageGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis tickFormatter={(v: any) => formatBytes(Number(v) || 0)} />
                  <RechartsTooltip
                    labelFormatter={formatDate}
                    formatter={formatBytesTooltip}
                  />
                  <Area
                    type="monotone"
                    dataKey="bytes"
                    stroke={COLORS.primary}
                    fill={alpha(COLORS.primary, 0.15)}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Storage by User
              </Typography>
              {storageData.storageByUser.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={storageData.storageByUser} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v: any) => formatBytes(Number(v) || 0)} />
                    <YAxis type="category" dataKey="fullName" width={120} />
                    <RechartsTooltip formatter={formatBytesTooltip} />
                    <Bar dataKey="totalSize" fill={COLORS.info} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No storage data yet.
                </Typography>
              )}
            </Paper>

            {storageData.storageByOrg.length > 0 && (
              <Paper sx={{ p: 2.5, flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Storage by Organization
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Documents</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Size</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {storageData.storageByOrg.map((o) => (
                        <TableRow key={o.organizationId ?? 'none'}>
                          <TableCell>{o.organizationName}</TableCell>
                          <TableCell align="right">{o.count}</TableCell>
                          <TableCell align="right">{formatBytes(o.totalSize)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Stack>
        </>
      )}

      {/* ── Tab 4: Audit ───────────────────────────────────────── */}
      {!loading && activeTab === 4 && auditData && (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <StatCard label="Total Audit Actions" value={auditData.totalActions} icon={<AuditIcon />} color={COLORS.info} />
          </Stack>

          {auditData.actionsOverTime.length > 0 && (
            <Paper sx={{ p: 2.5, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Audit Actions Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={auditData.actionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <RechartsTooltip labelFormatter={formatDate} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.purple}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Most Common Actions
            </Typography>
            {auditData.topActions.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={auditData.topActions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="action" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No audit data yet.
              </Typography>
            )}
          </Paper>
        </>
      )}
    </Layout>
  );
};

export default Analytics;
