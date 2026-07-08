import express from 'express';
import path from 'path';
import cors from 'cors';
import authRouter, { authMiddleware } from './auth';
import { auditSite } from './auditor';
import db from './db';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRouter);

// Subscribe
app.post('/api/subscribe', authMiddleware, (req, res) => {
  const { tier } = req.body;
  if (!['free', 'diy', 'whitelabel'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }
  db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, (req as any).userId);
  const user = db.prepare('SELECT id, email, name, tier FROM users WHERE id = ?').get((req as any).userId);
  res.json(user);
});

// Helper: extract userId and tier from auth header (returns null if not authenticated)
function extractAuth(req: express.Request): { userId: number | null; userTier: string } {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET || 'dev-secret') as any;
      const userId = decoded.id;
      const u = db.prepare('SELECT tier FROM users WHERE id=?').get(userId) as any;
      if (u) return { userId, userTier: u.tier };
    } catch {}
  }
  return { userId: null, userTier: 'free' };
}

// Audit — works with or without auth
app.post('/api/audit', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const { userId, userTier } = extractAuth(req);

    // Rate limit for free tier
    if (userTier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const limitKey = userId ? String(userId) : ('ip_' + (req.ip || 'unknown'));
      const count = db.prepare('SELECT count FROM audit_counts WHERE user_id = ? AND date = ?').get(limitKey, today) as any;
      if (count && count.count >= 5) {
        return res.status(429).json({ error: 'Free tier limit: 5 audits per day. Upgrade for unlimited.' });
      }
      db.prepare('INSERT INTO audit_counts (user_id, date, count) VALUES (?, ?, 1) ON CONFLICT(user_id, date) DO UPDATE SET count = count + 1').run(limitKey, today);
    }

    const result = await auditSite(url);

    // Save to history only if logged in
    if (userId) {
      db.prepare('INSERT INTO audits (user_id, domain, data, score, pages) VALUES (?, ?, ?, ?, ?)')
        .run(userId, result.domain, JSON.stringify(result), result.overallScore, result.pages.length);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Audit history (requires auth)
app.get('/api/history', authMiddleware, (req, res) => {
  const audits = db.prepare(
    'SELECT id, domain, score, pages, created_at as timestamp FROM audits WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all((req as any).userId);
  res.json(audits);
});

app.get('/api/history/:id', authMiddleware, (req, res) => {
  const audit = db.prepare(
    'SELECT * FROM audits WHERE id = ? AND user_id = ?'
  ).get(req.params.id, (req as any).userId) as any;
  if (!audit) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(audit.data));
});

// PDF endpoint (requires auth + paid tier)
app.get('/api/pdf/:domain', authMiddleware, (req, res) => {
  const uid = (req as any).userId;
  const user = db.prepare('SELECT tier FROM users WHERE id = ?').get(uid) as any;
  if (!user || user.tier === 'free') return res.status(403).json({ error: 'PDF download requires DIY SEO or White Label plan' });

  const audit = db.prepare(
    'SELECT data FROM audits WHERE user_id = ? AND domain LIKE ? ORDER BY created_at DESC LIMIT 1'
  ).get(uid, `%${req.params.domain}%`) as any;
  if (!audit) return res.status(404).json({ error: 'No audit found for this domain' });

  res.json(JSON.parse(audit.data));
});

// Serve static client files
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SEO Audit Tool server running on port ${PORT}`);
});
