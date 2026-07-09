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

// Audit — requires login, enforces free tier limit
app.post('/api/audit', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const userId = (req as any).userId;
    const user = db.prepare('SELECT tier FROM users WHERE id = ?').get(userId) as any;
    const tier = user?.tier || 'free';

    // Free tier: 5 audits per day
    if (tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const row = db.prepare('SELECT count FROM audit_counts WHERE user_id = ? AND date = ?').get(String(userId), today) as any;
      const used = row ? row.count : 0;
      if (used >= 5) {
        return res.status(429).json({
          error: 'You have used all 5 free audits for today. Upgrade to DIY SEO or White Label for unlimited audits.',
          remaining: 0,
        });
      }
      db.prepare('INSERT INTO audit_counts (user_id, date, count) VALUES (?, ?, 1) ON CONFLICT(user_id, date) DO UPDATE SET count = count + 1')
        .run(String(userId), today);
    }

    const result = await auditSite(url);

    // Save to history
    db.prepare('INSERT INTO audits (user_id, domain, data, score, pages) VALUES (?, ?, ?, ?, ?)')
      .run(userId, result.domain, JSON.stringify(result), result.overallScore, result.pages.length);

    // Return remaining for free tier
    let remaining: number | null = null;
    if (tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const row = db.prepare('SELECT count FROM audit_counts WHERE user_id = ? AND date = ?').get(String(userId), today) as any;
      remaining = Math.max(0, 5 - (row ? row.count : 0));
    }

    res.json({ ...result, remaining });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check remaining audits
app.get('/api/audit/remaining', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const user = db.prepare('SELECT tier FROM users WHERE id = ?').get(userId) as any;
  const tier = user?.tier || 'free';
  if (tier !== 'free') return res.json({ remaining: null, tier });
  const today = new Date().toISOString().split('T')[0];
  const row = db.prepare('SELECT count FROM audit_counts WHERE user_id = ? AND date = ?').get(String(userId), today) as any;
  res.json({ remaining: Math.max(0, 5 - (row ? row.count : 0)), tier });
});

// Audit history
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

// PDF (paid tiers only)
app.get('/api/pdf/:domain', authMiddleware, (req, res) => {
  const uid = (req as any).userId;
  const user = db.prepare('SELECT tier FROM users WHERE id = ?').get(uid) as any;
  if (!user || user.tier === 'free') return res.status(403).json({ error: 'PDF download requires DIY SEO or White Label plan' });
  const audit = db.prepare(
    'SELECT data FROM audits WHERE user_id = ? AND domain LIKE ? ORDER BY created_at DESC LIMIT 1'
  ).get(uid, `%${req.params.domain}%`) as any;
  if (!audit) return res.status(404).json({ error: 'No audit found' });
  res.json(JSON.parse(audit.data));
});

// Static files
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SEO Audit Tool server running on port ${PORT}`);
});
