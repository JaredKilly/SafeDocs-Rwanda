import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Stack, Button, TextField, InputAdornment,
  Chip, IconButton, Tooltip, Alert, Select, MenuItem, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Shield as ShieldIcon,
  Edit as EditIcon,
  AccountBalance as GovIcon,
  Lock as LockIcon,
  LockOpen as PublicIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { Document } from '../types';
import apiService from '../services/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

// ── Constants ────────────────────────────────────────────────

type ClassificationLevel = 'public' | 'internal' | 'restricted' | 'confidential' | 'top_secret';

const CLASSIFICATION_CONFIG: Record<ClassificationLevel, { label: string; color: string; icon: React.ReactNode }> = {
  public:       { label: 'Public',       color: '#2E7D32', icon: <PublicIcon sx={{ fontSize: 14 }} /> },
  internal:     { label: 'Internal',     color: '#0288D1', icon: <GovIcon sx={{ fontSize: 14 }} /> },
  restricted:   { label: 'Restricted',   color: '#ED6C02', icon: <WarningIcon sx={{ fontSize: 14 }} /> },
  confidential: { label: 'Confidential', color: '#9B51E0', icon: <LockIcon sx={{ fontSize: 14 }} /> },
  top_secret:   { label: 'Top Secret',   color: '#D32F2F', icon: <ShieldIcon sx={{ fontSize: 14 }} /> },
};

const RETENTION_OPTIONS = [
  { value: 1, label: '1 year' }, { value: 3, label: '3 years' },
  { value: 5, label: '5 years' }, { value: 7, label: '7 years' },
  { value: 10, label: '10 years' }, { value: 15, label: '15 years' },
  { value: 20, label: '20 years' }, { value: 0, label: 'Permanent' },
];

interface GovMeta {
  classification?: ClassificationLevel;
  govRef?: string;
  subject?: string;
  issuingAuthority?: string;
  retentionYears?: number;
  sensitivityJustification?: string;
}

type GovDocument = Document & { metadata?: GovMeta & Record<string, any> };

const ClassBadge: React.FC<{ level?: ClassificationLevel }> = ({ level }) => {
  if (!level) return <Chip label="Unclassified" size="small" variant="outlined" />;
  const cfg = CLASSIFICATION_CONFIG[level];
  return (
    <Chip
      label={cfg.label}
      size="small"
      icon={<Box sx={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</Box>}
      sx={{
        bgcolor: alpha(cfg.color, 0.1),
        color: cfg.color,
        fontWeight: 700,
        border: `1px solid ${alpha(cfg.color, 0.3)}`,
      }}
    />
  );
};

// ── Stat card ────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <Paper sx={{ p: 2, flex: 1, minWidth: 100, textAlign: 'center' }}>
    <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Paper>
);

// ── Main ─────────────────────────────────────────────────────
const Government: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [docs, setDocs] = useState<GovDocument[]>([]);
  const [stats, setStats] = useState<{ total: number; byClassification: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Edit dialog
  const [editDoc, setEditDoc] = useState<GovDocument | null>(null);
  const [editForm, setEditForm] = useState<GovMeta>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsData, statsData] = await Promise.all([
        apiService.getGovDocuments() as Promise<GovDocument[]>,
        (user?.role === 'admin' || user?.role === 'manager')
          ? apiService.getGovStats()
          : Promise.resolve(null),
      ]);
      setDocs(docsData);
      setStats(statsData);
    } catch {
      setError('Failed to load government documents.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    load();
  }, [isAuthenticated, navigate, load]);

  const openEdit = (doc: GovDocument) => {
    const m = doc.metadata || {};
    setEditForm({
      classification: m.classification,
      govRef: m.govRef || '',
      subject: m.subject || '',
      issuingAuthority: m.issuingAuthority || '',
      retentionYears: m.retentionYears,
      sensitivityJustification: m.sensitivityJustification || '',
    });
    setEditDoc(doc);
    setEditError(null);
  };

  const handleSave = async () => {
    if (!editDoc) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await apiService.setGovMetadata(editDoc.id, editForm);
      await load();
      setEditDoc(null);
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Save failed.');
    } finally {
      setEditLoading(false);
    }
  };

  const filtered = docs.filter(d => {
    const m = d.metadata || {};
    const q = search.toLowerCase();
    const matchQ = !q || d.title.toLowerCase().includes(q) ||
      String(m.govRef || '').toLowerCase().includes(q) ||
      String(m.subject || '').toLowerCase().includes(q);
    const matchClass = !classFilter || m.classification === classFilter;
    return matchQ && matchClass;
  });

  const formatSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

  return (
    <Layout>
      <PageHeader
        title="Government Documents"
        subtitle="Classify, reference, and manage retention for official documents"
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Government Documents' }]}
      />

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats */}
      {stats && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          <StatCard label="Gov Documents" value={stats.total} color="#007BFF" />
          {Object.entries(CLASSIFICATION_CONFIG).map(([key, cfg]) => (
            <StatCard key={key} label={cfg.label} value={stats.byClassification[key] ?? 0} color={cfg.color} />
          ))}
        </Stack>
      )}

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by title, reference, subject…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Classification</InputLabel>
          <Select label="Classification" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
            <MenuItem value="">All Levels</MenuItem>
            {Object.entries(CLASSIFICATION_CONFIG).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ref No.</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Classification</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Issuing Authority</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Retention</TableCell>
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
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Stack alignItems="center" spacing={1}>
                    <GovIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography color="text.secondary">
                      {docs.length === 0
                        ? 'No government documents yet. Classify a document by clicking Edit on any document.'
                        : 'No documents match your filters.'}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(doc => {
                const m = doc.metadata || {};
                const retention = m.retentionYears !== undefined
                  ? (m.retentionYears === 0 ? 'Permanent' : `${m.retentionYears}y`)
                  : '—';
                return (
                  <TableRow key={doc.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 220 }} noWrap>
                        {doc.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{formatSize(doc.fileSize)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" color="primary.main">
                        {m.govRef || <Typography component="span" color="text.disabled">—</Typography>}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 180 }} noWrap>
                        {m.subject || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ClassBadge level={m.classification} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap>
                        {m.issuingAuthority || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={retention} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit classification">
                        <IconButton size="small" onClick={() => openEdit(doc)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info box when no gov docs */}
      {!loading && docs.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }} icon={<VerifiedIcon />}>
          To classify a document, open any document from the <strong>Documents</strong> page, or use the Classify button here once documents are uploaded.
        </Alert>
      )}

      {/* ── Edit Classification Dialog ── */}
      <Dialog open={!!editDoc} onClose={() => setEditDoc(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon color="primary" />
          Government Classification — {editDoc?.title}
        </DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Classification Level *</InputLabel>
              <Select
                label="Classification Level *"
                value={editForm.classification || ''}
                onChange={e => setEditForm(f => ({ ...f, classification: e.target.value as ClassificationLevel }))}
              >
                {Object.entries(CLASSIFICATION_CONFIG).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ color: v.color }}>{v.icon}</Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: v.color }}>{v.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Reference Number"
                placeholder="e.g. GOV/RW/2024/001"
                size="small"
                fullWidth
                value={editForm.govRef}
                onChange={e => setEditForm(f => ({ ...f, govRef: e.target.value }))}
              />
              <TextField
                label="Issuing Authority"
                placeholder="e.g. Ministry of Finance"
                size="small"
                fullWidth
                value={editForm.issuingAuthority}
                onChange={e => setEditForm(f => ({ ...f, issuingAuthority: e.target.value }))}
              />
            </Stack>

            <TextField
              label="Subject"
              placeholder="Brief subject of the document"
              size="small"
              fullWidth
              value={editForm.subject}
              onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Retention Period</InputLabel>
              <Select
                label="Retention Period"
                value={editForm.retentionYears ?? ''}
                onChange={e => setEditForm(f => ({ ...f, retentionYears: e.target.value as number }))}
              >
                <MenuItem value=""><em>Not set</em></MenuItem>
                {RETENTION_OPTIONS.map(o => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {(editForm.classification === 'restricted' || editForm.classification === 'confidential' || editForm.classification === 'top_secret') && (
              <TextField
                label="Sensitivity Justification"
                placeholder="Reason for this classification level"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={editForm.sensitivityJustification}
                onChange={e => setEditForm(f => ({ ...f, sensitivityJustification: e.target.value }))}
                required
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDoc(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={editLoading || !editForm.classification}
            startIcon={editLoading ? <CircularProgress size={14} color="inherit" /> : <ShieldIcon />}
            onClick={handleSave}
          >
            {editLoading ? 'Saving…' : 'Save Classification'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Government;
