import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Stack,
  Paper,
  alpha,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
  Chip,
  Link as MuiLink,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  Scanner as ScannerIcon,
  Folder as FolderIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  AutoFixHigh as OCRIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import BrandLogo from '../components/BrandLogo';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const features = [
    {
      icon: <ScannerIcon sx={{ fontSize: 40 }} />,
      title: 'Advanced OCR Scanning',
      description: 'Scan physical documents and extract text automatically for easy searching and indexing.',
      color: '#007BFF',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Bank-Grade Security',
      description: 'Enterprise-level encryption and role-based access control keeps your data protected.',
      color: '#1F9CEF',
    },
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'Powerful Search',
      description: 'Full-text search across all documents in under 2 seconds.',
      color: '#9B51E0',
    },
    {
      icon: <ShareIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Sharing',
      description: 'Share with customizable viewer, commenter, or editor permissions.',
      color: '#FF7A21',
    },
    {
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      title: 'Organized Storage',
      description: 'Folders, tags, and metadata make finding any document effortless.',
      color: '#00B89F',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: 'Team Collaboration',
      description: 'Groups, shared access, and request workflows for seamless teamwork.',
      color: '#E5484D',
    },
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime' },
    { number: '256-bit', label: 'Encryption' },
    { number: '< 2s', label: 'Search Speed' },
    { number: '24/7', label: 'Support' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload or Scan',
      description: 'Upload your files directly or use the built-in scanner to digitize physical documents. Supports PDF, images, and more.',
      icon: <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    },
    {
      step: '02',
      title: 'Automatic OCR Processing',
      description: 'Our AI-powered OCR engine extracts text from scanned images, making every document fully searchable.',
      icon: <OCRIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
    },
    {
      step: '03',
      title: 'Organize & Secure',
      description: 'Sort documents into folders, apply tags, set permissions, and organize your entire document library with ease.',
      icon: <FolderIcon sx={{ fontSize: 48, color: '#9B51E0' }} />,
    },
    {
      step: '04',
      title: 'Share & Collaborate',
      description: 'Share documents with your team or external partners with granular access controls and audit trails.',
      icon: <VerifiedIcon sx={{ fontSize: 48, color: '#00B89F' }} />,
    },
  ];

  const testimonials = [
    {
      quote: 'SafeDocs Rwanda transformed how we handle government records. We went from weeks of searching to seconds.',
      author: 'Marie Claire N.',
      title: 'Director of Records, Kigali City',
    },
    {
      quote: 'The OCR feature alone saved us months of manual data entry. A game-changer for our finance team.',
      author: 'Jean Paul M.',
      title: 'CFO, Rwanda Development Board',
    },
    {
      quote: 'Finally, a document management system designed for African institutions. Easy, fast, and secure.',
      author: 'Aline K.',
      title: 'IT Manager, Muhanga Hospital',
    },
  ];

  const useCases = [
    {
      title: 'For Government',
      description: 'Digitize official records, permits, and citizen documents with full audit trails and compliance features.',
      icon: <LockIcon sx={{ fontSize: 40 }} />,
      checks: ['Audit Trails', 'Role-Based Access', 'Compliance Ready', 'Digital Signatures'],
    },
    {
      title: 'For Businesses',
      description: 'Streamline document workflows, cut paper costs, and boost productivity with automated organization.',
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      checks: ['Workflow Automation', 'Team Collaboration', 'Cost Reduction', 'Quick Search'],
    },
    {
      title: 'For Healthcare',
      description: 'Store patient records securely with encryption and controlled access management for HIPAA compliance.',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      checks: ['Patient Privacy', 'Secure Storage', 'Access Logs', 'Data Backup'],
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', overflowX: 'hidden' }}>

      {/* ─── Navigation ─── */}
      <AppBar
        position="sticky"
        elevation={0}
        color="default"
        sx={{
          bgcolor: alpha('#FFFFFF', 0.96),
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <BrandLogo size={34} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#0B1D2E' }}>
                  SafeDocs
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Rwanda
                </Typography>
              </Box>
            </Stack>

            {!isMobile ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => scrollTo('features')}>
                  Features
                </Button>
                <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => scrollTo('how-it-works')}>
                  How It Works
                </Button>
                <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => scrollTo('solutions')}>
                  Solutions
                </Button>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{ ml: 1, px: 3 }}
                >
                  Get Started Free
                </Button>
              </Stack>
            ) : (
              <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Toolbar>

          {isMobile && mobileMenuOpen && (
            <Box sx={{ pb: 2 }}>
              <Stack spacing={1}>
                <Button fullWidth onClick={() => { scrollTo('features'); setMobileMenuOpen(false); }}>
                  Features
                </Button>
                <Button fullWidth onClick={() => { scrollTo('how-it-works'); setMobileMenuOpen(false); }}>
                  How It Works
                </Button>
                <Button fullWidth onClick={() => { scrollTo('solutions'); setMobileMenuOpen(false); }}>
                  Solutions
                </Button>
                <Divider />
                <Button fullWidth onClick={() => navigate('/login')}>Sign In</Button>
                <Button fullWidth variant="contained" onClick={() => navigate('/register')}>
                  Get Started Free
                </Button>
              </Stack>
            </Box>
          )}
        </Container>
      </AppBar>

      {/* ─── Hero ─── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0B1D2E 0%, #003A80 60%, #007BFF 100%)',
          color: 'white',
          pt: { xs: 8, md: 14 },
          pb: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: alpha('#007BFF', 0.12),
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-20%',
            left: '-5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: alpha('#FF7A21', 0.08),
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="Trusted in Rwanda 🇷🇼"
                sx={{
                  bgcolor: alpha('#FF7A21', 0.2),
                  color: '#FF9C4E',
                  fontWeight: 700,
                  mb: 3,
                  px: 1,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem' },
                  lineHeight: 1.1,
                }}
              >
                Secure Document
                <Box component="span" sx={{ color: '#FF7A21' }}>
                  {' '}Management{' '}
                </Box>
                for Modern Rwanda
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 520 }}
              >
                Digitize, organize, and protect your documents with advanced OCR scanning,
                intelligent search, and bank-grade security — built for Rwandan organizations.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#FF7A21',
                    px: 4,
                    py: 1.8,
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#CC611A' },
                  }}
                >
                  Start Free — No Credit Card
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: alpha('#FFFFFF', 0.5),
                    color: 'white',
                    px: 4,
                    py: 1.8,
                    fontSize: '1.05rem',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#FFFFFF', 0.08),
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
              <Stack direction="row" spacing={3}>
                {['No setup fees', 'GDPR Compliant', 'Local support'].map((item) => (
                  <Stack key={item} direction="row" spacing={0.5} alignItems="center">
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#1F9CEF' }} />
                    <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {/* Mock UI Dashboard Preview */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: alpha('#FFFFFF', 0.15),
                  bgcolor: alpha('#FFFFFF', 0.06),
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Window bar */}
                <Box sx={{ bgcolor: alpha('#000', 0.3), px: 2, py: 1.5, display: 'flex', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
                  <Typography variant="caption" sx={{ color: alpha('#FFF', 0.5), ml: 2 }}>
                    SafeDocs Rwanda — Dashboard
                  </Typography>
                </Box>
                {/* Mock sidebar + content */}
                <Box sx={{ display: 'flex', minHeight: 320 }}>
                  <Box sx={{ width: 70, bgcolor: alpha('#000', 0.25), p: 1.5 }}>
                    {[ScannerIcon, FolderIcon, SearchIcon, GroupIcon].map((Icon, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 44, height: 44, borderRadius: 2,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: i === 0 ? 'primary.main' : alpha('#FFF', 0.08),
                          mb: 1, cursor: 'pointer',
                        }}
                      >
                        <Icon sx={{ fontSize: 20, color: 'white' }} />
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ flex: 1, p: 2 }}>
                    <Typography variant="caption" sx={{ color: alpha('#FFF', 0.5), display: 'block', mb: 1 }}>
                      Recent Documents
                    </Typography>
                    {['Q4 Financial Report.pdf', 'Land Title - Plot 42.pdf', 'Meeting Minutes Jan.docx', 'Staff Contracts 2025.pdf'].map((name, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          p: 1.2, mb: 0.8, borderRadius: 1.5,
                          bgcolor: i === 0 ? alpha('#007BFF', 0.2) : alpha('#FFF', 0.04),
                          '&:hover': { bgcolor: alpha('#007BFF', 0.15) },
                        }}
                      >
                        <FolderIcon sx={{ fontSize: 18, color: i === 0 ? '#007BFF' : alpha('#FFF', 0.4) }} />
                        <Typography variant="caption" sx={{ color: alpha('#FFF', 0.85), fontWeight: 500 }}>
                          {name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── Stats Bar ─── */}
      <Box sx={{ bgcolor: 'background.paper', py: 5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {stats.map((stat, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #007BFF 0%, #1F9CEF 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Features Grid ─── */}
      <Box id="features" sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Features" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #0B1D2E 0%, #007BFF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Everything You Need
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
              Powerful tools to manage your entire document lifecycle in one place
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    p: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 40px rgba(11, 29, 46, 0.14)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(feature.color, 0.1),
                        color: feature.color,
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── How It Works ─── */}
      <Box id="how-it-works" sx={{ bgcolor: '#F2F4F7', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="How It Works" sx={{ mb: 2, fontWeight: 700, bgcolor: alpha('#FF7A21', 0.15), color: '#FF7A21' }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #0B1D2E 0%, #007BFF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Simple 4-Step Process
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get your documents organized in minutes, not days
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {steps.map((step, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  {i < steps.length - 1 && !isMobile && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 36,
                        right: '-20%',
                        width: '40%',
                        height: 2,
                        background: 'linear-gradient(90deg, #007BFF, transparent)',
                        zIndex: 1,
                      }}
                    />
                  )}
                  <Paper
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      position: 'relative',
                      zIndex: 2,
                      boxShadow: '0 8px 20px rgba(11,29,46,0.1)',
                    }}
                  >
                    {step.icon}
                  </Paper>
                  <Typography
                    variant="overline"
                    sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
                  >
                    STEP {step.step}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, mb: 1.5 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Solutions / Use Cases ─── */}
      <Box id="solutions" sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Solutions" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #0B1D2E 0%, #007BFF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Built for Every Organization
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Trusted by government, businesses, and healthcare providers across Rwanda
            </Typography>
          </Box>

          <Stack spacing={6}>
            {useCases.map((useCase, i) => (
              <Paper
                key={i}
                sx={{
                  p: { xs: 3, md: 5 },
                  transition: 'all 0.3s',
                  '&:hover': { boxShadow: '0 16px 40px rgba(11, 29, 46, 0.12)' },
                }}
              >
                <Grid container spacing={4} alignItems="center" direction={i % 2 === 1 ? 'row-reverse' : 'row'}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha('#FF7A21', 0.1),
                        color: 'secondary.main',
                        mb: 3,
                      }}
                    >
                      {useCase.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      {useCase.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                      {useCase.description}
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/register')}
                    >
                      Get Started
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Grid container spacing={2}>
                      {useCase.checks.map((check, j) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={j}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: alpha('#007BFF', 0.05),
                              border: '1px solid',
                              borderColor: alpha('#007BFF', 0.1),
                            }}
                          >
                            <CheckCircleIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {check}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ─── Testimonials ─── */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Testimonials" sx={{ mb: 2, fontWeight: 700, bgcolor: alpha('#9B51E0', 0.12), color: '#9B51E0' }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #0B1D2E 0%, #007BFF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              What Our Users Say
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((t, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    p: 1,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h2"
                      sx={{ color: 'primary.main', lineHeight: 0.5, mb: 2, fontWeight: 800 }}
                    >
                      "
                    </Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.8, mb: 3, color: 'text.secondary' }}>
                      {t.quote}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {t.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Final CTA ─── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0B1D2E 0%, #007BFF 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: alpha('#FFFFFF', 0.04),
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Ready to Digitize Rwanda?
            </Typography>
            <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, maxWidth: 560, mx: 'auto' }}>
              Join hundreds of organizations transforming how they manage documents.
              Start free — upgrade when you need to.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#FF7A21',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#CC611A' },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: alpha('#FFFFFF', 0.5),
                  color: 'white',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#FFFFFF', 0.08),
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ─── Footer ─── */}
      <Box sx={{ bgcolor: '#0B1D2E', color: 'white', pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <BrandLogo size={32} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>SafeDocs</Typography>
                  <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.5) }}>Rwanda</Typography>
                </Box>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.65, mb: 3, lineHeight: 1.8 }}>
                Secure, intelligent document management built for Rwandan organizations.
                Digitize. Organize. Protect.
              </Typography>
              <Stack direction="row" spacing={1}>
                {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map((Icon, i) => (
                  <IconButton
                    key={i}
                    size="small"
                    sx={{
                      color: 'white',
                      bgcolor: alpha('#FFFFFF', 0.08),
                      '&:hover': { bgcolor: alpha('#FFFFFF', 0.15) },
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            {[
              {
                heading: 'Product',
                links: [
                  { label: 'Features', to: '/#features' },
                  { label: 'Security', to: '/security' },
                  { label: 'Pricing', to: '/pricing' },
                  { label: 'Changelog', to: '/changelog' },
                ],
              },
              {
                heading: 'Company',
                links: [
                  { label: 'About Us', to: '/about' },
                  { label: 'Careers', to: '/careers' },
                  { label: 'Contact', to: '/contact' },
                  { label: 'Press', to: '/press' },
                ],
              },
              {
                heading: 'Legal',
                links: [
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms of Service', to: '/terms' },
                  { label: 'Compliance', to: '/compliance' },
                  { label: 'Cookie Policy', to: '/cookies' },
                ],
              },
            ].map((col) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.5 }} key={col.heading}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, letterSpacing: 0.5 }}>
                  {col.heading}
                </Typography>
                <Stack spacing={1.5}>
                  {col.links.map((link) => (
                    <MuiLink
                      key={link.label}
                      component={RouterLink}
                      to={link.to}
                      underline="none"
                      sx={{
                        color: 'white',
                        opacity: 0.6,
                        fontSize: '0.875rem',
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      {link.label}
                    </MuiLink>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 5, borderColor: alpha('#FFFFFF', 0.1) }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              © {new Date().getFullYear()} SafeDocs Rwanda. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              {[
                { label: 'Privacy', to: '/privacy' },
                { label: 'Terms', to: '/terms' },
                { label: 'Cookies', to: '/cookies' },
              ].map((item) => (
                <MuiLink
                  key={item.label}
                  component={RouterLink}
                  to={item.to}
                  underline="none"
                  sx={{ color: 'white', opacity: 0.5, fontSize: '0.875rem', '&:hover': { opacity: 0.9 } }}
                >
                  {item.label}
                </MuiLink>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

    </Box>
  );
};

export default Landing;
