import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { optionalAuth, AuthRequest } from '../middleware';
import { crawlSite } from '../utils/crawler';
import { analyzeSite } from '../utils/analyzer';
import { generatePdf } from '../utils/pdf';

const router = Router();

router.post('/run', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    const db = getDb();
    const plan = req.userPlan || 'free';
    const userKey = req.userId || req.ip || 'anon';
    const today = new Date().toISOString().slice(0, 10);

    if (plan === 'free') {
      const usage = db.prepare('SELECT count FROM daily_usage WHERE user_key = ? AND date = ?').get(userKey, today) as any;
      if (usage && usage.count >= 5) return res.status(429).json({ error: 'Free tier: 5 audits/day. Upgrade for unlimited!' });
      db.prepare('INSERT INTO daily_usage (user_key, date, count) VALUES (?, ?, 1) ON CONFLICT(user_key, date) DO UPDATE SET count = count + 1').run(userKey, today);
    }

    const maxPages = plan === 'free' ? 10 : 30;
    const pages = await crawlSite(url, maxPages);
    const audit = analyzeSite(pages, url);
    const auditId = uuid();
    db.prepare('INSERT INTO audits (id, user_id, url, score, results) VALUES (?,?,?,?,?)').run(auditId, req.userId || null, url, audit.overallScore, JSON.stringify(audit));

    if (plan === 'free') {
      audit.pages = audit.pages.slice(0, 3);
      audit.pages.forEach(p => { p.issues = p.issues.map(i => ({ ...i, fix: undefined })); });
      audit.topKeywords = audit.topKeywords.slice(0, 5);
    }
    res.json({ id: auditId, audit, plan });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/pdf/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const audit = db.prepare('SELECT * FROM audits WHERE id = ?').get(req.params.id) as any;
    if (!audit) return res.status(404).json({ error: 'Audit not found' });
    const results = JSON.parse(audit.results);
    const plan = req.userPlan || 'free';
    const removeBranding = plan === 'whitelabel';
    const pdf = generatePdf(results, plan, removeBranding);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="seo-audit-report.pdf"');
    res.send(pdf);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/history', optionalAuth, (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.json({ audits: [] });
  const db = getDb();
  const audits = db.prepare('SELECT id, url, score, created_at FROM audits WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.userId);
  res.json({ audits });
});

router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const audit = db.prepare('SELECT * FROM audits WHERE id = ?').get(req.params.id) as any;
  if (!audit) return res.status(404).json({ error: 'Audit not found' });
  const results = JSON.parse(audit.results);
  const plan = req.userPlan || 'free';
  if (plan === 'free') {
    results.pages = results.pages.slice(0, 3);
    results.pages.forEach((p: any) => { p.issues = p.issues.map((i: any) => ({ ...i, fix: undefined })); });
    results.topKeywords = results.topKeywords.slice(0, 5);
  }
  res.json({ id: audit.id, audit: results, plan });
});

export default router;
