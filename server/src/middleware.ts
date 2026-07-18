import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './auth';

export interface AuthRequest extends Request {
  userId?: number;
  userPlan?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth) { res.status(401).json({ error: 'Authentication required' }); return; }
  try {
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    req.userId = decoded.id;
    req.userPlan = decoded.plan;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}
