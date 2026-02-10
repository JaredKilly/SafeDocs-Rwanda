import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Divider,
  IconButton,
  alpha,
} from '@mui/material';
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { Document } from '../types';
import apiService from '../services/api';

interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  changeNote?: string;
  createdAt: string;
  uploader?: { fullName?: string; username: string };
}

interface Props {
  open: boolean;
  document: Document | null;
  onClose: () => void;
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const DocumentVersionsDialog: React.FC<Props> = ({ open, document, onClose }) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    if (open && document) {
      setLoading(true);
      setError(null);
      apiService.getDocumentVersions(document.id)
        .then(setVersions)
        .catch(() => setError('Failed to load version history.'))
        .finally(() => setLoading(false));
    }
  }, [open, document]);

  const handleDownloadVersion = async (versionId: number, fileName: string) => {
    setDownloading(versionId);
    try {
      const blob = await apiService.downloadDocumentVersion(document!.id, versionId);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch {
      // silent
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
        <HistoryIcon color="primary" />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Version History</Typography>
          {document && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {document.title}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pb: 1 }}>
        {/* Current version */}
        {document && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              mb: 1,
              bgcolor: alpha('#007BFF', 0.06),
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#007BFF', 0.2),
            }}
          >
            <DocIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {document.fileName}
                </Typography>
                <Chip label="Current" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                v{document.currentVersion} · {formatFileSize(document.fileSize)} · {formatDate(document.updatedAt)}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => {
                apiService.downloadDocument(document.id).then((blob) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = window.document.createElement('a');
                  a.href = url; a.download = document.fileName;
                  window.document.body.appendChild(a); a.click();
                  window.URL.revokeObjectURL(url); window.document.body.removeChild(a);
                });
              }}
              sx={{ flexShrink: 0 }}
            >
              Download
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }}>
          <Typography variant="caption" color="text.secondary">Previous versions</Typography>
        </Divider>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : versions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No previous versions yet. Previous versions will appear here when you update the document.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {versions.map((v) => (
              <Box
                key={v.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <DocIcon sx={{ color: 'text.secondary', flexShrink: 0, fontSize: 20 }} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{v.fileName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    v{v.versionNumber} · {formatFileSize(v.fileSize)} · {formatDate(v.createdAt)}
                    {v.uploader && ` · ${v.uploader.fullName || v.uploader.username}`}
                  </Typography>
                  {v.changeNote && (
                    <Typography variant="caption" color="text.disabled" display="block" noWrap>
                      {v.changeNote}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleDownloadVersion(v.id, v.fileName)}
                  disabled={downloading === v.id}
                >
                  {downloading === v.id
                    ? <CircularProgress size={16} />
                    : <DownloadIcon fontSize="small" />}
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentVersionsDialog;
