import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  CircularProgress,
  IconButton,
  Chip,
  Box,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as SelectIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { Document } from '../types';

interface DocumentPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (doc: Document) => void;
  title?: string;
  excludeIds?: number[];
}

const formatSize = (b: number) =>
  b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

const DocumentPicker: React.FC<DocumentPickerProps> = ({
  open,
  onClose,
  onSelect,
  title = 'Select Document',
  excludeIds = [],
}) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await apiService.getDocuments(query ? { query } : undefined);
      setDocs(results.filter(d => !excludeIds.includes(d.id)));
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [excludeIds]);

  // Load on open and when search changes (debounced)
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [open, search, load]);

  // Reset search when dialog opens
  useEffect(() => {
    if (open) setSearch('');
  }, [open]);

  const handleSelect = (doc: Document) => {
    onSelect(doc);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Search documents by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          fullWidth
          autoFocus
          sx={{ mb: 2 }}
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

        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Loading documents...
            </Typography>
          </Stack>
        ) : docs.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <DocIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              {search ? 'No documents match your search.' : 'No documents available.'}
            </Typography>
          </Stack>
        ) : (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Filename</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Select</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {docs.map(doc => (
                  <TableRow
                    key={doc.id}
                    hover
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => handleSelect(doc)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 250 }} noWrap>
                        {doc.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                          {doc.fileName}
                        </Typography>
                        <Chip
                          label={doc.mimeType.split('/').pop()?.toUpperCase()}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatSize(doc.fileSize)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={e => { e.stopPropagation(); handleSelect(doc); }}
                      >
                        <SelectIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {!loading && docs.length > 0 && `${docs.length} document${docs.length !== 1 ? 's' : ''} found`}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPicker;
