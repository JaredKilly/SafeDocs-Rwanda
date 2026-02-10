import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  alpha,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const perks = [
  { emoji: '🇷🇼', title: 'Local Impact', desc: 'Build software that genuinely improves how Rwandan institutions work every day.' },
  { emoji: '🏡', title: 'Remote-Friendly', desc: 'Work from anywhere in Rwanda. We have a Kigali office for those who prefer it.' },
  { emoji: '📈', title: 'Equity & Growth', desc: 'Competitive salary, equity options, and a clear path for professional development.' },
  { emoji: '🎓', title: 'Learning Budget', desc: 'RWF 500,000 / year for courses, conferences, and books — no questions asked.' },
  { emoji: '🏥', title: 'Health Cover', desc: 'Full RSSB medical coverage plus supplemental private insurance for you and your family.' },
  { emoji: '🤝', title: 'Great Team', desc: 'Small, mission-driven team with no bureaucracy. Your work ships and your voice is heard.' },
];

const openRoles = [
  {
    title: 'Senior Backend Engineer',
    team: 'Engineering',
    type: 'Full-time',
    location: 'Remote / Kigali',
    description: 'Own the API layer, scale our Node.js/PostgreSQL stack, and mentor junior engineers.',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    type: 'Full-time',
    location: 'Remote / Kigali',
    description: 'Translate complex document workflows into intuitive, beautiful interfaces for diverse Rwandan users.',
  },
  {
    title: 'Machine Learning Engineer',
    team: 'AI/OCR',
    type: 'Full-time',
    location: 'Remote',
    description: 'Improve OCR accuracy for Kinyarwanda text, handwriting recognition, and intelligent document classification.',
  },
  {
    title: 'Customer Success Manager',
    team: 'Growth',
    type: 'Full-time',
    location: 'Kigali',
    description: 'Onboard enterprise clients, run training sessions, and serve as the voice of the customer internally.',
  },
];

const teamColors: Record<string, string> = {
  Engineering: '#007BFF',
  Design: '#9B51E0',
  'AI/OCR': '#00B89F',
  Growth: '#FF7A21',
};

const Careers: React.FC = () => {
  const navigate = useNavigate();

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
            label="Careers"
            sx={{ bgcolor: alpha('#FFFFFF', 0.15), color: 'white', fontWeight: 700, mb: 3, px: 1 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
            Help Us Build the Future of Document Management in Africa
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
            We're a small team with big ambitions. If you're passionate about solving real problems
            for African organisations, we want to hear from you.
          </Typography>
        </Container>
      </Box>

      {/* Perks */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 6 }}>
            Why SafeDocs Rwanda?
          </Typography>
          <Grid container spacing={3}>
            {perks.map((perk) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={perk.title}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h3" sx={{ mb: 1.5 }}>{perk.emoji}</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{perk.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{perk.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Open roles */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 2 }}>
            Open Positions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
            {openRoles.length} open roles across Engineering, Design, AI, and Growth.
          </Typography>
          <Stack spacing={2.5}>
            {openRoles.map((role) => (
              <Card key={role.title} sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {role.title}
                        </Typography>
                        <Chip
                          label={role.team}
                          size="small"
                          sx={{
                            bgcolor: alpha(teamColors[role.team] || '#007BFF', 0.1),
                            color: teamColors[role.team] || '#007BFF',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.7 }}>
                        {role.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={role.type} size="small" variant="outlined" />
                        <Chip label={role.location} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/contact')}
                      sx={{ flexShrink: 0, fontWeight: 700 }}
                    >
                      Apply
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary">
              Don't see a role that fits? Send us a speculative application at{' '}
              <strong>careers@safedocsrwanda.rw</strong>
            </Typography>
          </Box>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Careers;
