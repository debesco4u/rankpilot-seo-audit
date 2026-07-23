// Email via Resend HTTP API — no SMTP needed, works on Render
// Env var: RESEND_API_KEY
// Free tier: 100 emails/day, sends from onboarding@resend.dev

const RESEND_API_URL = 'https://api.resend.com/emails';

function getApiKey(): string | null {
  const key = process.env.RESEND_API_KEY || '';
  if (!key) {
    console.warn('[EMAIL] RESEND_API_KEY not set — emails disabled');
    return null;
  }
  console.log('[EMAIL] ✅ Resend API configured');
  return key;
}

let apiKey: string | null | undefined = undefined;
function ensureKey(): string | null {
  if (apiKey === undefined) apiKey = getApiKey();
  return apiKey;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = ensureKey();
  if (!key) { console.error('[EMAIL] No API key'); return false; }

  const from = process.env.EMAIL_FROM || 'SEO Audit Tool <onboarding@resend.dev>';

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[EMAIL] ✅ Sent to ${to}: ${data.id}`);
      return true;
    } else {
      const err = await res.text();
      console.error(`[EMAIL] ❌ Resend error (${res.status}):`, err);
      return false;
    }
  } catch (err: any) {
    console.error(`[EMAIL] ❌ Failed:`, err.message);
    return false;
  }
}

export async function sendPasswordResetToUser(userEmail: string, token: string): Promise<boolean> {
  const appUrl = process.env.APP_URL || 'https://seo-audit-tool.onrender.com';
  const resetLink = `${appUrl}/reset-password?token=${token}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#16a34a;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">🔒 Password Reset</h1>
      </div>
      <div style="background:#f9f9f9;padding:30px;border:1px solid #e0e0e0;">
        <h2 style="color:#333;margin-top:0;">Hi there!</h2>
        <p style="color:#555;">We received a request to reset your password for the SEO Audit Tool. Click the button below to set a new password:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetLink}" style="background:#16a34a;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;font-size:16px;">Reset My Password</a>
        </div>
        <p style="color:#888;font-size:13px;">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;" />
        <p style="color:#999;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color:#16a34a;font-size:12px;word-break:break-all;">${resetLink}</p>
      </div>
      <div style="background:#f0f0f0;padding:15px;text-align:center;border-radius:0 0 8px 8px;">
        <p style="color:#999;font-size:12px;margin:0;">Need help? Contact <a href="mailto:seo@dabisoftsolutions.com" style="color:#16a34a;">seo@dabisoftsolutions.com</a></p>
        <p style="color:#bbb;font-size:11px;margin:5px 0 0;">Powered by Dabisoft IT Solutions</p>
      </div>
    </div>`;
  return sendEmail(userEmail, 'Reset Your Password — SEO Audit Tool', html);
}
