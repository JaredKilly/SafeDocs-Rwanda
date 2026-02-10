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
  VerifiedUser as VerifiedIcon,
  Gavel as LegalIcon,
  Security as SecurityIcon,
  Policy as PolicyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const frameworks = [
  {
    icon: <LegalIcon sx={{ fontSize: 36 }} />,
    color: '#007BFF',
    title: 'Rwanda Data Protection Law',
    subtitle: 'Law No. 058/2021',
    description:
      'SafeDocs Rwanda is fully aligned with the Rwanda Data Protection and Privacy Law. We maintain a data processing register, respond to data subject requests within 30 days, and notify the NCSA of any breaches within 72 hours.',
    checks: ['Data Subject Rights', 'Breach Notification', 'DPO Designated', 'Processing Register'],
  },
  {
    icon: <PolicyIcon sx={{ fontSize: 36 }} />,
    color: '#9B51E0',
    title: 'GDPR',
    subtitle: 'EU General Data Protection Regulation',
    description:
      'For organisations operating in the EU or processing EU citizens\' data, SafeDocs Rwanda meets GDPR requirements including lawful basis for processing, data minimisation, and cross-border transfer safeguards.',
    checks: ['Lawful Basis Documented', 'Data Minimisation', 'Right to Erasure', 'DPA Agreements'],
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 36 }} />,
    color: '#00B89F',
    title: 'ISO 27001 Aligned',
    subtitle: 'Information Security Management',
    description:
      'Our security controls follow ISO 27001 principles, including risk assessments, access controls, incident management, and business continuity planning. Formal certification is in progress.',
    checks: ['Risk Assessment', 'Access Management', 'Incident Response', 'Business Continuity'],
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 36 }} />,
    color: '#FF7A21',
    title: 'SOC 2 Type II',
    subtitle: 'Service Organisation Control',
    description:
      'We are currently undergoing a SOC 2 Type II audit covering Security, Availability, and Confidentiality trust service criteria. Expected completion: Q3 2026.',
    checks: ['Security Criteria', 'Availability Criteria', 'Confidentiality Criteria', 'Audit in Progress'],
  },
];

const responsibilities = [
  { role: 'Data Controller', party: 'Your Organisation', desc: 'Determines why and how personal data is processed using SafeDocs Rwanda.' },
  { role: 'Data Processor', party: 'SafeDocs Rwanda', desc: 'Processes personal data on your behalf, strictly following your documented instructions.' },
  { role: 'Sub-processor', party: 'Cloud Providers', desc: 'Infrastructure vendors under contractual data processing agreements with us.' },
];

const Compliance: React.FC = () => {
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
          <Chip label="Legal" sx={{ bgcolor: alpha('#FFFFFF', 0.15), color: 'white', fontWeight: 700, mb: 2.5, px: 1 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.8rem', md: '2.6rem' } }}>
            Compliance
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
            SafeDocs Rwanda is built to help your organisation meet its regulatory obligations —
            locally and internationally.
          </Typography>
        </Container>
      </Box>

      {/* Frameworks */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 7 }}>
            Regulatory Frameworks
          </Typography>
          <Grid container spacing={3}>
            {frameworks.map((f, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(f.color, 0.1),
                          color: f.color,
                          flexShrink: 0,
                        }}
                      >
                        {f.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {f.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {f.subtitle}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2.5 }}>
                      {f.description}
                    </Typography>
                    <Grid container spacing={1}>
                      {f.checks.map((check) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={check}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <CheckIcon sx={{ color: f.color, fontSize: 16, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {check}
                            </Typography>
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Data roles */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>
            Controller vs. Processor
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
            Understanding the data processing relationship between your organisation and SafeDocs Rwanda.
          </Typography>
          <Stack spacing={2.5}>
            {responsibilities.map((r) => (
              <Paper key={r.role} sx={{ p: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <Box sx={{ minWidth: 140 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {r.role}
                    </Typography>
                    <Chip label={r.party} size="small" color="primary" sx={{ mt: 0.5, fontWeight: 600 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {r.desc}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Contact */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Compliance Questions?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            Our Data Protection Officer is available to help your legal or IT team evaluate
            SafeDocs Rwanda's controls. Email <strong>dpo@safedocsrwanda.rw</strong> to arrange
            a compliance briefing or to request our Data Processing Agreement (DPA).
          </Typography>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Compliance;
