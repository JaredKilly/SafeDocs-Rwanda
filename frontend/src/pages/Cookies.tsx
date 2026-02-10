import React from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Paper,
  Divider,
  alpha,
} from '@mui/material';
import MarketingLayout from '../components/MarketingLayout';

interface CookieRow {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
}

const cookieTypes: { category: string; color: string; description: string; cookies: CookieRow[] }[] = [
  {
    category: 'Strictly Necessary',
    color: '#007BFF',
    description:
      'These cookies are essential for the website to function. They cannot be disabled. They are usually set in response to actions you take such as logging in or filling in forms.',
    cookies: [
      { name: 'access_token', provider: 'safedocsrwanda.rw', purpose: 'Stores your JWT session token for authentication.', duration: 'Session' },
      { name: 'refresh_token', provider: 'safedocsrwanda.rw', purpose: 'Allows the platform to refresh your session without re-login.', duration: '7 days' },
      { name: 'XSRF-TOKEN', provider: 'safedocsrwanda.rw', purpose: 'Protects against Cross-Site Request Forgery attacks.', duration: 'Session' },
    ],
  },
  {
    category: 'Functional',
    color: '#9B51E0',
    description:
      'These cookies allow the website to remember choices you make and provide enhanced, personalised features such as theme preference and language settings.',
    cookies: [
      { name: 'sd_theme', provider: 'safedocsrwanda.rw', purpose: 'Remembers your light/dark mode preference.', duration: '1 year' },
      { name: 'sd_locale', provider: 'safedocsrwanda.rw', purpose: 'Stores your preferred language.', duration: '1 year' },
    ],
  },
  {
    category: 'Analytics',
    color: '#00B89F',
    description:
      'These cookies help us understand how visitors interact with our website so we can improve the user experience. All data is aggregated and anonymised.',
    cookies: [
      { name: '_ga', provider: 'Google Analytics', purpose: 'Distinguishes unique users for aggregate traffic analysis.', duration: '2 years' },
      { name: '_ga_*', provider: 'Google Analytics', purpose: 'Stores and counts page views.', duration: '2 years' },
    ],
  },
];

const Cookies: React.FC = () => {
  return (
    <MarketingLayout>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0B1D2E 0%, #003A80 60%, #007BFF 100%)',
          color: 'white',
          pt: { xs: 7, md: 10 },
          pb: { xs: 7, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Chip label="Legal" sx={{ bgcolor: alpha('#FFFFFF', 0.15), color: 'white', fontWeight: 700, mb: 2.5, px: 1 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.8rem', md: '2.6rem' } }}>
            Cookie Policy
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Last updated: 1 February 2026
          </Typography>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, mb: 5 }}>
            This Cookie Policy explains what cookies are, which ones SafeDocs Rwanda uses, and how you can
            manage your preferences. By continuing to use our platform, you consent to the use of cookies
            as described below.
          </Typography>

          {/* What are cookies */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            What Are Cookies?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, mb: 5 }}>
            Cookies are small text files placed on your device by a website when you visit it. They help
            the website remember information about your visit, which can make it easier to visit the site
            again and make the site more useful to you. Cookies do not give us access to your computer
            or any information about you other than the data you choose to share with us.
          </Typography>

          <Divider sx={{ mb: 5 }} />

          {/* Cookie tables */}
          <Stack spacing={6}>
            {cookieTypes.map((type) => (
              <Box key={type.category}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {type.category} Cookies
                  </Typography>
                  <Chip
                    label={type.category === 'Strictly Necessary' ? 'Always active' : 'Optional'}
                    size="small"
                    sx={{
                      bgcolor: alpha(type.color, 0.1),
                      color: type.color,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2.5 }}>
                  {type.description}
                </Typography>

                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 2fr 1fr',
                      bgcolor: alpha(type.color, 0.06),
                      px: 2,
                      py: 1.2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {['Cookie', 'Provider', 'Purpose', 'Duration'].map((h) => (
                      <Typography key={h} variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {h}
                      </Typography>
                    ))}
                  </Box>
                  {type.cookies.map((cookie, i) => (
                    <Box
                      key={cookie.name}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 2fr 1fr',
                        px: 2,
                        py: 1.5,
                        borderBottom: i < type.cookies.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        '&:hover': { bgcolor: alpha(type.color, 0.03) },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                        {cookie.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cookie.provider}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cookie.purpose}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cookie.duration}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 6 }} />

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Managing Your Cookie Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, mb: 3 }}>
            You can control and delete cookies through your browser settings. Note that disabling
            strictly necessary cookies will prevent you from logging in or using the platform. Refer to
            your browser's help documentation for instructions:
          </Typography>
          <Stack component="ul" spacing={0.8} sx={{ pl: 2.5 }}>
            {['Chrome', 'Firefox', 'Safari', 'Edge'].map((b) => (
              <Typography component="li" variant="body2" key={b} sx={{ lineHeight: 1.8 }}>
                <strong>{b}</strong>: Settings → Privacy and Security → Cookies and other site data
              </Typography>
            ))}
          </Stack>

          <Divider sx={{ my: 6 }} />

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Contact
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
            Questions about our use of cookies? Contact us at <strong>privacy@safedocsrwanda.rw</strong>.
          </Typography>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Cookies;
