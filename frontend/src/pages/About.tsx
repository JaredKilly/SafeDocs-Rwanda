import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  alpha,
} from '@mui/material';
import {
  Flag as MissionIcon,
  Visibility as VisionIcon,
  Favorite as ValuesIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const values = [
  {
    icon: <MissionIcon sx={{ fontSize: 36 }} />,
    color: '#007BFF',
    title: 'Our Mission',
    description:
      'To empower Rwandan organisations to securely digitise, manage, and share their documents — eliminating paperwork, reducing costs, and accelerating service delivery.',
  },
  {
    icon: <VisionIcon sx={{ fontSize: 36 }} />,
    color: '#FF7A21',
    title: 'Our Vision',
    description:
      'A fully paperless Rwanda where every organisation — from a rural health clinic to a national government agency — can access and protect their records instantly and securely.',
  },
  {
    icon: <ValuesIcon sx={{ fontSize: 36 }} />,
    color: '#9B51E0',
    title: 'Our Values',
    description:
      'Security first. Local context. Radical transparency. We build for the community we serve and we hold ourselves accountable to the people who trust us with their data.',
  },
];

const milestones = [
  { year: '2023', event: 'SafeDocs Rwanda founded in Kigali by a team of Rwandan engineers.' },
  { year: '2024', event: 'First 50 organisations onboarded. OCR engine launched in beta.' },
  { year: '2025', event: 'Version 1.0 released. Partnership with Rwanda Development Board.' },
  { year: '2026', event: 'Professional and Enterprise tiers launched. Expansion to EAC region begins.' },
];

const About: React.FC = () => {
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
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip
            label="About Us"
            sx={{ bgcolor: alpha('#FFFFFF', 0.15), color: 'white', fontWeight: 700, mb: 3, px: 1 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
            Proudly Built in Rwanda
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 620, mx: 'auto' }}>
            SafeDocs Rwanda was created by Rwandan technologists who lived the pain of paper-based
            document management first-hand. We built the product we always wished existed.
          </Typography>
        </Container>
      </Box>

      {/* Mission / Vision / Values */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {values.map((v, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Card sx={{ height: '100%', p: 1 }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(v.color, 0.1),
                        color: v.color,
                        mb: 2.5,
                      }}
                    >
                      {v.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {v.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {v.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Story */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
            Our Story
          </Typography>
          <Stack spacing={2.5}>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              Rwanda has made extraordinary strides in digital transformation — from e-government
              services to cashless payments. Yet document management in most organisations
              remained stubbornly analogue: filing cabinets, lost papers, manual indexing, and
              slow approval workflows.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              SafeDocs Rwanda was founded to close that gap. We designed a platform that respects
              the realities of Rwandan institutions — from limited bandwidth in rural areas to
              the compliance requirements of government agencies — while delivering a modern,
              intuitive experience that anyone can use.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              Today, organisations across Kigali and beyond use SafeDocs to store millions of
              documents, saving hours of administrative work every day. We are just getting started.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Timeline */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 6, textAlign: 'center' }}>
            Milestones
          </Typography>
          <Stack spacing={0}>
            {milestones.map((m, i) => (
              <Stack key={i} direction="row" spacing={3} alignItems="flex-start" sx={{ mb: i < milestones.length - 1 ? 4 : 0 }}>
                <Box sx={{ textAlign: 'center', minWidth: 56 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {m.year}
                  </Typography>
                  {i < milestones.length - 1 && (
                    <Box sx={{ width: 2, height: 40, bgcolor: 'divider', mx: 'auto', mt: 1 }} />
                  )}
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, pt: 0.1 }}>
                  {m.event}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0B1D2E 0%, #007BFF 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Join Our Journey
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 4, lineHeight: 1.8 }}>
            Become part of the community transforming how Rwanda manages its documents.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#FF7A21', '&:hover': { bgcolor: '#CC611A' }, px: 4, py: 1.5, fontWeight: 700 }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/contact')}
              sx={{ borderColor: alpha('#FFF', 0.5), color: 'white', px: 4, py: 1.5, '&:hover': { borderColor: 'white', bgcolor: alpha('#FFF', 0.08) } }}
            >
              Talk to Us
            </Button>
          </Stack>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default About;
