import React from 'react';
import { Box, Typography, Stack, Chip, Divider, alpha, useTheme } from '@mui/material';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const highlights = [
  'Bank-grade encryption at rest and in transit',
  'AI-powered OCR and smart search',
  'Granular access control with audit trails',
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr', lg: '0.45fr 0.55fr' },
        maxWidth: '1400px',
        mx: 'auto',
        backgroundColor: 'background.default',
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(380px at 20% 25%, ${alpha(theme.palette.primary.light, 0.28)}, transparent 55%),
            radial-gradient(320px at 78% 18%, ${alpha(theme.palette.primary.main, 0.18)}, transparent 50%),
            linear-gradient(135deg, #0B1D2E 0%, #0B4A8F 45%, #007BFF 90%)
          `,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          p: { md: 4, lg: 5 },
        }}
      >
        <Box sx={{ maxWidth: 420, position: 'relative', zIndex: 1 }}>
          <Chip
            label="SafeDocs Rwanda"
            color="secondary"
            variant="filled"
            sx={{
              mb: 3,
              px: 2,
              py: 1,
              fontWeight: 600,
              backgroundColor: alpha('#FFFFFF', 0.2),
              color: '#fff',
            }}
          />
          <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8 }}>
            Trusted digital vault
          </Typography>
          <Typography
            variant="h3"
            sx={{
              mt: 2,
              mb: 2,
              lineHeight: 1.1,
              fontSize: 'clamp(26px, 3.6vw, 40px)',
            }}
          >
            Secure, intelligent document workflows for modern teams.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 3, lineHeight: 1.5 }}>
            Backed by enterprise-grade security controls, SafeDocs Rwanda helps teams capture,
            search, and share critical documents with confidence.
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {highlights.map((item) => (
              <Stack key={item} direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: alpha('#FFFFFF', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {'\u2713'}
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Divider sx={{ borderColor: alpha('#FFFFFF', 0.15) }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 20% 80%, ${alpha('#FFFFFF', 0.04)} 0, transparent 40%),
              radial-gradient(circle at 85% 35%, ${alpha('#FFFFFF', 0.06)} 0, transparent 45%)
            `,
            pointerEvents: 'none',
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          p: { xs: 3, sm: 4, md: 5 },
          minHeight: '100dvh',
          overflowY: 'visible',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: { xs: 420, md: 560 } }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
