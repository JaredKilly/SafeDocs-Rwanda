import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Stack, Button, TextField, InputAdornment,
  Chip, IconButton, Tooltip, Alert, Select, MenuItem, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, alpha, Switch, FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalHospital as HealthIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  VerifiedUser as ConsentIcon,
  Warning as WarningIcon,
  Person as PatientIcon,
  Science as LabIcon,
  Medication as RxIcon,
  Article as NoteIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { Document, HCMeta, HCRecordType, HCPrivacyLevel, HC_RECORD_LABELS, HC_PRIVACY_LABELS, HealthcareStats } from '../types';
import apiService from '../services/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

// ── Constants ────────────────────────────────────────────────

const PRIVACY_CONFIG: Record<HCPrivacyLevel, { color: string; icon: React.ReactNode }> = {
  general:      { color: '#2E7D32', icon: <HealthIcon sx={{ fontSize: 14 }} /> },
  sensitive:    { color: '#0288D1', icon: <LockIcon sx={{ fontSize: 14 }} /> },
  restricted:   { color: '#ED6C02', icon: <WarningIcon sx={{ fontSize: 14 }} /> },
  mental_health:{ color: '#9B51E0', icon: <LockIcon sx={{ fontSize: 14 }} /> },
  hiv_aids:     { color: '#D32F2F', icon: <LockIcon sx={{ fontSize: 14 }} /> },
};

const RECORD_ICON: Partial<Record<HCRecordType, React.ReactNode>> = {
  patient_record: <PatientIcon sx={{ fontSize: 14 }} />,
  lab_result:     <LabIcon sx={{ fontSize: 14 }} />,
  prescription:   <RxIcon sx={{ fontSize: 14 }} />,
  clinical_note:  <NoteIcon sx={{ fontSize: 14 }} />,
};

const RETENTION_OPTIONS = [
  { value: 5, label: '5 years' }, { value: 7, label: '7 years' },
  { value: 10, label: '10 years' }, { value: 15, label: '15 years' },
  { value: 20, label: '20 years' }, { value: 25, label: '25 years (minor)' },
  { value: 0,  label: 'Permanent' },
];

type HCDocument = Document & { metadata?: HCMeta & Record<string, any> };

// ── Privacy Badge ────────────────────────────────────────────
const PrivacyBadge: React.FC<{ level?: HCPrivacyLevel }> = ({ level }) => {
  if (!level || level === 'general') {
    return <Chip label="General" size="small" variant="outlined" />;
  }
  const cfg = PRIVACY_CONFIG[level];
  return (
    <Chip
      label={HC_PRIVACY_LABELS[level]}
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

// ── Record Type Badge ─────────────────────────────────────────
const RecordBadge: React.FC<{ type?: HCRecordType }> = ({ type }) => {
  if (!type) return <Chip label="—" size="small" variant="outlined" />;
  const icon = RECORD_ICON[type];
  return (
    <Chip
      label={HC_RECORD_LABELS[type]}
      size="small"
      icon={icon ? <Box sx={{ display: 'flex', color: 'primary.main' }}>{icon}</Box> : undefined}
      sx={{ bgcolor: alpha('#007BFF', 0.08), color: 'primary.main', border: '1px solid', borderColor: alpha('#007BFF', 0.2) }}
    />
  );
};

// ── Stat Card ─────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <Paper sx={{ p: 2, flex: 1, minWidth: 100, textAlign: 'center' }}>
    <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Paper>
);

// ── Main ──────────────────────────────────────────────────────
const Healthcare: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [docs, setDocs] = useState<HCDocument[]>([]);
  const [stats, setStats] = useState<HealthcareStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('');

  // Edit dialog
  const [editDoc, setEditDoc] = useState<HCDocument | null>(null);
  const [editForm, setEditForm] = useState<HCMeta>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const canSeeStats = user?.role === 'admin' || user?.role === 'manager';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsData, statsData] = await Promise.all([
        apiService.getHealthcareDocs(),
        canSeeStats ? apiService.getHealthcareStats() : Promise.resolve(null),
      ]);
      setDocs(docsData as HCDocument[]);
      if (statsData) setStats(statsData);
    } catch {
      setError('Failed to load healthcare documents.');
    } finally {
      setLoading(false);
    }
  }, [canSeeStats]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    load();
  }, [isAuthenticated, navigate, load]);

  const openEdit = (doc: HCDocument) => {
    const m = doc.metadata || {};
    setEditForm({
      hcRecordType: m.hcRecordType,
      hcPrivacyLevel: m.hcPrivacyLevel || 'general',
      hcPatientId: m.hcPatientId || '',
      hcPatientName: m.hcPatientName || '',
      hcFacility: m.hcFacility || '',
      hcProvider: m.hcProvider || '',
      hcConsentObtained: m.hcConsentObtained ?? false,
      hcRetentionYears: m.hcRetentionYears,
      hcNotes: m.hcNotes || '',
    });
    setEditDoc(doc);
    setEditError(null);
  };

  const handleSave = async () => {
    if (!editDoc) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await apiService.setHealthcareMetadata(editDoc.id, editForm);
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
    const matchQ = !q ||
      d.title.toLowerCase().includes(q) ||
      String(m.hcPatientId || '').toLowerCase().includes(q) ||
      String(m.hcPatientName || '').toLowerCase().includes(q) ||
      String(m.hcFacility || '').toLowerCase().includes(q);
    const matchType = !recordTypeFilter || m.hcRecordType === recordTypeFilter;
    const matchPrivacy = !privacyFilter || m.hcPrivacyLevel === privacyFilter;
    return matchQ && matchType && matchPrivacy;
  });

  const formatSize = (b: number) =>
    b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

  const noConsentCount = docs.filter(d => !(d.metadata as any)?.hcConsentObtained).length;

  return (
    <Layout>
      <PageHeader
        title="Healthcare Documents"
        subtitle="Patient records, privacy tiers, consent tracking, and retention management"
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Healthcare Documents' }]}
      />

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {/* Consent warning */}
      {!loading && noConsentCount > 0 && (
        <Alert severity="warning" icon={<ConsentIcon />} sx={{ mb: 2 }}>
          <strong>{noConsentCount}</strong> healthcare document{noConsentCount !== 1 ? 's' : ''} have no recorded patient consent.
        </Alert>
      )}

      {/* Stats */}
      {stats && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          <StatCard label="Total Records" value={stats.total} color="#007BFF" />
          <StatCard label="Missing Consent" value={stats.noConsent} color="#D32F2F" />
          {Object.entries(PRIVACY_CONFIG).map(([key, cfg]) => (
            <StatCard key={key} label={HC_PRIVACY_LABELS[key as HCPrivacyLevel]} value={stats.byPrivacy[key] ?? 0} color={cfg.color} />
          ))}
        </Stack>
      )}

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by title, patient ID, name, facility…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Record Type</InputLabel>
          <Select label="Record Type" value={recordTypeFilter} onChange={e => setRecordTypeFilter(e.target.value)}>
            <MenuItem value="">All Types</MenuItem>
            {(Object.keys(HC_RECORD_LABELS) as HCRecordType[]).map(k => (
              <MenuItem key={k} value={k}>{HC_RECORD_LABELS[k]}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Privacy Level</InputLabel>
          <Select label="Privacy Level" value={privacyFilter} onChange={e => setPrivacyFilter(e.target.value)}>
            <MenuItem value="">All Levels</MenuItem>
            {(Object.keys(HC_PRIVACY_LABELS) as HCPrivacyLevel[]).map(k => (
              <MenuItem key={k} value={k}>{HC_PRIVACY_LABELS[k]}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Patient ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Record Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Privacy</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Facility / Provider</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Consent</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Retention</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Stack alignItems="center" spacing={1}>
                    <HealthIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography color="text.secondary">
                      {docs.length === 0
                        ? 'No healthcare records yet. Tag a document using the Edit button.'
                        : 'No records match your filters.'}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(doc => {
                const m = doc.metadata || {};
                const retention = m.hcRetentionYears !== undefined
                  ? (m.hcRetentionYears === 0 ? 'Permanent' : `${m.hcRetentionYears}y`)
                  : '—';
                const hasConsent = m.hcConsentObtained;
                return (
                  <TableRow key={doc.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 200 }} noWrap>
                        {doc.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{formatSize(doc.fileSize)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0}>
                        <Typography variant="body2" fontFamily="monospace" color="primary.main">
                          {m.hcPatientId || <span style={{ color: '#bbb' }}>—</span>}
                        </Typography>
                        {m.hcPatientName && (
                          <Typography variant="caption" color="text.secondary">{m.hcPatientName}</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell><RecordBadge type={m.hcRecordType} /></TableCell>
                    <TableCell><PrivacyBadge level={m.hcPrivacyLevel} /></TableCell>
                    <TableCell>
                      <Stack spacing={0}>
                        <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap>{m.hcFacility || '—'}</Typography>
                        {m.hcProvider && (
                          <Typography variant="caption" color="text.secondary" noWrap>{m.hcProvider}</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={hasConsent ? 'Yes' : 'No'}
                        size="small"
                        sx={{
                          bgcolor: hasConsent ? alpha('#2E7D32', 0.1) : alpha('#D32F2F', 0.1),
                          color: hasConsent ? '#2E7D32' : '#D32F2F',
                          fontWeight: 600,
                          border: `1px solid ${alpha(hasConsent ? '#2E7D32' : '#D32F2F', 0.3)}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={retention} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit healthcare metadata">
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

      {!loading && docs.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }} icon={<HealthIcon />}>
          To tag a healthcare document, open any document from the <strong>Documents</strong> page, or click the Edit button once documents are uploaded.
        </Alert>
      )}

      {/* ── Edit Healthcare Metadata Dialog ── */}
      <Dialog open={!!editDoc} onClose={() => setEditDoc(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HealthIcon color="primary" />
          Healthcare Metadata — {editDoc?.title}
        </DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Record Type *</InputLabel>
                <Select
                  label="Record Type *"
                  value={editForm.hcRecordType || ''}
                  onChange={e => setEditForm(f => ({ ...f, hcRecordType: e.target.value as HCRecordType }))}
                >
                  {(Object.keys(HC_RECORD_LABELS) as HCRecordType[]).map(k => (
                    <MenuItem key={k} value={k}>{HC_RECORD_LABELS[k]}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Privacy Level *</InputLabel>
                <Select
                  label="Privacy Level *"
                  value={editForm.hcPrivacyLevel || 'general'}
                  onChange={e => setEditForm(f => ({ ...f, hcPrivacyLevel: e.target.value as HCPrivacyLevel }))}
                >
                  {(Object.keys(HC_PRIVACY_LABELS) as HCPrivacyLevel[]).map(k => {
                    const cfg = PRIVACY_CONFIG[k];
                    return (
                      <MenuItem key={k} value={k}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: cfg.color }}>
                            {HC_PRIVACY_LABELS[k]}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Patient ID"
                placeholder="e.g. RW-2024-001234"
                size="small"
                fullWidth
                value={editForm.hcPatientId}
                onChange={e => setEditForm(f => ({ ...f, hcPatientId: e.target.value }))}
              />
              <TextField
                label="Patient Name"
                placeholder="Full name (optional)"
                size="small"
                fullWidth
                value={editForm.hcPatientName}
                onChange={e => setEditForm(f => ({ ...f, hcPatientName: e.target.value }))}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Facility"
                placeholder="e.g. King Faisal Hospital"
                size="small"
                fullWidth
                value={editForm.hcFacility}
                onChange={e => setEditForm(f => ({ ...f, hcFacility: e.target.value }))}
              />
              <TextField
                label="Provider / Doctor"
                placeholder="e.g. Dr. Uwimana Alice"
                size="small"
                fullWidth
                value={editForm.hcProvider}
                onChange={e => setEditForm(f => ({ ...f, hcProvider: e.target.value }))}
              />
            </Stack>

            <FormControl size="small" fullWidth>
              <InputLabel>Retention Period</InputLabel>
              <Select
                label="Retention Period"
                value={editForm.hcRetentionYears ?? ''}
                onChange={e => setEditForm(f => ({ ...f, hcRetentionYears: e.target.value as number }))}
              >
                <MenuItem value=""><em>Not set</em></MenuItem>
                {RETENTION_OPTIONS.map(o => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={!!editForm.hcConsentObtained}
                  onChange={e => setEditForm(f => ({ ...f, hcConsentObtained: e.target.checked }))}
                  color="success"
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ConsentIcon fontSize="small" sx={{ color: editForm.hcConsentObtained ? '#2E7D32' : 'text.secondary' }} />
                  <Typography variant="body2">
                    Patient consent obtained
                  </Typography>
                </Stack>
              }
            />

            <TextField
              label="Notes"
              placeholder="Additional notes about this healthcare record"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={editForm.hcNotes}
              onChange={e => setEditForm(f => ({ ...f, hcNotes: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDoc(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={editLoading || !editForm.hcRecordType}
            startIcon={editLoading ? <CircularProgress size={14} color="inherit" /> : <HealthIcon />}
            onClick={handleSave}
          >
            {editLoading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Healthcare;
