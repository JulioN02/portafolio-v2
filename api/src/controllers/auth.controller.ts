import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { login, getUserById, updateProfile, changePassword } from '../services/auth.service.js';
import { verificationCodeService } from '../services/verification-code.service.js';
import { sendVerificationCodeEmail } from '../services/email.service.js';
import { loginSchema, updateProfileSchema, changePasswordSchema } from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

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

  const user = await getUserById(authReq.user.userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.email) {
    throw new ValidationError(
      'No email configured in your profile. Add one before requesting a verification code.',
    );
  }

  const { code, expiresIn } = await verificationCodeService.generate(authReq.user.userId);

  // Deliver the code by email. The plaintext code never leaves the server.
  await sendVerificationCodeEmail(user.email, code);

  res.json({ message: 'Verification code sent', expiresIn });
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