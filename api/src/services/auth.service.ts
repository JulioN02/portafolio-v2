import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginInput, JwtPayload, LoginResponse, UpdateProfileInput, ChangePasswordInput } from '@jsoft/shared';
import { verificationCodeService } from './verification-code.service.js';

const prisma = new PrismaClient();

export const login = async (credentials: LoginInput): Promise<LoginResponse> => {
  const { username, password } = credentials;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    role: 'ADMIN',
  };

  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

  const token = jwt.sign(payload, secret, { expiresIn });

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
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify currentPassword
  const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Build update data
  const updateData: { username?: string; email?: string | null } = {};

  if (data.username !== undefined) {
    // Check username uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Username already taken');
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
        throw new Error('Email already taken');
      }
    }
    updateData.email = data.email;
  }

  // Ensure at least one field is being updated
  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update');
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
  };
};

/**
 * Change password using verification code.
 */
export const changePassword = async (userId: string, data: ChangePasswordInput): Promise<{ message: string }> => {
  // Validate verification code
  verificationCodeService.validate(userId, data.verificationCode);

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 12);

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password updated successfully' };
};