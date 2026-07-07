import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  console.log(`[EMAIL] Configuring SMTP: host=${host}, port=${port}, user=${user ? user.substring(0,4) + '***' : '(empty)'}, pass=${pass ? '****set' : '(empty)'}`);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

const transporter = createTransporter();

// Verify on startup
transporter.verify().then(() => {
  console.log('[EMAIL] SMTP connection verified — ready to send');
}).catch((err) => {
  console.error('[EMAIL] SMTP verification failed:', err.message);
  console.error('[EMAIL] Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars');
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
        <p style="color: #374151;">You requested a password reset. Use the token below to reset your password:</p>
        <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280;">Your Reset Token</p>
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #16a34a; letter-spacing: 1px; word-break: break-all;">${token}</p>
        </div>
        <p style="color: #374151; font-size: 14px;">Copy this token, go back to the app, and paste it into the <strong>Reset Password</strong> form along with your new password.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">Powered by Dabisoft IT Solutions</p>
      </div>
    `,
  });

  console.log(`[EMAIL] Sent successfully: messageId=${info.messageId}`);
}
