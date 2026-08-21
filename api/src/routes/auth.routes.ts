import { Router, Response, IRouter } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import {
  loginHandler,
  meHandler,
  updateProfileHandler,
  sendVerificationCodeHandler,
  changePasswordHandler,
} from '../controllers/auth.controller.js';

const router: IRouter = Router();

// POST /api/auth/login - Login (public)
// Strict rate limit (5 tries / 15 min per IP) to block brute-force credential stuffing.
router.post('/login', authLimiter, loginHandler);

// POST /api/auth/logout (protected)
router.post('/logout', authMiddleware, (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - Get current user (protected)
router.get('/me', authMiddleware, meHandler);

// PATCH /api/auth/profile - Update profile (protected)
router.patch('/profile', authMiddleware, updateProfileHandler);

// POST /api/auth/verification-code - Request verification code (protected)
// Strict rate limit too: the 6-digit code is brute-forceable, so cap attempts.
router.post('/verification-code', authLimiter, sendVerificationCodeHandler);

// PATCH /api/auth/password - Change password with verification code (protected)
router.patch('/password', authMiddleware, changePasswordHandler);

export default router;