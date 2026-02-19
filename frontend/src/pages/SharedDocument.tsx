import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  alpha,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Lock as LockIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import BrandLogo from '../components/BrandLogo';

interface AccessResult {
  document: {
    id: number;
    title: string;
    description?: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  };
  allowDownload: boolean;
  accessLevel: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  return 'File';
};

// ─── Component ────────────────────────────────────────────────────────────────

const SharedDocument: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [step, setStep] = useState<'loading' | 'password' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [result, setResult] = useState<AccessResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  const tryAccess = useCallback(async (pwd?: string) => {
    try {
      const res = await fetch(`${API_URL}/shares/link/${token}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pwd ? { password: pwd } : {}),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 && data.message?.toLowerCase().includes('password')) {
          setStep('password');
        } else if (res.status === 410 || data.message?.toLowerCase().includes('expired')) {
          setErrorMsg('This link has expired.');
          setStep('error');
        } else if (res.status === 429 || data.message?.toLowerCase().includes('uses')) {
          setErrorMsg('This link has reached its maximum number of uses.');
          setStep('error');
        } else if (res.status === 404) {
          setErrorMsg('This link does not exist or has been deactivated.');
          setStep('error');
        } else {
          setErrorMsg(data.message || 'Unable to access this document.');
          setStep('error');
        }
        return;
      }

      setResult(data);
      setStep('ready');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStep('error');
    }
  }, [token]);

  // Try to access without password first
  useEffect(() => {
    if (!token) return;
    tryAccess();
  }, [token, tryAccess]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setCheckingPassword(true);
    setPasswordError('');
    await tryAccess(password);
    setCheckingPassword(false);
    if (step === 'password') setPasswordError('Incorrect password. Please try again.');
  };

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/shares/link/${token}/download`, {
        method: 'GET',
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.document.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // silent
    } finally {
      setDownloading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0F4F8 0%, #E8EEF7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      {/* Brand header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
        <BrandLogo size={36} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>SafeDocs</Typography>
          <Typography variant="caption" color="text.secondary">Rwanda</Typography>
        </Box>
      </Stack>

      <Container maxWidth="sm">
        {/* Loading */}
        {step === 'loading' && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading shared document…
            </Typography>
          </Box>
        )}

        {/* Error */}
        {step === 'error' && (
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CardContent>
              <ErrorIcon sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Link unavailable
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {errorMsg}
              </Typography>
              <Button variant="outlined" href="/">Go to SafeDocs</Button>
            </CardContent>
          </Card>
        )}

        {/* Password gate */}
        {step === 'password' && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: alpha('#007BFF', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Password required</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  This document is password-protected. Enter the password to access it.
                </Typography>
              </Stack>

              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!password.trim() || checkingPassword}
                  sx={{ fontWeight: 700 }}
                >
                  {checkingPassword ? <CircularProgress size={20} color="inherit" /> : 'Access Document'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Ready */}
        {step === 'ready' && result && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: alpha('#007BFF', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <DocIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                </Box>
                <CheckIcon sx={{ fontSize: 20, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                  Access granted
                </Typography>
              </Stack>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                {result.document.title}
              </Typography>

              {result.document.description && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
                  {result.document.description}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ mb: 3 }}>
                <Chip label={mimeLabel(result.document.mimeType)} size="small" />
                <Chip label={formatFileSize(result.document.fileSize)} size="small" variant="outlined" />
                <Chip
                  label={result.accessLevel}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                {result.allowDownload && (
                  <Chip label="Download allowed" size="small" color="success" variant="outlined" />
                )}
              </Stack>

              <Stack spacing={1.5}>
                {result.allowDownload && (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
                    onClick={handleDownload}
                    disabled={downloading}
                    sx={{ fontWeight: 700 }}
                  >
                    {downloading ? 'Downloading…' : 'Download Document'}
                  </Button>
                )}
                {!result.allowDownload && (
                  <Alert severity="info" icon={<LockIcon fontSize="small" />}>
                    Download is not permitted for this shared link.
                  </Alert>
                )}
              </Stack>

              <Typography
                variant="caption"
                color="text.disabled"
                display="block"
                textAlign="center"
                sx={{ mt: 3 }}
              >
                Shared securely via SafeDocs Rwanda
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default SharedDocument;
