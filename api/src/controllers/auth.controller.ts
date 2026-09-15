import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  login,
  getUserById,
  updateProfile,
  changePassword,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
} from '../services/auth.service.js';
import {
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  twoFactorEnableBodySchema,
  twoFactorDisableBodySchema,
} from '@jsoft/shared';
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
    twoFactorEnabled: user.twoFactorEnabled,
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

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new NotFoundError('Not authenticated');
  }

  const data = changePasswordSchema.parse(req.body);
  const result = await changePassword(authReq.user.userId, data);

  res.json(result);
});

export const setupTwoFactorHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new NotFoundError('Not authenticated');
  }

  const result = await setupTwoFactor(authReq.user.userId, authReq.user.username);
  res.json(result);
});

export const enableTwoFactorHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new NotFoundError('Not authenticated');
  }

  const data = twoFactorEnableBodySchema.parse(req.body);
  const result = await enableTwoFactor(authReq.user.userId, data.totpCode);

  res.json(result);
});

export const disableTwoFactorHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new NotFoundError('Not authenticated');
  }

  const data = twoFactorDisableBodySchema.parse(req.body);
  const result = await disableTwoFactor(authReq.user.userId, data);

  res.json(result);
});