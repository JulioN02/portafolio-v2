import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { login, getUserById, updateProfile, changePassword } from '../services/auth.service.js';
import { verificationCodeService } from '../services/verification-code.service.js';
import { loginSchema, updateProfileSchema, changePasswordSchema } from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const credentials = loginSchema.parse(req.body);
  const result = await login(credentials);
  res.json(result);
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new NotFoundError('Not authenticated');
  }

  const user = await getUserById(authReq.user.userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: 'ADMIN',
  });
});

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new NotFoundError('Not authenticated');
  }

  const data = updateProfileSchema.parse(req.body);
  const result = await updateProfile(authReq.user.userId, data);

  res.json(result);
});

export const sendVerificationCodeHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new NotFoundError('Not authenticated');
  }

  const result = verificationCodeService.generate(authReq.user.userId);
  console.log(`[DEV] Verification code for user ${authReq.user.userId}: ${result.code}`);

  res.json(result);
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new NotFoundError('Not authenticated');
  }

  const data = changePasswordSchema.parse(req.body);
  const result = await changePassword(authReq.user.userId, data);

  res.json(result);
});