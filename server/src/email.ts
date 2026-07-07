import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendResetEmail(to: string, token: string): Promise<void> {
  const fromName = process.env.SMTP_FROM_NAME || 'SEO Audit Tool';
  const fromEmail = process.env.SMTP_USER || 'noreply@example.com';

  await transporter.sendMail({
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
}
