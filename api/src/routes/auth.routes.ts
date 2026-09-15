import { Router, Response, IRouter } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import {
  loginHandler,
  meHandler,
  updateProfileHandler,
  changePasswordHandler,
  setupTwoFactorHandler,
  enableTwoFactorHandler,
  disableTwoFactorHandler,
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

// 2FA management (protected + rate limited): TOTP codes are brute-forceable,
// so every 2FA endpoint shares the strict authLimiter (5 tries / 15 min).
router.post('/2fa/setup', authMiddleware, authLimiter, setupTwoFactorHandler);
router.post('/2fa/enable', authMiddleware, authLimiter, enableTwoFactorHandler);
router.post('/2fa/disable', authMiddleware, authLimiter, disableTwoFactorHandler);

// PATCH /api/auth/password - Change password (protected + rate limited)
// currentPassword is validated server-side; when 2FA is enabled exactly one of
// totpCode | recoveryCode is required (XOR).
router.patch('/password', authMiddleware, authLimiter, changePasswordHandler);

export default router;