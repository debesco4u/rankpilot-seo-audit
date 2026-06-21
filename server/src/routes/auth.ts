import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { authRequired, AuthRequest, generateToken } from '../middleware';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const id = uuid();
    const hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?,?,?,?)').run(id, email, hash, name || '');
    const token = generateToken(id, 'free');
    res.json({ token, user: { id, email, name: name || '', plan: 'free' } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user.id, user.plan);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/me', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, plan, created_at FROM users WHERE id = ?').get(req.userId!) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

export default router;
