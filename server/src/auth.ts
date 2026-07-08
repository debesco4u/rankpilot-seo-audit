import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db';
import { sendResetEmail } from './email';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'seo-audit-tool-secret-key-change-in-prod';

export function authMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, SECRET) as any;
    (req as any).userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hash, name);

    const token = jwt.sign({ userId: result.lastInsertRowid }, SECRET, { expiresIn: '30d' });
    const user = { id: result.lastInsertRowid, email, name, tier: 'free' };
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '30d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name, tier: user.tier }, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', authMiddleware, (req: Request, res: Response) => {
  const user = db.prepare('SELECT id, email, name, tier FROM users WHERE id = ?').get((req as any).userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = db.prepare('SELECT id FROM users WHERE email=?').get(email) as any;
  if (!user) return res.status(404).json({ error: 'Email not found. Please check your email or create an account.' });
  const token = require('crypto').randomBytes(20).toString('hex');
  db.prepare('UPDATE users SET reset_token=? WHERE id=?').run(token, user.id);
  try {
    await sendResetEmail(email, token);
    res.json({ message: 'A reset token has been sent to your email.' });
  } catch (err: any) {
    console.error('[EMAIL ERROR] Failed to send reset email:', err.message);
    console.error('[EMAIL ERROR] Full error:', JSON.stringify({ code: err.code, command: err.command, responseCode: err.responseCode, response: err.response }, null, 2));
    res.status(500).json({ error: 'Failed to send reset email. Please try again later.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
  const user = db.prepare('SELECT id FROM users WHERE reset_token=?').get(token) as any;
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password=?, reset_token=NULL WHERE id=?').run(hash, user.id);
  res.json({ message: 'Password reset successfully. You can now log in.' });
});

export default router;
