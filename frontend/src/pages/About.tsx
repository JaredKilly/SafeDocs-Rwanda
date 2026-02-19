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
  Security as SecurityIcon,
  VerifiedUser as ReliabilityIcon,
  Dashboard as SimplicityIcon,
  LocalOffer as AffordabilityIcon,
  Support as CustomerFocusIcon,
  Business as ProfessionalismIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const coreValues = [
  {
    icon: <SecurityIcon sx={{ fontSize: 36 }} />,
    color: '#007BFF',
    title: 'Security First',
    description:
      'We protect client information with strict confidentiality and secure handling.',
  },
  {
    icon: <ReliabilityIcon sx={{ fontSize: 36 }} />,
    color: '#00B89F',
    title: 'Reliability',
    description:
      'We deliver accurate, organized, and dependable document solutions every time.',
  },
  {
    icon: <SimplicityIcon sx={{ fontSize: 36 }} />,
    color: '#9B51E0',
    title: 'Simplicity',
    description:
      'We make document management easy and practical for everyday business use.',
  },
  {
    icon: <AffordabilityIcon sx={{ fontSize: 36 }} />,
    color: '#2E7D32',
    title: 'Affordability',
    description:
      'We provide high-quality services designed for small and local businesses.',
  },
  {
    icon: <CustomerFocusIcon sx={{ fontSize: 36 }} />,
    color: '#FF7A21',
    title: 'Customer Focus',
    description:
      'We listen, understand business needs, and provide solutions that truly help.',
  },
  {
    icon: <ProfessionalismIcon sx={{ fontSize: 36 }} />,
    color: '#0B1D2E',
    title: 'Professionalism',
    description:
      'We work with integrity, discipline, and respect for records management standards.',
  },
];

const mission = {
  title: 'Our Mission',
  description: 'To help Rwandan businesses organize, protect, and digitize their records so they can work efficiently, reduce risks, and focus on growing their businesses.',
};

const vision = {
  title: 'Our Vision',
  description: 'To become Rwanda\'s trusted leader in digital archiving and smart document management for both small and growing businesses.',
};

const milestones = [
  { year: 'Nov 2025', event: 'SafeDocs Rwanda founded. Physical records organization services launched for local institutions.' },
  { year: '2026', event: 'Digital platform launched. First organizations onboarded with scanning, indexing, and secure storage.' },
  { year: '2027', event: 'Expansion of services. Partnerships with business associations and government agencies.' },
  { year: '2028', event: 'Regional growth. Scaling to support businesses across Rwanda and the EAC.' },
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

      {/* Mission & Vision */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%', p: 1 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha('#007BFF', 0.1),
                      color: '#007BFF',
                      mb: 2.5,
                    }}
                  >
                    <MissionIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    {mission.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                    {mission.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%', p: 1 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha('#FF7A21', 0.1),
                      color: '#FF7A21',
                      mb: 2.5,
                    }}
                  >
                    <VisionIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    {vision.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                    {vision.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Core Values */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="What We Stand For" sx={{ mb: 2, fontWeight: 700, bgcolor: alpha('#007BFF', 0.12), color: '#007BFF' }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Our Core Values
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {coreValues.map((v, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{ height: '100%', p: 1, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
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
              Rwanda is growing fast in digital transformation, but many businesses still struggle
              with paper files, lost documents, and limited storage space.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              SafeDocs Rwanda was created to solve this challenge.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              Founded by a professional in Records and Archives Management, SafeDocs Rwanda helps
              organizations move from paper-based systems to organized and secure digital records.
              The idea came from seeing how poor document management causes delays, lost
              information, and operational risks for many businesses.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              We started by offering physical records organization and have already supported
              local institutions in improving their filing systems. Our next step is expanding
              into full digital archiving using professional scanning, indexing, and secure
              storage solutions.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              Today, SafeDocs Rwanda is building affordable and practical document solutions
              designed specifically for small and growing businesses.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              We believe that when businesses can easily find and protect their information,
              they save time, reduce costs, and make better decisions.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              And this is just the beginning.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mt: 3,
                letterSpacing: 0.5,
                fontSize: '1.1rem',
              }}
            >
              Your Documents. Safe. Organized. Accessible.
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/waitlist')}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#FF7A21', '&:hover': { bgcolor: '#CC611A' }, px: 4, py: 1.5, fontWeight: 700 }}
            >
              Join the Waitlist
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ px: 4, py: 1.5, fontWeight: 700 }}
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
