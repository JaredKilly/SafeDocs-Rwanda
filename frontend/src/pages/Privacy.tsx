import React from 'react';
import { Box, Container, Typography, Chip, Stack, Divider, alpha } from '@mui/material';
import MarketingLayout from '../components/MarketingLayout';

interface Section {
  title: string;
  body: React.ReactNode;
}

const sections: Section[] = [
  {
    title: '1. Who We Are',
    body: (
      <>
        SafeDocs Rwanda ("we", "our", "us") is a document management platform operated by Bobaat Ltd,
        a company registered in Rwanda. Our registered address is KG 7 Ave, Kigali, Rwanda.
        You can reach our Data Protection Officer at <strong>dpo@safedocsrwanda.rw</strong>.
      </>
    ),
  },
  {
    title: '2. What Data We Collect',
    body: (
      <Stack component="ul" spacing={1} sx={{ pl: 2.5, mt: 0 }}>
        {[
          'Account information: name, email address, username, and password (hashed).',
          'Documents you upload: file contents, metadata, and OCR-extracted text.',
          'Usage data: pages visited, actions taken, timestamps, and IP addresses.',
          'Device information: browser type, operating system, and screen resolution.',
          'Communications: messages sent to our support team.',
        ].map((item) => (
          <Typography component="li" variant="body2" key={item} sx={{ lineHeight: 1.8 }}>
            {item}
          </Typography>
        ))}
      </Stack>
    ),
  },
  {
    title: '3. How We Use Your Data',
    body: (
      <Stack component="ul" spacing={1} sx={{ pl: 2.5, mt: 0 }}>
        {[
          'To provide and improve the SafeDocs Rwanda service.',
          'To authenticate you and protect your account.',
          'To process documents, run OCR, and enable search.',
          'To send transactional emails (password resets, sharing notifications).',
          'To generate audit logs required for your organisation\'s compliance needs.',
          'To analyse usage patterns and improve the product.',
        ].map((item) => (
          <Typography component="li" variant="body2" key={item} sx={{ lineHeight: 1.8 }}>
            {item}
          </Typography>
        ))}
      </Stack>
    ),
  },
  {
    title: '4. Legal Basis for Processing',
    body: (
      <>
        We process your personal data under the following legal bases: (a) <strong>Contract</strong> — processing
        necessary to deliver the service you signed up for; (b) <strong>Legitimate interests</strong> — security
        monitoring, fraud prevention, and product improvement; (c) <strong>Legal obligation</strong> — where
        required by Rwandan law or regulation; (d) <strong>Consent</strong> — for optional marketing communications.
      </>
    ),
  },
  {
    title: '5. Data Sharing',
    body: (
      <>
        We do not sell your personal data. We share data only with:
        <Stack component="ul" spacing={1} sx={{ pl: 2.5, mt: 1 }}>
          {[
            'Cloud infrastructure providers (storage, compute) under data processing agreements.',
            'Analytics providers — only aggregated, anonymised data.',
            'Law enforcement or regulatory bodies when required by applicable Rwandan law.',
            'Successor entities in the event of a merger or acquisition (with notice to you).',
          ].map((item) => (
            <Typography component="li" variant="body2" key={item} sx={{ lineHeight: 1.8 }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </>
    ),
  },
  {
    title: '6. Data Retention',
    body: (
      <>
        We retain your data for as long as your account is active. After account deletion, we delete
        personal data within 30 days, except where retention is required by law (e.g., financial records
        for 7 years). Backup copies are purged within 90 days.
      </>
    ),
  },
  {
    title: '7. Your Rights',
    body: (
      <>
        Under the Rwanda Data Protection Law and GDPR (where applicable), you have the right to:
        access, correct, delete, or export your data; restrict or object to processing;
        withdraw consent at any time; and lodge a complaint with the National Cyber Security Authority (NCSA).
        To exercise these rights, email <strong>privacy@safedocsrwanda.rw</strong>.
      </>
    ),
  },
  {
    title: '8. Security',
    body: (
      <>
        We use AES-256 encryption at rest, TLS 1.3 in transit, and conduct regular security audits.
        See our <a href="/security">Security page</a> for full details.
      </>
    ),
  },
  {
    title: '9. Changes to This Policy',
    body: (
      <>
        We may update this policy periodically. We will notify you by email and in-app notification
        at least 14 days before material changes take effect. Continued use of the service after
        that date constitutes acceptance of the updated policy.
      </>
    ),
  },
  {
    title: '10. Contact',
    body: (
      <>
        Questions about this policy? Contact our Data Protection Officer at <strong>dpo@safedocsrwanda.rw</strong> or write to
        us at Bobaat Ltd, KG 7 Ave, Kigali, Rwanda.
      </>
    ),
  },
];

const Privacy: React.FC = () => {
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
            Privacy Policy
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Last updated: 1 February 2026
          </Typography>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, mb: 5 }}>
            This Privacy Policy explains how SafeDocs Rwanda collects, uses, and protects your personal
            data when you use our platform. We are committed to handling your information with transparency
            and in accordance with the Rwanda Data Protection Law (Law No. 058/2021) and applicable international standards.
          </Typography>

          <Stack spacing={5}>
            {sections.map((s, i) => (
              <Box key={i}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.9 }}>
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

export default Privacy;
