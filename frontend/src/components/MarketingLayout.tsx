import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Stack,
  Button,
  Typography,
  Divider,
  Grid,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
  Link as MuiLink,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import BrandLogo from './BrandLogo';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const footerColumns = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'Security', to: '/security' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Changelog', to: '/changelog' },
      { label: 'Join Waitlist', to: '/waitlist' },
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
];

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Navbar ─── */}
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
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              component={RouterLink}
              to="/"
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
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
                <Button color="inherit" sx={{ fontWeight: 600 }} component={RouterLink} to="/#features">
                  Features
                </Button>
                <Button color="inherit" sx={{ fontWeight: 600 }} component={RouterLink} to="/pricing">
                  Pricing
                </Button>
                <Button color="inherit" sx={{ fontWeight: 600 }} component={RouterLink} to="/about">
                  About
                </Button>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Button color="inherit" sx={{ fontWeight: 600 }} component={RouterLink} to="/waitlist">
                  Join Waitlist
                </Button>
                <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="contained" onClick={() => navigate('/register')} sx={{ ml: 1, px: 3 }}>
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
                <Button fullWidth component={RouterLink} to="/waitlist" onClick={() => setMobileMenuOpen(false)}>
                  Join Waitlist
                </Button>
                <Button fullWidth onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Sign In</Button>
                <Button fullWidth variant="contained" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                  Get Started Free
                </Button>
              </Stack>
            </Box>
          )}
        </Container>
      </AppBar>

      {/* ─── Page Content ─── */}
      <Box sx={{ flex: 1 }}>
        {children}
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

            {footerColumns.map((col) => (
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
                  sx={{
                    color: 'white',
                    opacity: 0.5,
                    fontSize: '0.875rem',
                    '&:hover': { opacity: 0.9 },
                  }}
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

export default MarketingLayout;
