import { login, getUserById, updateProfile, changePassword, setupTwoFactor, enableTwoFactor, disableTwoFactor } from '../services/auth.service';
import { PrismaClient } from '@prisma/client';
import { AuthError, NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';

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
import { totpService } from '../services/totp.service';

jest.mock('../services/totp.service', () => ({
  totpService: {
    generateSecret: jest.fn(),
    encryptSecret: jest.fn(),
    decryptSecret: jest.fn(),
    generateKeyUri: jest.fn(),
    generateQrDataUrl: jest.fn(),
    verifyTotp: jest.fn(),
    generateRecoveryCodes: jest.fn(),
    hashRecoveryCode: jest.fn(),
    verifyRecoveryCode: jest.fn(),
    consumeRecoveryCode: jest.fn(),
  },
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedTotp = totpService as jest.Mocked<typeof totpService>;

const mockUser = {
  id: 'u1',
  username: 'admin',
  password: 'hashed',
  email: 'a@b.c',
  role: 'ADMIN',
  twoFactorSecret: null,
  twoFactorEnabled: false,
  recoveryCodes: [],
};

const mockUser2fa = {
  ...mockUser,
  twoFactorSecret: 'iv:tag:ciphertext',
  twoFactorEnabled: true,
  recoveryCodes: ['rh1', 'rh2'],
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    delete process.env.JWT_EXPIRES_IN; // exercise the '12h' default
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
        { expiresIn: '12h', algorithm: 'HS256' },
      );
      expect(result).toEqual({ token: 'token-123', user: { id: 'u1', username: 'admin', role: 'ADMIN' } });
    });

    it('uses JWT_EXPIRES_IN from the environment when set', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue('token-123' as never);
      process.env.JWT_EXPIRES_IN = '30m';

      await login({ username: 'admin', password: 'pass' });

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expect.anything(),
        'test-secret',
        { expiresIn: '30m', algorithm: 'HS256' },
      );
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

  describe('changePassword — 2FA disabled', () => {
    it('updates the password with currentPassword + newPassword only', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('new-hash' as never);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, password: 'new-hash' });

      const result = await changePassword('u1', { currentPassword: 'pass', newPassword: 'newpass12' });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('pass', 'hashed');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpass12', 12);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { password: 'new-hash' },
      });
      expect(mockedTotp.verifyTotp).not.toHaveBeenCalled();
      expect(mockedTotp.verifyRecoveryCode).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('ignores a present totpCode when 2FA is disabled', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('new-hash' as never);

      const result = await changePassword('u1', { currentPassword: 'pass', totpCode: '123456', newPassword: 'newpass12' });

      expect(mockedTotp.verifyTotp).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('throws ForbiddenError (403) when currentPassword is wrong', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        changePassword('u1', { currentPassword: 'wrong', newPassword: 'newpass12' }),
      ).rejects.toThrow(ForbiddenError);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when the user does not exist', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        changePassword('missing', { currentPassword: 'pass', newPassword: 'newpass12' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('changePassword — 2FA enabled (TOTP)', () => {
    it('updates the password when a valid TOTP code is provided', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedTotp.decryptSecret.mockReturnValue('PLAIN-SECRET');
      mockedTotp.verifyTotp.mockResolvedValue(undefined);
      mockedBcrypt.hash.mockResolvedValue('new-hash' as never);

      const result = await changePassword('u1', { currentPassword: 'pass', totpCode: '123456', newPassword: 'newpass12' });

      expect(mockedTotp.decryptSecret).toHaveBeenCalledWith('iv:tag:ciphertext');
      expect(mockedTotp.verifyTotp).toHaveBeenCalledWith('123456', 'PLAIN-SECRET');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { password: 'new-hash' },
      });
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('rejects a wrong TOTP code with ValidationError and keeps the password', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedTotp.decryptSecret.mockReturnValue('PLAIN-SECRET');
      mockedTotp.verifyTotp.mockRejectedValue(new ValidationError('Invalid or expired verification code'));

      await expect(
        changePassword('u1', { currentPassword: 'pass', totpCode: '000000', newPassword: 'newpass12' }),
      ).rejects.toThrow(ValidationError);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects when both totpCode and recoveryCode are provided', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await expect(
        changePassword('u1', { currentPassword: 'pass', totpCode: '123456', recoveryCode: 'ABCD-2345', newPassword: 'newpass12' }),
      ).rejects.toThrow(ValidationError);
      expect(mockedTotp.verifyTotp).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects when neither totpCode nor recoveryCode is provided', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await expect(
        changePassword('u1', { currentPassword: 'pass', newPassword: 'newpass12' }),
      ).rejects.toThrow(ValidationError);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword — 2FA enabled (recovery code)', () => {
    it('updates the password and consumes the recovery code (single-use)', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedTotp.verifyRecoveryCode.mockResolvedValue('rh2');
      mockedTotp.consumeRecoveryCode.mockResolvedValue(undefined);
      mockedBcrypt.hash.mockResolvedValue('new-hash' as never);

      const result = await changePassword('u1', { currentPassword: 'pass', recoveryCode: 'ABCD-2345', newPassword: 'newpass12' });

      expect(mockedTotp.verifyRecoveryCode).toHaveBeenCalledWith('ABCD-2345', ['rh1', 'rh2']);
      expect(mockedTotp.consumeRecoveryCode).toHaveBeenCalledWith('u1', ['rh1', 'rh2'], 'rh2');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { password: 'new-hash' },
      });
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('rejects an invalid or already-consumed recovery code', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedTotp.verifyRecoveryCode.mockResolvedValue(null);

      await expect(
        changePassword('u1', { currentPassword: 'pass', recoveryCode: 'ABCD-2345', newPassword: 'newpass12' }),
      ).rejects.toThrow(ValidationError);
      expect(mockedTotp.consumeRecoveryCode).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('setupTwoFactor', () => {
    it('persists the encrypted secret and returns QR material (enabled stays false)', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedTotp.generateSecret.mockReturnValue('BASE32SECRET');
      mockedTotp.encryptSecret.mockReturnValue('iv:tag:ct');
      mockedTotp.generateKeyUri.mockReturnValue('otpauth://totp/admin');
      mockedTotp.generateQrDataUrl.mockResolvedValue('data:image/png;base64,QR');

      const result = await setupTwoFactor('u1', 'admin');

      expect(mockedTotp.generateSecret).toHaveBeenCalled();
      expect(mockedTotp.encryptSecret).toHaveBeenCalledWith('BASE32SECRET');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { twoFactorSecret: 'iv:tag:ct' },
      });
      expect(result).toEqual({
        otpauthUrl: 'otpauth://totp/admin',
        qrDataUrl: 'data:image/png;base64,QR',
        secret: 'BASE32SECRET',
      });
    });

    it('rejects with 409 when 2FA is already enabled', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);

      await expect(setupTwoFactor('u1', 'admin')).rejects.toThrow(
        expect.objectContaining({ statusCode: 409, code: 'CONFLICT' }),
      );
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when the user does not exist', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(setupTwoFactor('missing', 'admin')).rejects.toThrow(NotFoundError);
    });
  });

  describe('enableTwoFactor', () => {
    it('verifies the code, stores hashed recovery codes and returns them once', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, twoFactorSecret: 'iv:tag:ciphertext' });
      mockedTotp.decryptSecret.mockReturnValue('PLAIN-SECRET');
      mockedTotp.verifyTotp.mockResolvedValue(undefined);
      mockedTotp.generateRecoveryCodes.mockReturnValue(['AAAA-1111', 'BBBB-2222']);
      mockedTotp.hashRecoveryCode.mockImplementation(async (code: string) => `hash:${code}`);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, twoFactorEnabled: true });

      const result = await enableTwoFactor('u1', '123456');

      expect(mockedTotp.verifyTotp).toHaveBeenCalledWith('123456', 'PLAIN-SECRET');
      expect(mockedTotp.hashRecoveryCode).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { twoFactorEnabled: true, recoveryCodes: ['hash:AAAA-1111', 'hash:BBBB-2222'] },
      });
      expect(result).toEqual({ recoveryCodes: ['AAAA-1111', 'BBBB-2222'], message: expect.any(String) });
    });

    it('rejects an invalid code with ValidationError and does not enable', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedTotp.decryptSecret.mockReturnValue('PLAIN-SECRET');
      mockedTotp.verifyTotp.mockRejectedValue(new ValidationError('Invalid or expired verification code'));

      await expect(enableTwoFactor('u1', '000000')).rejects.toThrow(ValidationError);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects with 400 when no pending secret exists (setup not started)', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, twoFactorSecret: null });

      await expect(enableTwoFactor('u1', '123456')).rejects.toThrow(
        expect.objectContaining({ statusCode: 400 }),
      );
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects with 409 when 2FA is already enabled', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);

      await expect(enableTwoFactor('u1', '123456')).rejects.toThrow(
        expect.objectContaining({ statusCode: 409, code: 'CONFLICT' }),
      );
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('disableTwoFactor', () => {
    it('clears the secret, recovery codes and disables 2FA on valid credentials', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedTotp.decryptSecret.mockReturnValue('PLAIN-SECRET');
      mockedTotp.verifyTotp.mockResolvedValue(undefined);

      const result = await disableTwoFactor('u1', { currentPassword: 'pass', totpCode: '123456' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { twoFactorSecret: null, twoFactorEnabled: false, recoveryCodes: [] },
      });
      expect(result).toEqual({ message: expect.any(String) });
    });

    it('throws ForbiddenError (403) when currentPassword is wrong', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        disableTwoFactor('u1', { currentPassword: 'wrong', totpCode: '123456' }),
      ).rejects.toThrow(ForbiddenError);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('throws ValidationError when the TOTP code is invalid', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2fa);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedTotp.decryptSecret.mockReturnValue('PLAIN-SECRET');
      mockedTotp.verifyTotp.mockRejectedValue(new ValidationError('Invalid or expired verification code'));

      await expect(
        disableTwoFactor('u1', { currentPassword: 'pass', totpCode: '000000' }),
      ).rejects.toThrow(ValidationError);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects with 409 when 2FA is not enabled', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        disableTwoFactor('u1', { currentPassword: 'pass', totpCode: '123456' }),
      ).rejects.toThrow(expect.objectContaining({ statusCode: 409, code: 'CONFLICT' }));
    });
  });
});