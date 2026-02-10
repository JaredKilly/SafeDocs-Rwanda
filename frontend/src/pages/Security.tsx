import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Paper,
  alpha,
} from '@mui/material';
import {
  Lock as LockIcon,
  Shield as ShieldIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedIcon,
  Visibility as AuditIcon,
  Key as KeyIcon,
  Cloud as CloudIcon,
  Policy as PolicyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const pillars = [
  {
    icon: <LockIcon sx={{ fontSize: 40 }} />,
    color: '#007BFF',
    title: '256-bit AES Encryption',
    description:
      'All documents are encrypted at rest using AES-256, the same standard used by banks and governments worldwide. Your files are unreadable without authorisation.',
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 40 }} />,
    color: '#1F9CEF',
    title: 'TLS 1.3 in Transit',
    description:
      'Every byte transferred between your browser and our servers is protected by TLS 1.3, preventing man-in-the-middle attacks and eavesdropping.',
  },
  {
    icon: <KeyIcon sx={{ fontSize: 40 }} />,
    color: '#9B51E0',
    title: 'Role-Based Access Control',
    description:
      'Define who can view, edit, comment, or share any document. Administrators assign roles at the user or group level with granular permission sets.',
  },
  {
    icon: <AuditIcon sx={{ fontSize: 40 }} />,
    color: '#00B89F',
    title: 'Full Audit Trails',
    description:
      'Every access, upload, download, share, and deletion is logged with a timestamp and IP address. Compliance reports are one click away.',
  },
  {
    icon: <CloudIcon sx={{ fontSize: 40 }} />,
    color: '#FF7A21',
    title: 'Redundant Cloud Storage',
    description:
      'Documents are stored across geographically redundant data centres. Automated daily backups ensure zero data loss even in the event of hardware failure.',
  },
  {
    icon: <PolicyIcon sx={{ fontSize: 40 }} />,
    color: '#E5484D',
    title: 'GDPR & Rwanda DPA Ready',
    description:
      'SafeDocs is designed to comply with the Rwanda Data Protection Law and GDPR, with built-in consent management and data subject request workflows.',
  },
];

const certifications = [
  'ISO 27001 aligned',
  'GDPR compliant',
  'Rwanda DPA compliant',
  'SOC 2 Type II (in progress)',
  'HTTPS everywhere',
  '99.9% uptime SLA',
];

const Security: React.FC = () => {
  return (
    <MarketingLayout>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0B1D2E 0%, #003A80 60%, #007BFF 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip
            label="Security"
            sx={{ bgcolor: alpha('#1F9CEF', 0.25), color: '#7EC8F4', fontWeight: 700, mb: 3, px: 1 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
            Built Secure from the Ground Up
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
            Your documents are some of your most sensitive assets. We treat them that way —
            with enterprise-grade encryption, granular access controls, and complete audit trails.
          </Typography>
        </Container>
      </Box>

      {/* Security pillars */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
              Six Layers of Protection
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Security isn't a feature — it's the foundation of everything we build.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {pillars.map((p, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' } }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      sx={{
                        width: 68,
                        height: 68,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(p.color, 0.1),
                        color: p.color,
                        mb: 2.5,
                      }}
                    >
                      {p.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {p.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {p.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Compliance band */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <VerifiedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Compliance & Certifications
                </Typography>
              </Stack>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                We invest heavily in compliance so your organisation can meet its regulatory obligations
                without extra effort. Our controls are regularly audited by independent third parties.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2}>
                {certifications.map((cert) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={cert}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckIcon sx={{ color: 'success.main', flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cert}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Responsible disclosure */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Responsible Disclosure
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 560, mx: 'auto' }}>
            Found a vulnerability? We welcome responsible disclosure. Please contact our security team at{' '}
            <strong>security@safedocsrwanda.rw</strong> and we will respond within 48 hours. We do not
            pursue legal action against researchers who follow responsible disclosure guidelines.
          </Typography>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Security;
