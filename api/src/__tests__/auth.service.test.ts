import { login, getUserById, updateProfile, changePassword } from '../services/auth.service';
import { PrismaClient } from '@prisma/client';
import { AuthError, NotFoundError, ValidationError } from '../utils/errors';

const mockPrisma = new PrismaClient();

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verificationCodeService } from '../services/verification-code.service';

jest.mock('../services/verification-code.service', () => ({
  verificationCodeService: { validate: jest.fn() },
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedVerification = verificationCodeService as jest.Mocked<typeof verificationCodeService>;

const mockUser = { id: 'u1', username: 'admin', password: 'hashed', email: 'a@b.c', role: 'ADMIN' };

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';
  });

  describe('login', () => {
    it('logs in with valid credentials', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue('token-123' as never);

      const result = await login({ username: 'admin', password: 'pass' });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'admin' } });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('pass', 'hashed');
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1', role: 'ADMIN' }),
        'test-secret',
        { expiresIn: '7d' },
      );
      expect(result).toEqual({ token: 'token-123', user: { id: 'u1', username: 'admin', role: 'ADMIN' } });
    });

    it('throws AuthError when user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(login({ username: 'nobody', password: 'x' })).rejects.toThrow(AuthError);
    });

    it('throws AuthError when password is invalid', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);
      await expect(login({ username: 'admin', password: 'wrong' })).rejects.toThrow(AuthError);
    });
  });

  describe('getUserById', () => {
    it('returns user without password', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', username: 'admin', email: 'a@b.c' });
      const result = await getUserById('u1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u1' }, select: expect.any(Object) });
      expect(result).toEqual({ id: 'u1', username: 'admin', email: 'a@b.c' });
    });

    it('returns null when user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await getUserById('missing');
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('updates username and email', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, username: 'newadmin', email: 'n@b.c' });

      const result = await updateProfile('u1', { username: 'newadmin', email: 'n@b.c', currentPassword: 'pass' });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('pass', 'hashed');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { username: 'newadmin', email: 'n@b.c' } }),
      );
      expect(result.username).toBe('newadmin');
      expect(result.role).toBe('ADMIN');
    });

    it('throws NotFoundError when user missing', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(updateProfile('u1', { currentPassword: 'x' } as any)).rejects.toThrow(NotFoundError);
    });

    it('throws AuthError when current password is wrong', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);
      await expect(updateProfile('u1', { currentPassword: 'wrong' } as any)).rejects.toThrow(AuthError);
    });

    it('throws CONFLICT when username already taken by another user', async () => {
      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // initial lookup
        .mockResolvedValueOnce({ ...mockUser, id: 'other' }); // username uniqueness check
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await expect(updateProfile('u1', { username: 'taken', currentPassword: 'pass' })).rejects.toThrow(
        expect.objectContaining({ statusCode: 409, code: 'CONFLICT' }),
      );
    });

it('throws CONFLICT when email already taken by another user', async () => {
      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // initial lookup
        .mockResolvedValueOnce({ ...mockUser, id: 'other' }); // email uniqueness check
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await expect(
        updateProfile('u1', { email: 'taken@b.c', currentPassword: 'pass' }),
      ).rejects.toThrow(expect.objectContaining({ statusCode: 409, code: 'CONFLICT' }));
    });

    it('throws ValidationError when no fields provided', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await expect(updateProfile('u1', { currentPassword: 'pass' })).rejects.toThrow(ValidationError);
    });

    it('throws AppError when update fails', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      (mockPrisma.user.update as jest.Mock).mockRejectedValue(new Error('boom'));

      await expect(updateProfile('u1', { username: 'new', currentPassword: 'pass' })).rejects.toThrow('boom');
    });
  });

  describe('changePassword', () => {
    it('validates code, hashes password and updates user', async () => {
      mockedVerification.validate.mockReturnValue(undefined as never);
      mockedBcrypt.hash.mockResolvedValue('new-hash' as never);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, password: 'new-hash' });

      const result = await changePassword('u1', { verificationCode: '123456', newPassword: 'newpass' });

      expect(mockedVerification.validate).toHaveBeenCalledWith('u1', '123456');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpass', 12);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { password: 'new-hash' },
      });
      expect(result).toEqual({ message: 'Password updated successfully' });
    });
  });
});