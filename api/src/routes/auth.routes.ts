import { Router, Response, IRouter } from 'express';
import { AuthRequest, authMiddleware, requireAdmin } from '../middleware/auth.middleware.js';
import {
  loginHandler,
  meHandler,
  updateProfileHandler,
  sendVerificationCodeHandler,
  changePasswordHandler,
} from '../controllers/auth.controller.js';

const router: IRouter = Router();

// POST /api/auth/login - Login (public)
router.post('/login', loginHandler);

// POST /api/auth/logout (protected - could be used to invalidate token server-side if needed)
router.post('/logout', authMiddleware, requireAdmin, (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - Get current user (protected)
router.get('/me', authMiddleware, meHandler);

// PATCH /api/auth/profile - Update profile (protected)
router.patch('/profile', authMiddleware, updateProfileHandler);

// POST /api/auth/verification-code - Request verification code (protected)
router.post('/verification-code', authMiddleware, sendVerificationCodeHandler);

// PATCH /api/auth/password - Change password with verification code (protected)
router.patch('/password', authMiddleware, changePasswordHandler);

export default router;