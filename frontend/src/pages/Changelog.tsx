import React from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Paper,
  alpha,
} from '@mui/material';
import {
  FiberNew as NewIcon,
  Build as ImprovedIcon,
  BugReport as FixIcon,
} from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

type ChangeType = 'new' | 'improved' | 'fixed';

interface Change {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  tag?: string;
  changes: Change[];
}

const releases: Release[] = [
  {
    version: 'v1.3.0',
    date: 'February 2026',
    tag: 'Latest',
    changes: [
      { type: 'new', text: 'Admin Panel: manage users, roles, and account status from a single view.' },
      { type: 'new', text: 'Audit Logs: full paginated activity log with date and action filters.' },
      { type: 'new', text: 'Sharing UI: live user search autocomplete when sharing documents.' },
      { type: 'improved', text: 'Login and Register pages redesigned for clarity and speed.' },
      { type: 'improved', text: 'Password strength indicator on registration form.' },
      { type: 'fixed', text: 'Landing page navbar text was invisible on white background.' },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'January 2026',
    changes: [
      { type: 'new', text: 'Scanner page: upload and OCR-process physical documents.' },
      { type: 'new', text: 'Groups management: create and manage teams with shared document access.' },
      { type: 'new', text: 'Access Requests: request and approve access to restricted documents.' },
      { type: 'improved', text: 'Folders view redesigned with breadcrumb navigation.' },
      { type: 'improved', text: 'Document list now shows last modified date and file size.' },
      { type: 'fixed', text: 'Upload modal did not close after successful file upload.' },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'December 2025',
    changes: [
      { type: 'new', text: 'Settings page: update profile, change password, notification preferences.' },
      { type: 'new', text: 'Role-Based Access Control: Admin, Manager, and User roles.' },
      { type: 'improved', text: 'Dashboard now shows recent activity and quick-action cards.' },
      { type: 'improved', text: 'Document search is now full-text across content and metadata.' },
      { type: 'fixed', text: 'Session token was not refreshed on long-running sessions.' },
      { type: 'fixed', text: 'File downloads failed silently when MinIO connection timed out.' },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'November 2025',
    changes: [
      { type: 'new', text: 'Initial release of SafeDocs Rwanda.' },
      { type: 'new', text: 'Secure document upload and storage with MinIO.' },
      { type: 'new', text: 'User authentication with JWT and token refresh.' },
      { type: 'new', text: 'Folder organisation for documents.' },
      { type: 'new', text: 'Document sharing with permission levels (view, comment, edit).' },
      { type: 'new', text: 'Responsive landing page with product overview.' },
    ],
  },
];

const typeConfig: Record<ChangeType, { label: string; color: string; bgcolor: string; icon: React.ReactNode }> = {
  new: {
    label: 'New',
    color: '#007BFF',
    bgcolor: alpha('#007BFF', 0.1),
    icon: <NewIcon sx={{ fontSize: 14 }} />,
  },
  improved: {
    label: 'Improved',
    color: '#00B89F',
    bgcolor: alpha('#00B89F', 0.1),
    icon: <ImprovedIcon sx={{ fontSize: 14 }} />,
  },
  fixed: {
    label: 'Fixed',
    color: '#E5484D',
    bgcolor: alpha('#E5484D', 0.1),
    icon: <FixIcon sx={{ fontSize: 14 }} />,
  },
};

const Changelog: React.FC = () => {
  return (
    <MarketingLayout>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0B1D2E 0%, #003A80 60%, #007BFF 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Chip
            label="Changelog"
            sx={{ bgcolor: alpha('#FFFFFF', 0.15), color: 'white', fontWeight: 700, mb: 3, px: 1 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
            What's New in SafeDocs
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7 }}>
            We ship improvements every sprint. Here's a summary of every release.
          </Typography>
        </Container>
      </Box>

      {/* Releases timeline */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Stack spacing={5}>
            {releases.map((release) => (
              <Paper key={release.version} sx={{ p: { xs: 3, md: 4.5 } }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {release.version}
                  </Typography>
                  {release.tag && (
                    <Chip
                      label={release.tag}
                      size="small"
                      sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700 }}
                    />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto !important' }}>
                    {release.date}
                  </Typography>
                </Stack>

                <Stack spacing={1.5}>
                  {release.changes.map((change, i) => {
                    const cfg = typeConfig[change.type];
                    return (
                      <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: cfg.bgcolor,
                            color: cfg.color,
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            flexShrink: 0,
                            mt: 0.2,
                            minWidth: 72,
                            justifyContent: 'center',
                          }}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                          {change.text}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Changelog;
