import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: string;
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth required' });
  try {
    const p = jwt.verify(h.slice(7), JWT_SECRET) as any;
    req.userId = p.userId; req.userPlan = p.plan; next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) {
    try {
      const p = jwt.verify(h.slice(7), JWT_SECRET) as any;
      req.userId = p.userId; req.userPlan = p.plan;
    } catch {}
  }
  next();
}

export function generateToken(userId: string, plan: string): string {
  return jwt.sign({ userId, plan }, JWT_SECRET, { expiresIn: '30d' });
}
