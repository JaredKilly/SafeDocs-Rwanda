import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Alert,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Delete as RevokeIcon,
  VisibilityOutlined as ViewerIcon,
  EditOutlined as EditorIcon,
  CommentOutlined as CommenterIcon,
  StarOutlined as OwnerIcon,
  Description as DocIcon,
  AccessTime as ExpiryIcon,
  CheckCircle as CopiedIcon,
} from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import { Document, DocumentPermission, ShareLink } from '../types';
import apiService from '../services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

type UserOption = { id: number; username: string; fullName: string; email: string };
type AccessLevel = 'viewer' | 'commenter' | 'editor' | 'owner';

interface Props {
  open: boolean;
  document: Document | null;
  onClose: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const accessConfig: Record<AccessLevel, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  viewer: {
    label: 'Viewer',
    color: '#007BFF',
    icon: <ViewerIcon sx={{ fontSize: 16 }} />,
    description: 'Can view only',
  },
  commenter: {
    label: 'Commenter',
    color: '#9B51E0',
    icon: <CommenterIcon sx={{ fontSize: 16 }} />,
    description: 'Can view and comment',
  },
  editor: {
    label: 'Editor',
    color: '#00B89F',
    icon: <EditorIcon sx={{ fontSize: 16 }} />,
    description: 'Can view and edit',
  },
  owner: {
    label: 'Owner',
    color: '#FF7A21',
    icon: <OwnerIcon sx={{ fontSize: 16 }} />,
    description: 'Full control',
  },
};

const avatarColor = (str: string) => {
  const colors = ['#007BFF', '#9B51E0', '#00B89F', '#FF7A21', '#E5484D', '#1F9CEF'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// ─── Component ──────────────────────────────────────────────────────────────

const ShareDocumentDialog: React.FC<Props> = ({ open, document, onClose }) => {
  const [tab, setTab] = useState(0);

  // ── People & Groups state ──
  const [permissions, setPermissions] = useState<DocumentPermission[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetType, setTargetType] = useState<'user' | 'group' | 'role'>('user');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('viewer');
  const [expiresAt, setExpiresAt] = useState('');
  const [showExpiry, setShowExpiry] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);

  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const userSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [groupOptions, setGroupOptions] = useState<{ id: number; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<{ id: number; name: string } | null>(null);
  const [roleTarget, setRoleTarget] = useState<'admin' | 'manager' | 'user'>('user');

  // ── Share Links state ──
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [linkAccessLevel, setLinkAccessLevel] = useState<'viewer' | 'commenter'>('viewer');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkExpiresAt, setLinkExpiresAt] = useState('');
  const [linkEmailTo, setLinkEmailTo] = useState('');
  const [linkMaxUses, setLinkMaxUses] = useState('');
  const [linkAllowDownload, setLinkAllowDownload] = useState(true);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // ── Load data ──
  const loadData = useCallback(async (docId: number) => {
    setDataLoading(true);
    setError(null);
    try {
      const [perms, shareLinks] = await Promise.all([
        apiService.getDocumentShares(docId),
        apiService.getDocumentShareLinks(docId),
      ]);
      setPermissions(perms);
      setLinks(shareLinks);
    } catch {
      setError('Failed to load sharing details.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && document) {
      setTab(0);
      setTargetType('user');
      setAccessLevel('viewer');
      setExpiresAt('');
      setShowExpiry(false);
      setSelectedUser(null);
      setSelectedGroup(null);
      setUserSearchInput('');
      setUserOptions([]);
      setLinkAccessLevel('viewer');
      setLinkPassword('');
      setLinkExpiresAt('');
      setLinkMaxUses('');
      setLinkAllowDownload(true);
      setCreatedUrl(null);
      setLinkError(null);
      setError(null);
      loadData(document.id);
      apiService.getGroups().then((grps) => {
        setGroupOptions(grps.map((g) => ({ id: g.id, name: g.name })));
      }).catch(() => {});
    }
  }, [open, document, loadData]);

  const handleUserSearch = useCallback((_: React.SyntheticEvent, value: string) => {
    setUserSearchInput(value);
    if (userSearchTimer.current) clearTimeout(userSearchTimer.current);
    if (value.length < 2) { setUserOptions([]); return; }
    userSearchTimer.current = setTimeout(async () => {
      try {
        const results = await apiService.searchUsers(value);
        setUserOptions(results as UserOption[]);
      } catch { /* silent */ }
    }, 300);
  }, []);

  const getTargetId = () => {
    if (targetType === 'role') return roleTarget;
    if (targetType === 'user') return selectedUser ? String(selectedUser.id) : '';
    return selectedGroup ? String(selectedGroup.id) : '';
  };

  const handleGrantAccess = async () => {
    if (!document) return;
    const targetId = getTargetId();
    if (!targetId) { setError('Please select a target.'); return; }
    setGrantLoading(true);
    setError(null);
    try {
      await apiService.shareDocument(document.id, {
        targetType,
        targetId,
        accessLevel,
        expiresAt: expiresAt || undefined,
      });
      setSelectedUser(null);
      setSelectedGroup(null);
      setUserSearchInput('');
      setExpiresAt('');
      setShowExpiry(false);
      await loadData(document.id);
    } catch {
      setError('Failed to share document. The user may already have access.');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRevoke = async (permId: number) => {
    if (!document) return;
    setDataLoading(true);
    setError(null);
    try {
      await apiService.revokeDocumentShare(permId);
      await loadData(document.id);
    } catch {
      setError('Failed to revoke access.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!document) return;
    setLinkLoading(true);
    setLinkError(null);
    try {
      const maxUsesValue = linkMaxUses ? Number(linkMaxUses) : undefined;
      const link = await apiService.createShareLink(document.id, {
        password: linkPassword || undefined,
        expiresAt: linkExpiresAt || undefined,
        maxUses: Number.isNaN(maxUsesValue as number) ? undefined : maxUsesValue,
        allowDownload: linkAllowDownload,
        accessLevel: linkAccessLevel,
        emailTo: linkEmailTo.trim() || undefined,
      });
      setCreatedUrl(link.url || null);
      setLinkPassword('');
      setLinkExpiresAt('');
      setLinkMaxUses('');
      setLinkAllowDownload(true);
      await loadData(document.id);
    } catch {
      setLinkError('Failed to create share link.');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleDeactivate = async (token: string) => {
    if (!document) return;
    setDataLoading(true);
    try {
      await apiService.deactivateShareLink(token);
      await loadData(document.id);
    } catch {
      setLinkError('Failed to deactivate link.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    } catch { /* silent */ }
  };

  const isGrantDisabled =
    grantLoading ||
    (targetType === 'user' && !selectedUser) ||
    (targetType === 'group' && !selectedGroup);

  if (!document) return null;

  // ── People & Groups tab ──────────────────────────────────────────────────
  const peopleTab = (
    <Stack spacing={3}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Grant access row */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Grant access
        </Typography>

        <Stack spacing={2}>
          {/* Target type + target selector */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
            <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
              <InputLabel>Share with</InputLabel>
              <Select
                label="Share with"
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as 'user' | 'group' | 'role');
                  setSelectedUser(null);
                  setSelectedGroup(null);
                  setUserSearchInput('');
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="role">Everyone in role</MenuItem>
              </Select>
            </FormControl>

            {targetType === 'user' && (
              <Autocomplete
                size="small"
                fullWidth
                options={userOptions}
                getOptionLabel={(o) => `${o.fullName || o.username} (@${o.username})`}
                inputValue={userSearchInput}
                onInputChange={handleUserSearch}
                value={selectedUser}
                onChange={(_, val) => setSelectedUser(val)}
                noOptionsText={userSearchInput.length < 2 ? 'Type at least 2 characters…' : 'No users found'}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar
                      sx={{
                        width: 28, height: 28, fontSize: '0.75rem', mr: 1.5,
                        bgcolor: avatarColor(option.username),
                      }}
                    >
                      {(option.fullName || option.username).charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {option.fullName || option.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{option.username} · {option.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Search user" placeholder="Name, username or email" />
                )}
              />
            )}

            {targetType === 'group' && (
              <Autocomplete
                size="small"
                fullWidth
                options={groupOptions}
                getOptionLabel={(o) => o.name}
                value={selectedGroup}
                onChange={(_, val) => setSelectedGroup(val)}
                noOptionsText="No groups available"
                renderInput={(params) => <TextField {...params} label="Select group" />}
              />
            )}

            {targetType === 'role' && (
              <FormControl size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={roleTarget}
                  onChange={(e) => setRoleTarget(e.target.value as 'admin' | 'manager' | 'user')}
                >
                  <MenuItem value="user">All users</MenuItem>
                  <MenuItem value="manager">All managers</MenuItem>
                  <MenuItem value="admin">All admins</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>

          {/* Access level toggle */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}>
              Access level
            </Typography>
            <ToggleButtonGroup
              value={accessLevel}
              exclusive
              onChange={(_, val) => { if (val) setAccessLevel(val); }}
              size="small"
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {(Object.entries(accessConfig) as [AccessLevel, typeof accessConfig[AccessLevel]][]).map(([level, cfg]) => (
                <Tooltip key={level} title={cfg.description} arrow>
                  <ToggleButton
                    value={level}
                    sx={{
                      borderRadius: '8px !important',
                      border: '1px solid',
                      borderColor: 'divider',
                      px: 1.5,
                      gap: 0.5,
                      '&.Mui-selected': {
                        bgcolor: alpha(cfg.color, 0.12),
                        borderColor: cfg.color,
                        color: cfg.color,
                        '&:hover': { bgcolor: alpha(cfg.color, 0.18) },
                      },
                    }}
                  >
                    {cfg.icon}
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {cfg.label}
                    </Typography>
                  </ToggleButton>
                </Tooltip>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Optional expiry */}
          <Box>
            <Button
              size="small"
              startIcon={<ExpiryIcon sx={{ fontSize: 16 }} />}
              onClick={() => setShowExpiry((v) => !v)}
              color="inherit"
              sx={{ color: 'text.secondary', fontSize: '0.78rem', p: 0 }}
            >
              {showExpiry ? 'Remove expiry' : 'Add expiry date (optional)'}
            </Button>
            {showExpiry && (
              <TextField
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                label="Access expires at"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Button
            variant="contained"
            onClick={handleGrantAccess}
            disabled={isGrantDisabled}
            sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
          >
            {grantLoading ? <CircularProgress size={18} color="inherit" /> : 'Grant Access'}
          </Button>
        </Stack>
      </Paper>

      {/* Existing permissions */}
      {dataLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : permissions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No active shares yet. Grant access above to share this document.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            People with access ({permissions.length})
          </Typography>
          <Stack spacing={1}>
            {permissions.map((perm) => {
              const cfg = accessConfig[perm.accessLevel] || accessConfig.viewer;
              const label =
                perm.permissionType === 'role'
                  ? `Everyone — ${perm.permissionTargetId} role`
                  : perm.permissionType === 'group'
                  ? `Group #${perm.permissionTargetId}`
                  : `User #${perm.permissionTargetId}`;
              const initials = label.substring(0, 2).toUpperCase();
              return (
                <Paper
                  key={perm.id}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <Avatar
                    sx={{ width: 36, height: 36, bgcolor: avatarColor(String(perm.permissionTargetId)), fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}
                  >
                    {initials}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {label}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                      <Chip
                        icon={cfg.icon as React.ReactElement}
                        label={cfg.label}
                        size="small"
                        sx={{
                          bgcolor: alpha(cfg.color, 0.1),
                          color: cfg.color,
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: cfg.color },
                        }}
                      />
                      {perm.expiresAt && (
                        <Typography variant="caption" color="text.secondary">
                          · Expires {formatDate(perm.expiresAt)}
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Granted {formatDate(perm.grantedAt)}{perm.grantor ? ` by ${perm.grantor.fullName || perm.grantor.username}` : ''}
                    </Typography>
                  </Box>
                  <Tooltip title="Revoke access">
                    <IconButton size="small" color="error" onClick={() => handleRevoke(perm.id)} disabled={dataLoading}>
                      <RevokeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      )}
    </Stack>
  );

  // ── Share Links tab ──────────────────────────────────────────────────────
  const linksTab = (
    <Stack spacing={3}>
      {linkError && (
        <Alert severity="error" onClose={() => setLinkError(null)}>
          {linkError}
        </Alert>
      )}

      {/* Newly created link banner */}
      {createdUrl && (
        <Alert
          severity="success"
          icon={<LinkIcon />}
          action={
            <Button
              size="small"
              color="inherit"
              startIcon={copiedUrl === createdUrl ? <CopiedIcon sx={{ color: 'success.main' }} /> : <CopyIcon />}
              onClick={() => handleCopy(createdUrl)}
            >
              {copiedUrl === createdUrl ? 'Copied!' : 'Copy'}
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
            Link created successfully
          </Typography>
          <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
            {createdUrl}
          </Typography>
        </Alert>
      )}

      {/* Create link form */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Create share link
        </Typography>
        <Stack spacing={2}>
          {/* Access level */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}>
              Access level
            </Typography>
            <ToggleButtonGroup
              value={linkAccessLevel}
              exclusive
              onChange={(_, val) => { if (val) setLinkAccessLevel(val); }}
              size="small"
            >
              {(['viewer', 'commenter'] as const).map((level) => {
                const cfg = accessConfig[level];
                return (
                  <ToggleButton
                    key={level}
                    value={level}
                    sx={{
                      px: 2,
                      gap: 0.5,
                      '&.Mui-selected': {
                        bgcolor: alpha(cfg.color, 0.12),
                        borderColor: cfg.color,
                        color: cfg.color,
                      },
                    }}
                  >
                    {cfg.icon}
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {cfg.label}
                    </Typography>
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Password (optional)"
              value={linkPassword}
              onChange={(e) => setLinkPassword(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Expires at (optional)"
              type="datetime-local"
              value={linkExpiresAt}
              onChange={(e) => setLinkExpiresAt(e.target.value)}
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Max uses"
              placeholder="Unlimited"
              value={linkMaxUses}
              onChange={(e) => setLinkMaxUses(e.target.value)}
              size="small"
              sx={{ maxWidth: { xs: '100%', sm: 140 } }}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={linkAllowDownload}
                  onChange={(e) => setLinkAllowDownload(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Allow download</Typography>}
            />
            <Button
              variant="contained"
              startIcon={linkLoading ? undefined : <LinkIcon />}
              onClick={handleCreateLink}
              disabled={linkLoading}
              sx={{ fontWeight: 700 }}
            >
              {linkLoading ? <CircularProgress size={18} color="inherit" /> : 'Create Link'}
            </Button>
          </Stack>
          <TextField
            label="Email this link to (optional)"
            type="email"
            value={linkEmailTo}
            onChange={(e) => setLinkEmailTo(e.target.value)}
            size="small"
            fullWidth
            placeholder="recipient@example.com"
            helperText="If provided, the link will be sent to this email after creation."
          />
        </Stack>
      </Paper>

      {/* Active links */}
      {dataLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : links.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No share links yet. Create one above.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Active links ({links.filter((l) => l.isActive).length})
          </Typography>
          <Stack spacing={1.5}>
            {links.map((link) => {
              const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
              const isActive = link.isActive && !isExpired && (!link.maxUses || link.currentUses < link.maxUses);
              const linkUrl = link.url || '';
              const cfg = accessConfig[link.accessLevel] || accessConfig.viewer;
              return (
                <Paper
                  key={link.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    opacity: isActive ? 1 : 0.6,
                    borderColor: isActive ? 'divider' : 'text.disabled',
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                      <LinkIcon sx={{ color: isActive ? 'primary.main' : 'text.disabled', flexShrink: 0, fontSize: 18 }} />
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
                      >
                        {linkUrl || `…/${link.token.slice(0, 12)}…`}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
                      <Chip
                        icon={cfg.icon as React.ReactElement}
                        label={cfg.label}
                        size="small"
                        sx={{ bgcolor: alpha(cfg.color, 0.1), color: cfg.color, '& .MuiChip-icon': { color: cfg.color } }}
                      />
                      <Chip
                        label={isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                        size="small"
                        color={isActive ? 'success' : 'default'}
                      />
                      {link.expiresAt && (
                        <Typography variant="caption" color="text.secondary">
                          Expires {formatDate(link.expiresAt)}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        · {link.currentUses}{link.maxUses ? `/${link.maxUses}` : ''} uses
                        · Download {link.allowDownload ? 'allowed' : 'blocked'}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={copiedUrl === linkUrl ? <CopiedIcon sx={{ color: 'success.main', fontSize: 16 }} /> : <CopyIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleCopy(linkUrl)}
                        disabled={!linkUrl}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {copiedUrl === linkUrl ? 'Copied!' : 'Copy link'}
                      </Button>
                      {isActive && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeactivate(link.token)}
                          disabled={dataLoading}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Deactivate
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      )}
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha('#007BFF', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DocIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              Share document
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {document.title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="People & Groups" sx={{ fontWeight: 600 }} />
        <Tab label="Share Links" sx={{ fontWeight: 600 }} />
      </Tabs>

      <DialogContent sx={{ pt: 2.5 }}>
        {tab === 0 ? peopleTab : linksTab}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDocumentDialog;
