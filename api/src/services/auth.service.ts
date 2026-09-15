import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import {
  LoginInput,
  JwtPayload,
  LoginResponse,
  UpdateProfileInput,
  ChangePasswordInput,
  TwoFactorSetupResponse,
  TwoFactorEnableResponse,
  TwoFactorDisableResponse,
} from '@jsoft/shared';
import { totpService } from './totp.service.js';
import { AuthError, NotFoundError, ValidationError, AppError, ForbiddenError } from '../utils/errors.js';

const prisma = new PrismaClient();

export const login = async (credentials: LoginInput): Promise<LoginResponse> => {
  const { username, password } = credentials;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new AuthError('Invalid username or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthError('Invalid username or password');
  }

  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    role: 'ADMIN',
  };

  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '12h') as jwt.SignOptions['expiresIn'];

  // algorithm pinned explicitly: tokens must be HS256 to match the verify side.
  const token = jwt.sign(payload, secret, { expiresIn, algorithm: 'HS256' });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: 'ADMIN',
    },
  };
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      twoFactorEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Update user profile (username, email).
 * Requires currentPassword verification.
 */
export const updateProfile = async (userId: string, data: UpdateProfileInput): Promise<{
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN';
  twoFactorEnabled: boolean;
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify currentPassword
  const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AuthError('Current password is incorrect');
  }

  // Build update data
  const updateData: { username?: string; email?: string | null } = {};

  if (data.username !== undefined) {
    // Check username uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new AppError('Username already taken', 409, 'CONFLICT');
    }
    updateData.username = data.username;
  }

  if (data.email !== undefined) {
    // Check email uniqueness (only if non-null)
    if (data.email !== null) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new AppError('Email already taken', 409, 'CONFLICT');
      }
    }
    updateData.email = data.email;
  }

  // Ensure at least one field is being updated
  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('No fields to update');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return {
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    role: 'ADMIN',
    twoFactorEnabled: updatedUser.twoFactorEnabled,
  };
};

/**
 * Change password.
 *
 * - currentPassword is ALWAYS validated server-side (wrong => 403 FORBIDDEN).
 * - When 2FA is enabled, exactly one of totpCode | recoveryCode is required
 *   (both or neither => 400 VALIDATION_ERROR).
 * - Recovery codes are single-use: the matched hash is removed from the array.
 */
export const changePassword = async (
  userId: string,
  data: ChangePasswordInput,
): Promise<{ message: string }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // currentPassword is now validated server-side — closes the token-only hijack.
  const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ForbiddenError('Current password is incorrect');
  }

  // State-dependent rule (the schema enforces the shape; the service knows the
  // user's 2FA state): when enabled, require exactly one of totpCode/recoveryCode.
  if (user.twoFactorEnabled) {
    const hasTotp = Boolean(data.totpCode);
    const hasRecovery = Boolean(data.recoveryCode);

    if (hasTotp && hasRecovery) {
      throw new ValidationError('A TOTP code or a recovery code is required, not both');
    }
    if (!hasTotp && !hasRecovery) {
      throw new ValidationError('A TOTP code or a recovery code is required');
    }

    if (hasTotp) {
      const secret = totpService.decryptSecret(user.twoFactorSecret as string);
      await totpService.verifyTotp(data.totpCode as string, secret);
    } else {
      const matchedHash = await totpService.verifyRecoveryCode(
        data.recoveryCode as string,
        user.recoveryCodes,
      );
      if (!matchedHash) {
        throw new ValidationError('Invalid or already used recovery code');
      }
      // Single-use: remove the consumed code's hash atomically.
      await totpService.consumeRecoveryCode(userId, user.recoveryCodes, matchedHash);
    }
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 12);

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password updated successfully' };
};

/**
 * 2FA setup: generate a TOTP secret, store it encrypted (AES-256-GCM) and
 * return the QR material. twoFactorEnabled stays false until enable.
 */
export const setupTwoFactor = async (
  userId: string,
  username: string,
): Promise<TwoFactorSetupResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is already enabled', 409, 'CONFLICT');
  }

  const secret = totpService.generateSecret();
  const encrypted = totpService.encryptSecret(secret);

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: encrypted },
  });

  const otpauthUrl = totpService.generateKeyUri(username, secret);
  const qrDataUrl = await totpService.generateQrDataUrl(otpauthUrl);

  return { otpauthUrl, qrDataUrl, secret };
};

/**
 * 2FA enable: verify the pending secret with a TOTP code, set twoFactorEnabled
 * and store 10 bcrypt-hashed recovery codes. Plaintext codes are returned
 * exactly once here.
 */
export const enableTwoFactor = async (
  userId: string,
  totpCode: string,
): Promise<TwoFactorEnableResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is already enabled', 409, 'CONFLICT');
  }

  if (!user.twoFactorSecret) {
    throw new ValidationError('Two-factor setup has not been started');
  }

  const secret = totpService.decryptSecret(user.twoFactorSecret);
  await totpService.verifyTotp(totpCode, secret);

  const recoveryCodes = totpService.generateRecoveryCodes(10);
  const hashed = await Promise.all(recoveryCodes.map((code) => totpService.hashRecoveryCode(code)));

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true, recoveryCodes: hashed },
  });

  return { recoveryCodes, message: 'Two-factor authentication enabled' };
};

/**
 * 2FA disable: re-authenticate with currentPassword (403 on wrong) and a valid
 * TOTP code (400 on wrong), then clear secret + recovery codes.
 */
export const disableTwoFactor = async (
  userId: string,
  data: { currentPassword: string; totpCode: string },
): Promise<TwoFactorDisableResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not enabled', 409, 'CONFLICT');
  }

  const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ForbiddenError('Current password is incorrect');
  }

  const secret = totpService.decryptSecret(user.twoFactorSecret as string);
  await totpService.verifyTotp(data.totpCode, secret);

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: null, twoFactorEnabled: false, recoveryCodes: [] },
  });

  return { message: 'Two-factor authentication disabled' };
};