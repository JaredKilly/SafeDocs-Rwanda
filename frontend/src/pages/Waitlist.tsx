import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Alert,
  alpha,
} from '@mui/material';
import { Send as SendIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';
import apiService from '../services/api';

const Waitlist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await apiService.joinWaitlist(email.trim(), name.trim() || undefined);
      setSuccess(true);
      setEmail('');
      setName('');
    } catch (err: any) {
      setError(
        err?.response?.data?.error || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingLayout>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0B1D2E 0%, #003A80 60%, #007BFF 100%)',
          color: 'white',
          pt: { xs: 12, md: 16 },
          pb: { xs: 12, md: 16 },
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip
              label="Launching Soon"
              sx={{
                bgcolor: alpha('#FF7A21', 0.2),
                color: '#FF9C4E',
                fontWeight: 700,
                mb: 3,
                px: 1,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.75rem' },
                lineHeight: 1.2,
              }}
            >
              Join the Waitlist
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, lineHeight: 1.7 }}>
              SafeDocs Rwanda is going live soon. Be the first to know when we launch
              and get early access to organized, secure document management for your business.
            </Typography>
          </Box>

          {success ? (
            <Alert
              icon={<CheckIcon />}
              severity="success"
              sx={{
                bgcolor: alpha('#fff', 0.15),
                color: 'white',
                border: '1px solid',
                borderColor: alpha('#fff', 0.3),
                '& .MuiAlert-icon': { color: '#4ADE80' },
              }}
            >
              You&apos;re on the list! We&apos;ll notify you at{' '}
              <strong>{email}</strong> when we launch.
            </Alert>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                bgcolor: alpha('#FFFFFF', 0.08),
                borderRadius: 3,
                p: 4,
                border: '1px solid',
                borderColor: alpha('#FFFFFF', 0.15),
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.rw"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '& fieldset': { borderColor: alpha('#fff', 0.3) },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '& fieldset': { borderColor: alpha('#fff', 0.3) },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  endIcon={<SendIcon />}
                  sx={{
                    bgcolor: '#FF7A21',
                    py: 1.8,
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    '&:hover': { bgcolor: '#CC611A' },
                  }}
                >
                  {loading ? 'Joining...' : 'Join the Waitlist'}
                </Button>
              </Stack>
            </Box>
          )}

          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              mt: 4,
              opacity: 0.7,
            }}
          >
            No spam. We&apos;ll only email you when we launch.
          </Typography>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Waitlist;
