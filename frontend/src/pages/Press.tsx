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
  Button,
  Divider,
  alpha,
} from '@mui/material';
import { Download as DownloadIcon, Email as EmailIcon } from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const pressReleases = [
  {
    date: 'February 2026',
    title: 'SafeDocs Rwanda Launches Professional and Enterprise Tiers',
    summary:
      'SafeDocs Rwanda today announced new paid plans with advanced OCR, unlimited storage, and dedicated account management for large institutions across Rwanda and the East African Community.',
  },
  {
    date: 'October 2025',
    title: 'SafeDocs Rwanda Partners with Rwanda Development Board',
    summary:
      'The Rwanda Development Board has selected SafeDocs Rwanda as its preferred digital document management platform, digitising over 200,000 investor records in the first phase.',
  },
  {
    date: 'June 2025',
    title: 'SafeDocs Rwanda Raises Seed Funding from African Tech Investors',
    summary:
      'SafeDocs Rwanda has secured seed funding to accelerate product development and expansion across East Africa, with backing from leading pan-African technology investors.',
  },
  {
    date: 'November 2024',
    title: 'SafeDocs Rwanda Launches Public Beta with 50 Organisations',
    summary:
      'After six months of closed testing, SafeDocs Rwanda opens its platform to the public, with 50 organisations already using the platform to manage thousands of documents daily.',
  },
];

const mediaAssets = [
  { label: 'Brand Logo (SVG)', size: '24 KB' },
  { label: 'Brand Logo (PNG, 2x)', size: '108 KB' },
  { label: 'Brand Guidelines PDF', size: '1.2 MB' },
  { label: 'Product Screenshots Pack', size: '4.6 MB' },
  { label: 'Founder Headshots', size: '3.1 MB' },
];

const Press: React.FC = () => {
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
            label="Press"
            sx={{ bgcolor: alpha('#FFFFFF', 0.15), color: 'white', fontWeight: 700, mb: 3, px: 1 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
            Press & Media
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
            Find press releases, media assets, and contact details for press enquiries.
          </Typography>
        </Container>
      </Box>

      {/* Press contact */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 5 }}>
        <Container maxWidth="md">
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Media Enquiries
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For interviews, quotes, or press accreditation, contact our communications team.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              href="mailto:press@safedocsrwanda.rw"
              sx={{ flexShrink: 0, fontWeight: 700 }}
            >
              press@safedocsrwanda.rw
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Press releases */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 5 }}>
            Press Releases
          </Typography>
          <Stack spacing={3}>
            {pressReleases.map((pr) => (
              <Card key={pr.title}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {pr.date}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, mb: 1.5 }}>
                    {pr.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {pr.summary}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Media kit */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Media Kit
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            Download official brand assets for use in press coverage. Please follow our brand guidelines.
          </Typography>
          <Grid container spacing={2}>
            {mediaAssets.map((asset) => (
              <Grid size={{ xs: 12, sm: 6 }} key={asset.label}>
                <Card>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {asset.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.size}
                        </Typography>
                      </Box>
                      <Button size="small" startIcon={<DownloadIcon />} variant="outlined">
                        Download
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 5 }} />

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            <strong>Usage guidelines:</strong> SafeDocs Rwanda brand assets may be used in editorial
            coverage without prior approval. Do not alter the logo colours, proportions, or
            add effects. For commercial use or co-branded materials, written approval is required.
          </Typography>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Press;
