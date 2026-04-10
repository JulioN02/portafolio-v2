import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginInput, JwtPayload, LoginResponse } from '@jsoft/shared';

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
      createdAt: true,
      updatedAt: true,
    },
  });
};