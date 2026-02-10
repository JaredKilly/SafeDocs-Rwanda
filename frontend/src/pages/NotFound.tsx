import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Home as HomeIcon,
  SearchOff as NotFoundIcon,
} from '@mui/icons-material';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8F9FA 0%, #EEF2FF 100%)',
        p: 3,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        {/* Big 404 */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '6rem', md: '9rem' },
            lineHeight: 1,
            background: 'linear-gradient(135deg, #007BFF 0%, #1F9CEF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            userSelect: 'none',
          }}
        >
          404
        </Typography>

        {/* Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha('#007BFF', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <NotFoundIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
          Page not found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.8 }}>
          The page{' '}
          <Box
            component="code"
            sx={{
              bgcolor: alpha('#007BFF', 0.08),
              color: 'primary.main',
              px: 0.75,
              py: 0.2,
              borderRadius: 0.75,
              fontSize: '0.875em',
              fontFamily: 'monospace',
            }}
          >
            {location.pathname}
          </Box>{' '}
          doesn't exist or has been moved.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          If you typed the URL manually, check for typos. Otherwise, use the links below to get back on track.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Go Back
          </Button>
        </Stack>

        {/* Subtle branding */}
        <Typography variant="caption" color="text.disabled" sx={{ mt: 6, display: 'block' }}>
          SafeDocs Rwanda · Secure Document Management
        </Typography>
      </Container>
    </Box>
  );
};

export default NotFound;
