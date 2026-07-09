import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  console.log(`[EMAIL] Configuring SMTP: host=${host}, port=${port}, secure=true, user=${user ? user.substring(0,4) + '***' : '(empty)'}, pass=${pass ? '****set' : '(empty)'}`);

  return nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

let transporter = createTransporter();

transporter.verify().then(() => {
  console.log('[EMAIL] SMTP connection verified on port 465 — ready to send');
}).catch((err) => {
  console.error('[EMAIL] Port 465 failed:', err.message, '— trying port 587 STARTTLS...');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
  transporter.verify().then(() => {
    console.log('[EMAIL] SMTP connection verified on port 587 — ready to send');
  }).catch((err2) => {
    console.error('[EMAIL] Port 587 also failed:', err2.message);
    console.error('[EMAIL] Both SMTP ports blocked. Consider using an email API service (SendGrid, Resend, etc.)');
  });
});

export async function sendResetEmail(to: string, token: string): Promise<void> {
  const fromName = process.env.SMTP_FROM_NAME || 'SEO Audit Tool';
  const fromEmail = process.env.SMTP_USER || 'noreply@example.com';
  console.log(`[EMAIL] Sending reset email to ${to}...`);
  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Password Reset - SEO Audit Tool',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #16a34a; margin: 0;">SEO Audit Tool</h2>
          <p style="color: #6b7280; font-size: 14px;">Password Reset Request</p>
        </div>
        <p style="color: #374151;">You requested a password reset. Use the token below:</p>
        <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280;">Your Reset Token</p>
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #16a34a; letter-spacing: 1px; word-break: break-all;">${token}</p>
        </div>
        <p style="color: #374151; font-size: 14px;">Copy this token, go back to the app, and paste it into the <strong>Reset Password</strong> form with your new password.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you didn't request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">Powered by Dabisoft IT Solutions</p>
      </div>
    `,
  });
  console.log(`[EMAIL] Sent successfully: messageId=${info.messageId}`);
}
