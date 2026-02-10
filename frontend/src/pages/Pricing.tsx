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
  Divider,
  alpha,
} from '@mui/material';
import { CheckCircle as CheckIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import MarketingLayout from '../components/MarketingLayout';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for individuals and small teams getting started with document management.',
    color: '#007BFF',
    highlighted: false,
    cta: 'Get Started Free',
    features: [
      '5 GB storage',
      'Up to 3 users',
      '100 documents / month',
      'Basic OCR scanning',
      'Full-text search',
      'Folder organisation',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    price: 'RWF 25,000',
    period: 'per month',
    description: 'For growing organisations that need advanced features and more capacity.',
    color: '#FF7A21',
    highlighted: true,
    cta: 'Start Free Trial',
    badge: 'Most Popular',
    features: [
      '100 GB storage',
      'Up to 25 users',
      'Unlimited documents',
      'Advanced OCR + AI indexing',
      'Full-text search with filters',
      'Groups & permission management',
      'Document sharing with access control',
      'Audit logs (90 days)',
      'Priority email & chat support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'For large institutions, government agencies, and organisations with custom requirements.',
    color: '#0B1D2E',
    highlighted: false,
    cta: 'Contact Sales',
    features: [
      'Unlimited storage',
      'Unlimited users',
      'Unlimited documents',
      'Full OCR + AI suite',
      'Custom integrations & API access',
      'Single Sign-On (SSO)',
      'Advanced RBAC & policy engine',
      'Unlimited audit logs',
      'Dedicated account manager',
      'On-premises deployment option',
      'SLA 99.9% uptime guarantee',
    ],
  },
];

const faq = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can upgrade or downgrade at any time. Changes take effect immediately and are prorated.',
  },
  {
    q: 'Is there a free trial for Professional?',
    a: 'Yes — the Professional plan comes with a 14-day free trial, no credit card required.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept MTN Mobile Money, Airtel Money, Visa/Mastercard, and bank transfer for annual plans.',
  },
  {
    q: 'Do you offer discounts for NGOs or government entities?',
    a: 'Yes. Contact our sales team for special pricing available to registered NGOs, government bodies, and educational institutions.',
  },
];

const Pricing: React.FC = () => {
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
            label="Pricing"
            sx={{ bgcolor: alpha('#FF7A21', 0.25), color: '#FF9C4E', fontWeight: 700, mb: 3, px: 1 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7 }}>
            Start free. Upgrade when your organisation grows.
            No hidden fees, no surprises.
          </Typography>
        </Container>
      </Box>

      {/* Plans */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="stretch">
            {plans.map((plan) => (
              <Grid size={{ xs: 12, md: 4 }} key={plan.name}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.highlighted ? `2px solid ${plan.color}` : '1px solid',
                    borderColor: plan.highlighted ? plan.color : 'divider',
                    boxShadow: plan.highlighted ? `0 8px 40px ${alpha(plan.color, 0.2)}` : undefined,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  {plan.badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: plan.color,
                        color: 'white',
                        px: 1.5,
                        py: 0.3,
                        borderRadius: 10,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}
                    >
                      {plan.badge}
                    </Box>
                  )}
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {plan.name}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h3"
                        component="span"
                        sx={{ fontWeight: 800, color: plan.color }}
                      >
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                        {plan.period}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                      {plan.description}
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Stack spacing={1.5} sx={{ flex: 1, mb: 4 }}>
                      {plan.features.map((f) => (
                        <Stack key={f} direction="row" spacing={1} alignItems="flex-start">
                          <CheckIcon sx={{ color: plan.color, fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {f}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Button
                      fullWidth
                      size="large"
                      variant={plan.highlighted ? 'contained' : 'outlined'}
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => plan.name === 'Enterprise' ? navigate('/contact') : navigate('/register')}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        ...(plan.highlighted && {
                          bgcolor: plan.color,
                          '&:hover': { bgcolor: '#CC611A' },
                        }),
                        ...(!plan.highlighted && {
                          borderColor: plan.color,
                          color: plan.color,
                          '&:hover': { borderColor: plan.color, bgcolor: alpha(plan.color, 0.05) },
                        }),
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Box sx={{ bgcolor: '#F2F4F7', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 6 }}>
            Frequently Asked Questions
          </Typography>
          <Stack spacing={3}>
            {faq.map((item) => (
              <Card key={item.q}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.q}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {item.a}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Pricing;
