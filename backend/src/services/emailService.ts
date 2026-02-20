import nodemailer, { Transporter } from 'nodemailer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShareNotificationData {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  documentTitle: string;
  accessLevel: string;
  appUrl: string;
  expiresAt?: string;
}

interface ShareLinkData {
  recipientEmail: string;
  senderName: string;
  documentTitle: string;
  shareUrl: string;
  expiresAt?: string;
  allowDownload: boolean;
}

interface AccessRequestData {
  ownerEmail: string;
  ownerName?: string;
  requesterName: string;
  documentTitle: string;
  requestedAccess: string;
  message?: string;
  appUrl: string;
}

interface AccessRequestResponseData {
  requesterEmail: string;
  requesterName?: string;
  documentTitle: string;
  status: 'approved' | 'denied';
  responseMessage?: string;
  appUrl: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DEV_MODE = !process.env.SMTP_HOST;

const getTransporter = (): Transporter | null => {
  if (DEV_MODE) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const FROM = process.env.SMTP_FROM || 'SafeDocs Rwanda <noreply@safedocs.rw>';

// ─── Send helper ─────────────────────────────────────────────────────────────

const send = async (to: string, subject: string, html: string): Promise<void> => {
  if (DEV_MODE) {
    console.log('\n📧 [EmailService] DEV MODE — email not sent, logging instead:');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body preview: ${html.replace(/<[^>]+>/g, ' ').slice(0, 200).trim()}\n`);
    return;
  }
  const transporter = getTransporter()!;
  await transporter.sendMail({ from: FROM, to, subject, html });
};

// ─── Common styles ────────────────────────────────────────────────────────────

const wrap = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4F8;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#007BFF,#1F9CEF);padding:28px 32px;">
          <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;">SafeDocs Rwanda</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Secure Document Management</p>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr><td style="background:#F8F9FA;padding:16px 32px;border-top:1px solid #E0E0E0;">
          <p style="margin:0;color:#9E9E9E;font-size:12px;text-align:center;">
            © ${new Date().getFullYear()} SafeDocs Rwanda · You received this because an action was taken on your account.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#007BFF;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;margin-top:20px;">${label}</a>`;

// ─── Templates ────────────────────────────────────────────────────────────────

export const sendShareNotification = async (data: ShareNotificationData): Promise<void> => {
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1A1A2E;font-size:18px;">Document shared with you</h2>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      <strong>${data.senderName}</strong> has shared a document with you.
    </p>
    <table width="100%" style="background:#F8F9FA;border-radius:8px;padding:16px;margin-bottom:16px;" cellpadding="0" cellspacing="0">
      <tr><td>
        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Document</p>
        <p style="margin:0;font-weight:700;color:#1A1A2E;font-size:16px;">${data.documentTitle}</p>
      </td></tr>
      <tr><td style="padding-top:12px;">
        <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Your access</p>
        <span style="background:#E3F2FD;color:#007BFF;padding:3px 10px;border-radius:12px;font-size:13px;font-weight:600;">${data.accessLevel}</span>
      </td></tr>
      ${data.expiresAt ? `<tr><td style="padding-top:12px;"><p style="margin:0;color:#888;font-size:12px;">Expires: ${new Date(data.expiresAt).toLocaleDateString()}</p></td></tr>` : ''}
    </table>
    ${btn(data.appUrl, 'Open SafeDocs →')}
  `);
  await send(data.recipientEmail, `${data.senderName} shared "${data.documentTitle}" with you`, html);
};

export const sendShareLink = async (data: ShareLinkData): Promise<void> => {
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1A1A2E;font-size:18px;">You have a document link</h2>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      <strong>${data.senderName}</strong> shared a link to <strong>${data.documentTitle}</strong>.
    </p>
    <table width="100%" style="background:#F8F9FA;border-radius:8px;padding:16px;margin-bottom:16px;" cellpadding="0" cellspacing="0">
      <tr><td>
        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Document</p>
        <p style="margin:0;font-weight:700;color:#1A1A2E;font-size:16px;">${data.documentTitle}</p>
      </td></tr>
      <tr><td style="padding-top:12px;">
        <p style="margin:0 0 4px;color:#888;font-size:12px;">Download allowed: ${data.allowDownload ? 'Yes' : 'No'}</p>
        ${data.expiresAt ? `<p style="margin:4px 0 0;color:#888;font-size:12px;">Expires: ${new Date(data.expiresAt).toLocaleDateString()}</p>` : ''}
      </td></tr>
    </table>
    ${btn(data.shareUrl, 'View Document →')}
    <p style="color:#9E9E9E;font-size:12px;margin-top:16px;">Or copy this link: <a href="${data.shareUrl}" style="color:#007BFF;">${data.shareUrl}</a></p>
  `);
  await send(data.recipientEmail, `${data.senderName} shared a document with you`, html);
};

export const sendAccessRequestNotification = async (data: AccessRequestData): Promise<void> => {
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1A1A2E;font-size:18px;">New access request</h2>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      <strong>${data.requesterName}</strong> is requesting access to one of your documents.
    </p>
    <table width="100%" style="background:#F8F9FA;border-radius:8px;padding:16px;margin-bottom:16px;" cellpadding="0" cellspacing="0">
      <tr><td>
        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Document</p>
        <p style="margin:0;font-weight:700;color:#1A1A2E;font-size:16px;">${data.documentTitle}</p>
      </td></tr>
      <tr><td style="padding-top:12px;">
        <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Requested access</p>
        <span style="background:#FFF3E0;color:#E65100;padding:3px 10px;border-radius:12px;font-size:13px;font-weight:600;">${data.requestedAccess}</span>
      </td></tr>
      ${data.message ? `<tr><td style="padding-top:12px;"><p style="margin:0;color:#555;font-size:13px;font-style:italic;">"${data.message}"</p></td></tr>` : ''}
    </table>
    ${btn(`${data.appUrl}/access-requests`, 'Review Request →')}
  `);
  await send(data.ownerEmail, `${data.requesterName} requested access to "${data.documentTitle}"`, html);
};

export const sendAccessRequestResponse = async (data: AccessRequestResponseData): Promise<void> => {
  const approved = data.status === 'approved';
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1A1A2E;font-size:18px;">
      Access request ${approved ? 'approved ✓' : 'denied'}
    </h2>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      Your request for access to <strong>${data.documentTitle}</strong> has been
      <strong style="color:${approved ? '#2E7D32' : '#C62828'};">${data.status}</strong>.
    </p>
    ${data.responseMessage ? `
    <table width="100%" style="background:#F8F9FA;border-radius:8px;padding:16px;margin-bottom:16px;" cellpadding="0" cellspacing="0">
      <tr><td><p style="margin:0;color:#555;font-size:13px;font-style:italic;">"${data.responseMessage}"</p></td></tr>
    </table>` : ''}
    ${approved ? btn(data.appUrl, 'Open SafeDocs →') : ''}
  `);
  const subject = approved
    ? `Access approved: "${data.documentTitle}"`
    : `Access request declined: "${data.documentTitle}"`;
  await send(data.requesterEmail, subject, html);
};

// ─── OTP Verification Email ───────────────────────────────────────────────────

export const sendOtpEmail = async (
  email: string,
  name: string | undefined,
  otp: string
): Promise<void> => {
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#0B1D2E;font-size:20px;">Verify your email address</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;">
      Hi ${name || 'there'}, thanks for registering with SafeDocs Rwanda.<br/>
      Enter the code below to activate your account:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background:#F0F4FF;border:2px solid #007BFF;border-radius:12px;padding:20px 40px;">
            <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#0B1D2E;">${otp}</span>
          </div>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#888;font-size:13px;text-align:center;">
      This code expires in <strong>15 minutes</strong>. Do not share it with anyone.
    </p>
  `);
  await send(email, 'Your SafeDocs verification code', html);
};
