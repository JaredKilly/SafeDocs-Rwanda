import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  InputBase,
  Paper,
  Typography,
  CircularProgress,
  Popper,
  ClickAwayListener,
  Stack,
  alpha,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DocIcon,
  Folder as FolderIcon,
  ArrowForward as GoIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { Document } from '../types';

const formatFileSize = (bytes: number) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const mimeLabel = (mime: string) => {
  if (mime?.includes('pdf')) return 'PDF';
  if (mime?.includes('word') || mime?.includes('document')) return 'Word';
  if (mime?.includes('sheet') || mime?.includes('excel')) return 'Excel';
  if (mime?.includes('image')) return 'Image';
  if (mime?.includes('text')) return 'Text';
  return 'File';
};

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const docs = await apiService.searchDocuments(q.trim());
      setResults(docs.slice(0, 8));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(() => search(val), 350);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false);
      navigate(`/documents?q=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (doc: Document) => {
    setOpen(false);
    setQuery('');
    navigate('/documents');
  };

  const handleClickAway = () => {
    setOpen(false);
    setFocused(false);
  };

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const showDropdown = open && (results.length > 0 || loading);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box ref={anchorRef} sx={{ position: 'relative' }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.6,
            borderRadius: 2,
            bgcolor: focused ? 'background.paper' : '#F2F4F7',
            border: '1.5px solid',
            borderColor: focused ? 'primary.main' : 'transparent',
            transition: 'all 0.2s',
            width: { xs: 160, sm: 220, md: 280 },
          }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ flexShrink: 0, color: 'text.secondary' }} />
          ) : (
            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
          )}
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setFocused(true);
              if (query.trim().length >= 2 && results.length > 0) setOpen(true);
            }}
            placeholder="Search documents…"
            sx={{ fontSize: '0.875rem', flex: 1, minWidth: 0 }}
          />
          {!focused && (
            <Typography
              variant="caption"
              sx={{
                px: 0.6,
                py: 0.2,
                borderRadius: 0.75,
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.disabled',
                fontSize: '0.7rem',
                lineHeight: 1.4,
                flexShrink: 0,
                display: { xs: 'none', md: 'block' },
              }}
            >
              ⌘K
            </Typography>
          )}
        </Paper>

        <Popper
          open={showDropdown}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1400, width: anchorRef.current?.offsetWidth || 280 }}
        >
          <Paper
            elevation={8}
            sx={{
              mt: 0.5,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              minWidth: 320,
            }}
          >
            {loading && results.length === 0 ? (
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Searching…
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 2, py: 1, bgcolor: '#F8F9FA', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                  </Typography>
                </Box>
                {results.map((doc) => (
                  <Box
                    key={doc.id}
                    onClick={() => handleSelect(doc)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { bgcolor: alpha('#007BFF', 0.05) },
                      transition: 'background 0.15s',
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: alpha('#007BFF', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <DocIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {doc.title}
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                        {doc.folder && (
                          <>
                            <FolderIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {doc.folder.name}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">·</Typography>
                          </>
                        )}
                        <Chip
                          label={mimeLabel(doc.mimeType)}
                          size="small"
                          sx={{ height: 16, fontSize: '0.65rem', px: 0.5 }}
                        />
                        {doc.fileSize > 0 && (
                          <Typography variant="caption" color="text.disabled">
                            {formatFileSize(doc.fileSize)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    <GoIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                  </Box>
                ))}
                {results.length > 0 && (
                  <Box
                    onClick={() => {
                      setOpen(false);
                      navigate(`/documents?q=${encodeURIComponent(query.trim())}`);
                    }}
                    sx={{
                      px: 2,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      bgcolor: '#F8F9FA',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: alpha('#007BFF', 0.06) },
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                      See all results for "{query}"
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default GlobalSearch;
