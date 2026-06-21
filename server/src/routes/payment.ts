import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { authRequired, AuthRequest, generateToken } from '../middleware';

const router = Router();
const PAYPAL_EMAIL = 'dumbele23@gmail.com';

router.get('/plans', (_req, res) => {
  res.json({
    plans: [
      { id: 'free', name: 'Free', price: 0, features: ['5 audits/day', 'General overview', 'Basic PDF'] },
      { id: 'diy', name: 'DIY SEO', price: 15, features: ['Unlimited audits', 'Full page analysis', 'Keyword strategy', '90-day action plan', 'Detailed PDF'] },
      { id: 'whitelabel', name: 'White Label', price: 20, features: ['Everything in DIY', 'Remove branding', 'Client-ready PDFs', 'Priority support'] }
    ],
    paypalEmail: PAYPAL_EMAIL
  });
});

router.post('/activate', authRequired, (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    const prices: Record<string, number> = { diy: 15, whitelabel: 20 };
    if (!prices[plan]) return res.status(400).json({ error: 'Invalid plan' });
    const db = getDb();
    db.prepare('UPDATE users SET plan = ?, updated_at = datetime("now") WHERE id = ?').run(plan, req.userId!);
    const paymentId = uuid();
    db.prepare('INSERT INTO payments (id, user_id, plan, amount, paypal_email) VALUES (?,?,?,?,?)')
      .run(paymentId, req.userId!, plan, prices[plan], PAYPAL_EMAIL);
    const token = generateToken(req.userId!, plan);
    res.json({ token, plan, message: 'Plan activated!' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/cancel', authRequired, (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    db.prepare('UPDATE users SET plan = "free", updated_at = datetime("now") WHERE id = ?').run(req.userId!);
    const token = generateToken(req.userId!, 'free');
    res.json({ token, plan: 'free', message: 'Downgraded to Free' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/history', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const payments = db.prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC').all(req.userId!);
  res.json({ payments });
});

export default router;
