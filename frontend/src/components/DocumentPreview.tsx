import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Toolbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { Document } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  document: Document | null;
}

const DocumentPreview: React.FC<Props> = ({ open, onClose, document }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (document && open) {
      loadPreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document, open]);

  const loadPreview = async () => {
    if (!document) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/documents/${document.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load document');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setError('Failed to load document preview');
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (document) {
      const token = localStorage.getItem('token');
      const link = window.document.createElement('a');
      link.href = `${process.env.REACT_APP_API_URL}/documents/${document.id}/download`;
      link.download = document.fileName;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!document || !previewUrl) {
      return null;
    }

    const mimeType = document.mimeType.toLowerCase();

    // Image preview
    if (mimeType.startsWith('image/')) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            maxHeight: '70vh',
            bgcolor: 'grey.100',
            p: 2,
          }}
        >
          <img
            src={previewUrl}
            alt={document.fileName}
            style={{
              maxWidth: '100%',
              transform: `scale(${zoom / 100})`,
              transition: 'transform 0.2s',
            }}
          />
        </Box>
      );
    }

    // PDF preview
    if (mimeType === 'application/pdf') {
      return (
        <Box sx={{ height: '70vh' }}>
          <iframe
            src={`${previewUrl}#zoom=${zoom}`}
            title={document.fileName}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </Box>
      );
    }

    // Text file preview
    if (mimeType.startsWith('text/')) {
      return (
        <Box
          sx={{
            height: '70vh',
            overflow: 'auto',
            bgcolor: 'grey.50',
            p: 2,
            fontFamily: 'monospace',
            fontSize: `${zoom}%`,
          }}
        >
          <iframe
            src={previewUrl}
            title={document.fileName}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </Box>
      );
    }

    // Unsupported format
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Preview not available for this file type
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {document.mimeType}
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{ mt: 2 }}
        >
          Download to View
        </Button>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">{document?.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {document?.fileName} • {formatFileSize(document?.fileSize || 0)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Toolbar */}
      <Toolbar variant="dense" sx={{ borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" gap={1}>
          <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50}>
            <ZoomOutIcon />
          </IconButton>
          <Typography variant="body2" sx={{ px: 1, alignSelf: 'center', minWidth: 50 }}>
            {zoom}%
          </Typography>
          <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200}>
            <ZoomInIcon />
          </IconButton>
        </Box>
        <Box flexGrow={1} />
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download
        </Button>
      </Toolbar>

      <DialogContent sx={{ p: 0 }}>
        {renderPreview()}
      </DialogContent>
    </Dialog>
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default DocumentPreview;
