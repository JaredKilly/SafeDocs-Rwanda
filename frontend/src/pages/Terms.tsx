import React from 'react';
import { Box, Container, Typography, Chip, Stack, Divider, alpha } from '@mui/material';
import MarketingLayout from '../components/MarketingLayout';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using SafeDocs Rwanda ("the Service"), you agree to these Terms of Service. If you do not agree, do not use the Service. These terms constitute a legally binding agreement between you and Bobaat Ltd.',
  },
  {
    title: '2. Description of Service',
    body: 'SafeDocs Rwanda is a cloud-based document management platform that allows organisations and individuals to upload, store, organise, scan, search, and share digital documents. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice.',
  },
  {
    title: '3. Account Registration',
    body: 'You must provide accurate, complete, and current information when registering. You are responsible for maintaining the confidentiality of your password and for all activity under your account. You must notify us immediately at security@safedocsrwanda.rw if you suspect unauthorised access.',
  },
  {
    title: '4. Acceptable Use',
    body: 'You agree not to: (a) upload content that is illegal, fraudulent, defamatory, or infringes third-party rights; (b) attempt to reverse-engineer, decompile, or disrupt the Service; (c) use the Service to distribute malware or conduct phishing; (d) share your account credentials with third parties; (e) circumvent any security or access-control features.',
  },
  {
    title: '5. Your Content',
    body: 'You retain ownership of all documents and data you upload. By uploading content, you grant SafeDocs Rwanda a limited, non-exclusive licence to store, process, and display your content solely to provide the Service. We do not claim any ownership of your documents.',
  },
  {
    title: '6. Data Security & Privacy',
    body: 'We take reasonable technical and organisational measures to protect your data. Our full practices are described in the Privacy Policy. While we strive for the highest security standards, no internet transmission is 100% secure and we cannot guarantee absolute security.',
  },
  {
    title: '7. Service Availability',
    body: 'We aim for 99.9% uptime but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, upgrades, or circumstances beyond our control. We will endeavour to give advance notice of planned downtime.',
  },
  {
    title: '8. Intellectual Property',
    body: 'The SafeDocs Rwanda platform, including its software, design, trademarks, and documentation, is the intellectual property of Bobaat Ltd. You may not copy, modify, distribute, or create derivative works without our written permission.',
  },
  {
    title: '9. Subscriptions & Payments',
    body: 'Paid plans are billed in advance on a monthly or annual basis in Rwandan Francs (RWF). Fees are non-refundable except where required by law. We reserve the right to change pricing with 30 days\' written notice. Non-payment may result in suspension of access.',
  },
  {
    title: '10. Termination',
    body: 'You may delete your account at any time. We may terminate or suspend your account for breach of these terms, non-payment, or for legal compliance reasons. Upon termination, your data will be deleted in accordance with our Privacy Policy.',
  },
  {
    title: '11. Limitation of Liability',
    body: 'To the maximum extent permitted by Rwandan law, Bobaat Ltd shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the Service. Our total aggregate liability shall not exceed the fees paid by you in the 12 months preceding the claim.',
  },
  {
    title: '12. Governing Law',
    body: 'These terms are governed by the laws of the Republic of Rwanda. Any disputes shall be subject to the exclusive jurisdiction of the courts of Rwanda. For disputes below RWF 5,000,000, we encourage resolution through our support team before initiating legal proceedings.',
  },
  {
    title: '13. Changes to Terms',
    body: 'We may update these terms at any time. We will notify you by email and in-app notification at least 14 days before material changes take effect. Continued use of the Service after that date constitutes acceptance.',
  },
  {
    title: '14. Contact',
    body: 'For questions about these terms, contact us at legal@safedocsrwanda.rw or Bobaat Ltd, KG 7 Ave, Kigali, Rwanda.',
  },
];

const Terms: React.FC = () => {
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
            Terms of Service
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Last updated: 1 February 2026
          </Typography>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, mb: 5 }}>
            Please read these Terms of Service carefully before using SafeDocs Rwanda. They set out your
            rights and responsibilities and ours. If you have any questions, contact us at{' '}
            <strong>legal@safedocsrwanda.rw</strong>.
          </Typography>

          <Stack spacing={5}>
            {sections.map((s, i) => (
              <Box key={i}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                  {s.body}
                </Typography>
                {i < sections.length - 1 && <Divider sx={{ mt: 4 }} />}
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>
    </MarketingLayout>
  );
};

export default Terms;
