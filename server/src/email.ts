import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST || 'mail.privateemail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  if (!user || !pass) { console.warn('[EMAIL] SMTP credentials not set'); return null; }
  const useSSL = port === 465;
  const transporter = nodemailer.createTransport({
    host, port, secure: useSSL,
    auth: { user, pass },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    ...(useSSL ? {} : { tls: { rejectUnauthorized: false } }),
  });
  console.log(`[EMAIL] Configured: ${host}:${port} (${useSSL ? 'SSL' : 'STARTTLS'}) as ${user}`);
  transporter.verify()
    .then(() => console.log('[EMAIL] ✅ SMTP connection verified'))
    .catch((err: any) => console.error('[EMAIL] SMTP verify failed:', err.message));
  return transporter;
}

let transporter: nodemailer.Transporter | null = null;
function getTransporter() { if (!transporter) transporter = createTransporter(); return transporter; }

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) { console.error('[EMAIL] No transporter'); return false; }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com';
  try {
    const info = await t.sendMail({ from, to, subject, html });
    console.log(`[EMAIL] ✅ Sent to ${to}: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error(`[EMAIL] ❌ Failed:`, err.message);
    return false;
  }
}

export async function sendPasswordResetToSupport(userEmail: string, token: string): Promise<boolean> {
  const supportEmail = 'seo@dabisoftsolutions.com';
  const appUrl = process.env.APP_URL || 'https://seo-audit-tool.onrender.com';
  const resetLink = `${appUrl}/reset-password?token=${token}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#16a34a;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">SEO Audit Tool — Password Reset</h1>
      </div>
      <div style="background:#f9f9f9;padding:30px;border:1px solid #e0e0e0;">
        <h2 style="color:#333;margin-top:0;">Password Reset Request</h2>
        <p style="color:#555;">A user has requested a password reset. Please forward the reset link to them.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:8px;font-weight:bold;color:#333;border-bottom:1px solid #e0e0e0;">User Email:</td><td style="padding:8px;color:#555;border-bottom:1px solid #e0e0e0;">${userEmail}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#333;border-bottom:1px solid #e0e0e0;">Token:</td><td style="padding:8px;color:#555;border-bottom:1px solid #e0e0e0;word-break:break-all;">${token}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#333;">Expires:</td><td style="padding:8px;color:#555;">1 hour from request</td></tr>
        </table>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetLink}" style="background:#16a34a;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Reset Link</a>
        </div>
        <p style="color:#888;font-size:13px;">Send the above link to <strong>${userEmail}</strong> so they can reset their password.</p>
      </div>
      <div style="background:#f0f0f0;padding:15px;text-align:center;border-radius:0 0 8px 8px;">
        <p style="color:#999;font-size:12px;margin:0;">Powered by Dabisoft IT Solutions</p>
      </div>
    </div>`;
  return sendEmail(supportEmail, `Password Reset Request for ${userEmail}`, html);
}
