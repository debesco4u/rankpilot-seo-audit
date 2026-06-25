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

// Audit
app.post('/api/audit', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const userId = (req as any).userId;
    const user = db.prepare('SELECT tier FROM users WHERE id = ?').get(userId) as any;

    // Rate limit for free tier
    if (user.tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const count = db.prepare('SELECT count FROM audit_counts WHERE user_id = ? AND date = ?').get(userId, today) as any;
      if (count && count.count >= 5) {
        return res.status(429).json({ error: 'Free tier limit: 5 audits per day. Upgrade for unlimited.' });
      }
      db.prepare('INSERT INTO audit_counts (user_id, date, count) VALUES (?, ?, 1) ON CONFLICT(user_id, date) DO UPDATE SET count = count + 1').run(userId, today);
    }

    const result = await auditSite(url);

    // Save to history
    db.prepare('INSERT INTO audits (user_id, domain, data, score, pages) VALUES (?, ?, ?, ?, ?)')
      .run(userId, result.domain, JSON.stringify(result), result.overallScore, result.pages.length);

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

// PDF endpoint (simple - generates a text-based report)
app.get('/api/pdf/:domain', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const user = db.prepare('SELECT tier FROM users WHERE id = ?').get(userId) as any;
  if (user.tier === 'free') return res.status(403).json({ error: 'PDF download requires DIY SEO or White Label plan' });

  const audit = db.prepare(
    'SELECT data FROM audits WHERE user_id = ? AND domain LIKE ? ORDER BY created_at DESC LIMIT 1'
  ).get(userId, `%${req.params.domain}%`) as any;
  if (!audit) return res.status(404).json({ error: 'No audit found for this domain' });

  // Return the audit data - client generates PDF
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
  console.log(`🚀 RankPilot server running on port ${PORT}`);
});
