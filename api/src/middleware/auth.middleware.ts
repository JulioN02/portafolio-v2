import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@jsoft/shared';
import { AuthError } from '../utils/errors.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Verifies the Bearer JWT and attaches the decoded payload to `req.user`.
 *
 * NOTE ON `requireAdmin`: This middleware was removed because it was a no-op.
 * The JWT payload is ALWAYS issued with `role: 'ADMIN'` by the login service,
 * so the `role !== 'ADMIN'` check could never fail. authMiddleware (signature
 * verification) is the only guard that can actually reject a request.
 */
export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AuthError('No token provided'));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AuthError('Invalid or expired token'));
  }
};