import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { sendPasswordResetToSupport } from './email';

const router = Router();
export const JWT_SECRET = process.env.JWT_SECRET || 'seo-audit-secret-key-2024';

function signToken(user: any): string {
  return jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hash, name);
    const user = db.prepare('SELECT id, email, name, plan, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.json({ user, token: signToken(user), message: 'Account created successfully!' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const safe = { id: user.id, email: user.email, name: user.name, plan: user.plan, created_at: user.created_at };
    res.json({ user: safe, token: signToken(safe) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/me', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const user = db.prepare('SELECT id, email, name, plan, created_at FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user });
  } catch { res.status(401).json({ error: 'Invalid token' }); }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user: any = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
    if (!user) return res.status(404).json({ error: 'Email not found. Please sign up first.' });
    const token = uuidv4();
    const exp = new Date(Date.now() + 3600000).toISOString();
    db.prepare('UPDATE users SET reset_token = ?, reset_token_exp = ? WHERE id = ?').run(token, exp, user.id);
    const sent = await sendPasswordResetToSupport(user.email, token);
    if (sent) res.json({ message: 'Your password reset request has been submitted. Our support team will send you a reset link shortly. Please check your email or contact seo@dabisoftsolutions.com.' });
    else res.status(500).json({ error: 'Failed to submit reset request. Please email seo@dabisoftsolutions.com directly for help.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
    const user: any = db.prepare("SELECT id FROM users WHERE reset_token = ? AND reset_token_exp > datetime('now')").get(token);
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });
    const hash = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_exp = NULL WHERE id = ?').run(hash, user.id);
    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
