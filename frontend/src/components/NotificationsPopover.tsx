import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Stack,
  Divider,
  Button,
  CircularProgress,
  alpha,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Notifications as BellIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Login as LoginIcon,
  Visibility as ViewIcon,
  CheckCircle as DoneIcon,
  Notifications as NotifIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { AuditLog } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const LAST_SEEN_KEY = 'notifications_last_seen';

const actionMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  upload: { label: 'Uploaded', color: '#007BFF', icon: <UploadIcon sx={{ fontSize: 16 }} /> },
  delete: { label: 'Deleted', color: '#E5484D', icon: <DeleteIcon sx={{ fontSize: 16 }} /> },
  share: { label: 'Shared', color: '#FF7A21', icon: <ShareIcon sx={{ fontSize: 16 }} /> },
  download: { label: 'Downloaded', color: '#00B89F', icon: <DownloadIcon sx={{ fontSize: 16 }} /> },
  update: { label: 'Updated', color: '#9B51E0', icon: <EditIcon sx={{ fontSize: 16 }} /> },
  view: { label: 'Viewed', color: '#1F9CEF', icon: <ViewIcon sx={{ fontSize: 16 }} /> },
  login: { label: 'Logged in', color: '#4CAF50', icon: <LoginIcon sx={{ fontSize: 16 }} /> },
};

const getMeta = (action: string) => {
  const key = Object.keys(actionMeta).find((k) => action.toLowerCase().includes(k));
  return key ? actionMeta[key] : { label: action, color: '#607D8B', icon: <NotifIcon sx={{ fontSize: 16 }} /> };
};

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Component ──────────────────────────────────────────────────────────────

const NotificationsPopover: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const computeUnread = useCallback((items: AuditLog[]) => {
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    if (!lastSeen) {
      setUnreadCount(items.length);
      return;
    }
    const count = items.filter((l) => new Date(l.createdAt) > new Date(lastSeen)).length;
    setUnreadCount(count);
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getAuditLogs({ limit: 20, page: 1 });
      setLogs(data.logs);
      computeUnread(data.logs);
    } catch {
      // silent — notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, [computeUnread]);

  // Poll every 60 s while mounted
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 60_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    // Mark all as read
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setUnreadCount(0);
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleOpen}>
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={9}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                height: 16,
                minWidth: 16,
                padding: '0 4px',
              },
            }}
          >
            <BellIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: '#FAFAFA',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            {unreadCount === 0 && logs.length > 0 && (
              <Chip label="All caught up" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
            )}
          </Stack>
          <Button size="small" onClick={fetchLogs} disabled={loading} sx={{ fontSize: '0.75rem', minWidth: 0 }}>
            {loading ? <CircularProgress size={14} /> : 'Refresh'}
          </Button>
        </Box>

        {/* List */}
        <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
          {loading && logs.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
              <DoneIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No activity yet. Your actions will appear here.
              </Typography>
            </Box>
          ) : (
            logs.map((log, i) => {
              const meta = getMeta(log.action);
              const isNew =
                localStorage.getItem(LAST_SEEN_KEY)
                  ? new Date(log.createdAt) > new Date(localStorage.getItem(LAST_SEEN_KEY)!)
                  : i < 3;
              return (
                <Box key={log.id}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      bgcolor: isNew ? alpha(meta.color, 0.04) : 'transparent',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: alpha(meta.color, 0.06) },
                    }}
                  >
                    {/* Icon badge */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: alpha(meta.color, 0.12),
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      {meta.icon}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {meta.label}
                        </Typography>
                        {isNew && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: meta.color,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Stack>

                      {log.document && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {log.document.title}
                        </Typography>
                      )}

                      {log.details && typeof log.details === 'object' && (
                        <Typography variant="caption" color="text.disabled" noWrap sx={{ display: 'block' }}>
                          {JSON.stringify(log.details).slice(0, 60)}
                          {JSON.stringify(log.details).length > 60 ? '…' : ''}
                        </Typography>
                      )}

                      <Typography variant="caption" color="text.disabled">
                        {timeAgo(log.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  {i < logs.length - 1 && <Divider />}
                </Box>
              );
            })
          )}
        </Box>

        {/* Footer */}
        {logs.length > 0 && (
          <Box
            sx={{
              px: 2.5,
              py: 1.25,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: '#FAFAFA',
              textAlign: 'center',
            }}
          >
            <Button
              size="small"
              href="/audit-logs"
              sx={{ fontSize: '0.78rem', fontWeight: 600 }}
            >
              View full activity log →
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationsPopover;
