import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Paper,
  alpha,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  Scanner as ScannerIcon,
  Folder as FolderIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  VerifiedUser as VerifiedIcon,
  AccountBalance as GovIcon,
  LocalHospital as HealthIcon,
  People as PeopleIcon,
  PermMedia as MediaIcon,
  Business as BusinessIcon,
  PlayCircleOutline as PlayIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <ScannerIcon sx={{ fontSize: 40 }} />,
      title: 'OCR Document Scanner',
      description: 'Scan physical documents with your camera or upload images. AI-powered OCR extracts text instantly for full searchability.',
      color: '#007BFF',
    },
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'Full-Text Search',
      description: 'Search across every document in your organization in under 2 seconds. Filter by tags, folders, dates, and metadata.',
      color: '#1F9CEF',
    },
    {
      icon: <ShareIcon sx={{ fontSize: 40 }} />,
      title: 'Sharing & Permissions',
      description: 'Share with Viewer, Commenter, Editor, or Owner roles. Generate share links, manage access requests, and revoke anytime.',
      color: '#FF7A21',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: 'Groups & Teams',
      description: 'Create groups, add members, and set group-level permissions. Collaborate across departments with structured access.',
      color: '#9B51E0',
    },
    {
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Organization',
      description: 'Folders, tags, metadata, and version history keep every document findable. Track changes with complete version control.',
      color: '#00B89F',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Enterprise Security',
      description: 'AES-256 encryption, TLS 1.3, role-based access control, and full audit trails for every action on every document.',
      color: '#E5484D',
    },
    {
      icon: <MediaIcon sx={{ fontSize: 40 }} />,
      title: 'Media Library',
      description: 'Upload, stream, and categorize images and videos. Grid or list views with rich metadata and storage tracking.',
      color: '#0288D1',
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-Tenant Orgs',
      description: 'Create organizations with full data isolation. Admins see everything, users see only their org. Built for SaaS scale.',
      color: '#2E7D32',
    },
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime SLA' },
    { number: '12+', label: 'Built-in Modules' },
    { number: '< 2s', label: 'Search Speed' },
    { number: '5', label: 'Security Levels' },
  ];

  const modules = [
    {
      icon: <GovIcon sx={{ fontSize: 44 }} />,
      title: 'Government',
      color: '#007BFF',
      description: 'Classified document management with 5 security levels, retention policies, issuing authority tracking, and sensitivity justifications.',
      checks: ['Public / Internal / Restricted / Confidential / Top Secret', 'Retention policies (1\u201320 years or permanent)', 'Government reference numbers & issuing authorities', 'Full audit trail per classification change'],
    },
    {
      icon: <HealthIcon sx={{ fontSize: 44 }} />,
      title: 'Healthcare',
      color: '#E5484D',
      description: 'Patient record management with privacy levels, consent tracking, record-type classification, and minimum-necessary access controls.',
      checks: ['Privacy: General / Sensitive / Restricted / Mental Health / HIV-AIDS', 'Patient consent tracking with expiry dates', 'Record types: Patient Record / Lab Result / Prescription / Clinical Note', 'Break-the-glass emergency access logging'],
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 44 }} />,
      title: 'Human Resources',
      color: '#FF7A21',
      description: 'Employee lifecycle management with HR document classification, department organization, contract tracking, and expiry alerts.',
      checks: ['Employee profiles with status tracking', 'HR categories: Contract / ID / Certificate / Performance / Payslip', 'Department-based organization', 'Document expiry monitoring and alerts'],
    },
    {
      icon: <MediaIcon sx={{ fontSize: 44 }} />,
      title: 'Media Library',
      color: '#00B89F',
      description: 'Image and video management with streaming, categorization, storage tracking, and bulk operations for rich media assets.',
      checks: ['Image and video upload with preview', 'Categories: Marketing / Training / Event / Documentation', 'In-browser video streaming', 'Storage usage tracking and quotas'],
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Your Org',
      description: 'Set up your organization in seconds. Invite team members, define departments, and configure access roles.',
      icon: <BusinessIcon sx={{ fontSize: 48, color: '#007BFF' }} />,
    },
    {
      step: '02',
      title: 'Upload or Scan',
      description: 'Upload documents directly or use the built-in OCR scanner to digitize physical paperwork. Supports PDF, images, and rich media.',
      icon: <CloudUploadIcon sx={{ fontSize: 48, color: '#FF7A21' }} />,
    },
    {
      step: '03',
      title: 'Classify & Organize',
      description: 'Apply industry-specific metadata \u2014 government classification, patient privacy levels, HR categories \u2014 and organize into folders with tags.',
      icon: <FolderIcon sx={{ fontSize: 48, color: '#9B51E0' }} />,
    },
    {
      step: '04',
      title: 'Share & Comply',
      description: 'Share documents with granular permissions, generate audit reports, and maintain full compliance with industry regulations.',
      icon: <VerifiedIcon sx={{ fontSize: 48, color: '#00B89F' }} />,
    },
  ];

  const testimonials = [
    {
      quote: 'The Government module with classification levels saved us from a compliance audit nightmare. We can now track every document from Public to Top Secret with full audit trails.',
      author: 'Marie Claire N.',
      title: 'Director of Records, Kigali City',
    },
    {
      quote: 'We migrated 10,000 patient records into SafeDocs Healthcare module in a week. The privacy levels and consent tracking gave us controls we never had before.',
      author: 'Dr. Jean Paul M.',
      title: 'Chief Medical Officer, Muhanga District Hospital',
    },
    {
      quote: 'Multi-tenant organizations changed everything for us. Each of our 5 regional offices operates independently, but leadership has full cross-org visibility through a single admin panel.',
      author: 'Aline K.',
      title: 'CTO, Rwanda Development Board',
    },
  ];

  const pricingPreview = [
    { name: 'Starter', price: 'Free', period: 'forever', color: '#007BFF', highlight: false },
    { name: 'Professional', price: 'RWF 25,000', period: '/month', color: '#FF7A21', highlight: true },
    { name: 'Enterprise', price: 'Custom', period: 'contact sales', color: '#0B1D2E', highlight: false },
  ];

  const screenshots = [
    {
      title: 'Document Dashboard',
      description: 'At-a-glance view of all your documents, storage usage, and recent activity.',
      image: '/images/screenshots/dashboard.png',
      color: '#007BFF',
    },
    {
      title: 'OCR Scanner',
      description: 'Scan physical documents with your camera and extract text with AI-powered OCR.',
      image: '/images/screenshots/scanner.png',
      color: '#FF7A21',
    },
    {
      title: 'Analytics & Insights',
      description: 'Track document trends, user activity, and storage growth with interactive charts.',
      image: '/images/screenshots/analytics.png',
      color: '#9B51E0',
    },
    {
      title: 'Government Module',
      description: 'Manage classified documents with 5 security levels and full audit trails.',
      image: '/images/screenshots/government.png',
      color: '#2E7D32',
    },
  ];

  return (
    <MarketingLayout>

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
                label="Now with Multi-Tenant Organizations"
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
                The Complete
                <Box component="span" sx={{ color: '#FF7A21' }}>
                  {' '}Document Platform{' '}
                </Box>
                for Rwanda
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 520 }}
              >
                Manage documents, scan with OCR, organize by department, and comply with
                industry regulations &mdash; all from one secure, multi-tenant platform built
                for Rwandan organizations.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }} flexWrap="wrap">
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
                  Start Free &mdash; No Credit Card
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/waitlist')}
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
                  Join the Waitlist
                </Button>
                <Button
                  variant="text"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'white',
                    opacity: 0.9,
                    px: 2,
                    py: 1.8,
                    fontSize: '1rem',
                    '&:hover': { opacity: 1 },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                {['No setup fees', 'GDPR Compliant', 'Multi-tenant ready', '24/7 support'].map((item) => (
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
                <Box sx={{ bgcolor: alpha('#000', 0.3), px: 2, py: 1.5, display: 'flex', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
                  <Typography variant="caption" sx={{ color: alpha('#FFF', 0.5), ml: 2 }}>
                    SafeDocs Rwanda &mdash; Acme Corp
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', minHeight: 340 }}>
                  <Box sx={{ width: 70, bgcolor: alpha('#000', 0.25), p: 1.5 }}>
                    {[FolderIcon, ScannerIcon, GovIcon, HealthIcon, PeopleIcon, MediaIcon].map((Icon, i) => (
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
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      {[
                        { label: '142 Docs', color: '#007BFF' },
                        { label: '3 Depts', color: '#FF7A21' },
                        { label: '5 Members', color: '#00B89F' },
                      ].map((stat) => (
                        <Box
                          key={stat.label}
                          sx={{
                            flex: 1, p: 1, borderRadius: 1.5,
                            bgcolor: alpha(stat.color, 0.15),
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, fontSize: '0.7rem' }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Typography variant="caption" sx={{ color: alpha('#FFF', 0.5), display: 'block', mb: 1 }}>
                      Recent Documents
                    </Typography>
                    {[
                      { name: 'Land Title - Plot 42.pdf', chip: 'Public', chipColor: '#27C93F' },
                      { name: 'Patient Record - #1042', chip: 'Restricted', chipColor: '#9B51E0' },
                      { name: 'Employment Contract.pdf', chip: 'HR', chipColor: '#FF7A21' },
                      { name: 'Q4 Financial Report.pdf', chip: 'Internal', chipColor: '#1F9CEF' },
                    ].map((doc, i) => (
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
                        <Typography variant="caption" sx={{ color: alpha('#FFF', 0.85), fontWeight: 500, flex: 1 }}>
                          {doc.name}
                        </Typography>
                        <Box
                          sx={{
                            px: 0.8, py: 0.2, borderRadius: 1,
                            bgcolor: alpha(doc.chipColor, 0.25),
                            fontSize: '0.6rem', fontWeight: 700,
                            color: doc.chipColor,
                          }}
                        >
                          {doc.chip}
                        </Box>
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

      {/* ─── Product Demo Video ─── */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="See It In Action" sx={{ mb: 2, fontWeight: 700, bgcolor: alpha('#FF7A21', 0.15), color: '#FF7A21' }} />
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
              Watch SafeDocs in Action
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              See how teams across Rwanda manage documents, scan with OCR, and stay compliant &mdash; all from one platform
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Paper
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(11, 29, 46, 0.18)',
              }}
            >
              {/* Replace the src below with your actual video URL */}
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%', /* 16:9 aspect ratio */
                  bgcolor: '#0B1D2E',
                }}
              >
                <Box
                  component="video"
                  controls
                  poster="/images/video-poster.jpg"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                >
                  <source src="/videos/safedocs-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </Box>
                {/* Fallback overlay when no video is loaded yet */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0B1D2E 0%, #003A80 60%, #007BFF 100%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                >
                  <PlayIcon sx={{ fontSize: 80, color: alpha('#FFFFFF', 0.7), mb: 2 }} />
                  <Typography variant="h6" sx={{ color: alpha('#FFFFFF', 0.8), fontWeight: 600 }}>
                    Product Demo
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.5) }}>
                    Place your video at /public/videos/safedocs-demo.mp4
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
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
              One Platform, Every Tool
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
              From OCR scanning to multi-tenant organizations &mdash; everything to manage your document lifecycle
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
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
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(feature.color, 0.1),
                        color: feature.color,
                        mb: 2.5,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.05rem' }}>
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

      {/* ─── Industry Modules ─── */}
      <Box id="modules" sx={{ bgcolor: '#F2F4F7', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Industry Modules" sx={{ mb: 2, fontWeight: 700, bgcolor: alpha('#9B51E0', 0.12), color: '#9B51E0' }} />
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
              Purpose-Built for Your Industry
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Specialized modules with field-level controls, compliance features, and domain-specific workflows
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {modules.map((mod, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Paper
                  sx={{
                    p: { xs: 3, md: 4 },
                    height: '100%',
                    borderRadius: 3.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 40px rgba(11, 29, 46, 0.12)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(mod.color, 0.1),
                        color: mod.color,
                        flexShrink: 0,
                      }}
                    >
                      {mod.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {mod.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2.5 }}>
                    {mod.description}
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Stack spacing={1.5}>
                    {mod.checks.map((check, j) => (
                      <Stack key={j} direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleIcon sx={{ color: mod.color, fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {check}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Platform Screenshots ─── */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Platform Preview" sx={{ mb: 2, fontWeight: 700, bgcolor: alpha('#007BFF', 0.12), color: '#007BFF' }} />
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
              Designed for Clarity &amp; Speed
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
              A clean, intuitive interface that lets your team focus on work &mdash; not learning a tool
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {screenshots.map((shot, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Paper
                  sx={{
                    borderRadius: 3.5,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 20px 50px rgba(11, 29, 46, 0.15)',
                    },
                  }}
                >
                  {/* Image area — replace src with your actual screenshot */}
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '60%',
                      bgcolor: alpha(shot.color, 0.06),
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={shot.image}
                      alt={shot.title}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Fallback placeholder when image doesn't exist */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'none',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${alpha(shot.color, 0.08)} 0%, ${alpha(shot.color, 0.18)} 100%)`,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 48, color: alpha(shot.color, 0.4), mb: 1 }} />
                      <Typography variant="caption" sx={{ color: alpha(shot.color, 0.6), fontWeight: 600 }}>
                        {shot.image}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {shot.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {shot.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Multi-Tenant Organizations ─── */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Chip label="New" sx={{ mb: 2, fontWeight: 700, bgcolor: alpha('#2E7D32', 0.12), color: '#2E7D32' }} />
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
                Built for Multi-Tenant Organizations
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                Every organization gets fully isolated data &mdash; documents, folders, groups, and audit logs are
                scoped per-org. Admins have cross-org visibility while users see only what belongs to their team.
              </Typography>
              <Stack spacing={2} sx={{ mb: 4 }}>
                {[
                  'Complete data isolation between organizations',
                  'Admin-level cross-org visibility and management',
                  'Per-organization user and role management',
                  'Industry module settings scoped per-org',
                ].map((item) => (
                  <Stack key={item} direction="row" spacing={1.5} alignItems="center">
                    <CheckCircleIcon sx={{ color: '#2E7D32', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/register')}
                sx={{ px: 4, py: 1.5 }}
              >
                Create Your Organization
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: alpha('#0B1D2E', 0.03),
                }}
              >
                <Box sx={{ bgcolor: alpha('#0B1D2E', 0.06), px: 3, py: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Organizations
                  </Typography>
                </Box>
                {[
                  { name: 'Acme Corp', docs: 142, active: true },
                  { name: 'Rwanda Health Ministry', docs: 89, active: false },
                  { name: 'Kigali HR Services', docs: 56, active: false },
                ].map((org, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 3,
                      py: 2,
                      bgcolor: org.active ? alpha('#007BFF', 0.08) : 'transparent',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: alpha('#007BFF', 0.06) },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <BusinessIcon sx={{ color: org.active ? 'primary.main' : 'text.disabled' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: org.active ? 700 : 500 }}>
                        {org.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${org.docs} docs`}
                      size="small"
                      variant={org.active ? 'filled' : 'outlined'}
                      color={org.active ? 'primary' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
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
              Get Started in 4 Steps
            </Typography>
            <Typography variant="h6" color="text.secondary">
              From sign-up to full compliance in under an hour
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

      {/* ─── Testimonials ─── */}
      <Box sx={{ py: 12 }}>
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
                      &ldquo;
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

      {/* ─── Pricing Teaser ─── */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 10 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="Pricing" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
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
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Start free. Upgrade as you grow. No hidden fees.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 5 }}>
            {pricingPreview.map((plan) => (
              <Grid size={{ xs: 12, sm: 4 }} key={plan.name}>
                <Paper
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 3.5,
                    border: plan.highlight ? '2px solid #FF7A21' : '1px solid',
                    borderColor: plan.highlight ? '#FF7A21' : 'divider',
                    position: 'relative',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(11,29,46,0.1)' },
                  }}
                >
                  {plan.highlight && (
                    <Chip
                      label="Most Popular"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: '#FF7A21',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  )}
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 700, letterSpacing: 2, color: plan.color }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.period}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/pricing')}
              sx={{ px: 4, py: 1.5, fontWeight: 600 }}
            >
              View Full Pricing & Compare Plans
            </Button>
          </Box>
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
              Ready to Transform Your Document Workflow?
            </Typography>
            <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              Join organizations across government, healthcare, and business who trust SafeDocs Rwanda
              to manage their most critical documents. Start free &mdash; upgrade when you need to.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" flexWrap="wrap">
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
                onClick={() => navigate('/waitlist')}
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
                Join the Waitlist
              </Button>
              <Button
                variant="text"
                size="large"
                onClick={() => navigate('/contact')}
                sx={{
                  color: 'white',
                  opacity: 0.9,
                  px: 3,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': { opacity: 1 },
                }}
              >
                Talk to Sales
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

    </MarketingLayout>
  );
};

export default Landing;
