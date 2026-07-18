import { Router, Response } from 'express';
import db from './db';
import { AuthRequest, authMiddleware } from './middleware';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const sub: any = db.prepare('SELECT plan, status, expires_at FROM subscriptions WHERE user_id = ?').get(req.userId!);
  const user: any = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.userId!);
  res.json({ subscription: sub || null, currentPlan: user?.plan || 'free' });
});

router.post('/upgrade', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { plan, txnRef, amount } = req.body;
    if (!plan || !['diy', 'whitelabel'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
    const userId = req.userId!;
    db.prepare('INSERT INTO payments (user_id, plan, amount, txn_ref) VALUES (?, ?, ?, ?)').run(userId, plan, amount || 0, txnRef || '');
    const payRow: any = db.prepare('SELECT id FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(userId);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`INSERT INTO subscriptions (user_id, plan, status, expires_at, payment_id)
      VALUES (?, ?, 'active', ?, ?) ON CONFLICT(user_id) DO UPDATE SET plan = ?, status = 'active', expires_at = ?, payment_id = ?`)
      .run(userId, plan, expiresAt, payRow?.id || 0, plan, expiresAt, payRow?.id || 0);
    db.prepare('UPDATE users SET plan = ? WHERE id = ?').run(plan, userId);
    res.json({ message: 'Plan upgraded!', plan, expiresAt });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/payments', authMiddleware, (req: AuthRequest, res: Response) => {
  const payments = db.prepare('SELECT id, plan, amount, txn_ref, status, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC').all(req.userId!);
  res.json({ payments });
});

export default router;
