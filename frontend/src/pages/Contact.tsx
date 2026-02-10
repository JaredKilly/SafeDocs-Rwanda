import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Stack,
  MenuItem,
  Alert,
  alpha,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const contactInfo = [
  {
    icon: <EmailIcon sx={{ fontSize: 28 }} />,
    color: '#007BFF',
    label: 'Email Us',
    value: 'hello@safedocsrwanda.rw',
    sub: 'We respond within 24 hours',
  },
  {
    icon: <PhoneIcon sx={{ fontSize: 28 }} />,
    color: '#00B89F',
    label: 'Call Us',
    value: '+250 788 000 000',
    sub: 'Mon – Fri, 8 am – 6 pm CAT',
  },
  {
    icon: <LocationIcon sx={{ fontSize: 28 }} />,
    color: '#FF7A21',
    label: 'Visit Us',
    value: 'KG 7 Ave, Kigali, Rwanda',
    sub: 'Kigali Innovation City',
  },
];

const reasons = [
  'General enquiry',
  'Sales & pricing',
  'Technical support',
  'Partnership',
  'Press & media',
  'Other',
];

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', organisation: '', reason: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — no backend endpoint yet
    setSubmitted(true);
  };

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
            label="Contact"
            sx={{ bgcolor: alpha('#FFFFFF', 0.15), color: 'white', fontWeight: 700, mb: 3, px: 1 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
            Get in Touch
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7 }}>
            Whether you have a question, need a demo, or want to explore a partnership — we'd love to hear from you.
          </Typography>
        </Container>
      </Box>

      {/* Contact info cards */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {contactInfo.map((info) => (
              <Grid size={{ xs: 12, md: 4 }} key={info.label}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(info.color, 0.1),
                        color: info.color,
                        mb: 2,
                      }}
                    >
                      {info.icon}
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {info.label}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {info.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {info.sub}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Form */}
          <Grid container spacing={6} justifyContent="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Send a Message
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Fill in the form below and we'll get back to you within one business day.
                  </Typography>

                  {submitted ? (
                    <Alert severity="success" sx={{ fontSize: '1rem' }}>
                      Thank you! Your message has been received. We'll be in touch soon.
                    </Alert>
                  ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                      <Stack spacing={2.5}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              required
                              fullWidth
                              label="Your name"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              required
                              fullWidth
                              label="Email address"
                              name="email"
                              type="email"
                              value={form.email}
                              onChange={handleChange}
                            />
                          </Grid>
                        </Grid>

                        <TextField
                          fullWidth
                          label="Organisation (optional)"
                          name="organisation"
                          value={form.organisation}
                          onChange={handleChange}
                        />

                        <TextField
                          required
                          fullWidth
                          select
                          label="Reason for contact"
                          name="reason"
                          value={form.reason}
                          onChange={handleChange}
                        >
                          {reasons.map((r) => (
                            <MenuItem key={r} value={r}>{r}</MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={5}
                          label="Message"
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                        />

                        <Button
                          type="submit"
                          size="large"
                          variant="contained"
                          endIcon={<SendIcon />}
                          sx={{ alignSelf: 'flex-start', px: 4, py: 1.5, fontWeight: 700 }}
                        >
                          Send Message
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Contact;
