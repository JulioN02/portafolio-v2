import express from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth.routes';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../utils/errors';

const mockPrisma = new PrismaClient();

// bcrypt is native + slow; the hash/compare logic is exercised in the unit
// suites. Here we only need deterministic HTTP outcomes.
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// TOTP primitives are mocked; their behavior is covered by totp.service.test.ts
// and auth.service.test.ts. The routes test pins the HTTP contract.
jest.mock('../services/totp.service', () => ({
  totpService: {
    generateSecret: jest.fn().mockReturnValue('BASE32SECRET'),
    encryptSecret: jest.fn().mockReturnValue('iv:tag:ciphertext'),
    decryptSecret: jest.fn().mockReturnValue('PLAIN-SECRET'),
    generateKeyUri: jest.fn().mockReturnValue('otpauth://totp/admin'),
    generateQrDataUrl: jest.fn().mockResolvedValue('data:image/png;base64,QRCODE'),
    verifyTotp: jest.fn().mockResolvedValue(undefined),
    generateRecoveryCodes: jest.fn().mockReturnValue([
      'AAAA-1111', 'BBBB-2222', 'CCCC-3333', 'DDDD-4444', 'EEEE-5555',
      'FFFF-6666', 'GGGG-7777', 'HHHH-8888', 'JJJJ-9999', 'KKKK-0000',
    ]),
    hashRecoveryCode: jest.fn().mockImplementation(async (code: string) => `hash:${code}`),
    verifyRecoveryCode: jest.fn().mockResolvedValue('rh1'),
    consumeRecoveryCode: jest.fn().mockResolvedValue(undefined),
  },
}));

import { totpService } from '../services/totp.service';
const mockedTotp = totpService as jest.Mocked<typeof totpService>;

const RECOVERY_CODE_REGEX = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/;

const user2faOff = {
  id: 'test-user-1',
  username: 'admin',
  email: 'admin@example.com',
  password: 'hashed-password',
  twoFactorSecret: null,
  twoFactorEnabled: false,
  recoveryCodes: [],
};

const userPendingSecret = {
  ...user2faOff,
  twoFactorSecret: 'iv:tag:ciphertext',
};

const user2faOn = {
  ...user2faOff,
  twoFactorSecret: 'iv:tag:ciphertext',
  twoFactorEnabled: true,
  recoveryCodes: ['rh1', 'rh2'],
};

/**
 * Integration contract for the 2FA endpoints (setup/enable/disable) and the
 * new PATCH /auth/password contract (currentPassword + TOTP/recovery XOR).
 * Replaces the removed email verification-code suite.
 */
describe('Auth routes (integration)', () => {
  let server: Server;
  let baseUrl: string;
  let validToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';

    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/auth`;

    validToken = jwt.sign(
      { userId: 'test-user-1', username: 'admin', role: 'ADMIN' },
      'test-secret',
      { expiresIn: '7d' },
    );
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';

    // Default: authenticated admin WITHOUT 2FA.
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOff);
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(user2faOff);

    // The authLimiter (5/15min) is shared across all routes; reset it so each
    // test starts with a clean quota regardless of which IP key was recorded.
    authLimiter.resetAll?.();
    authLimiter.resetKey('127.0.0.1');
    authLimiter.resetKey('::ffff:127.0.0.1');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const authedPost = (path: string, body: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify(body),
    });

  const authedPatch = (path: string, body: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify(body),
    });

  describe('auth guard (401) on every 2FA + password route', () => {
    it.each([
      ['POST', '/2fa/setup', '{}'],
      ['POST', '/2fa/enable', JSON.stringify({ totpCode: '123456' })],
      ['POST', '/2fa/disable', JSON.stringify({ currentPassword: 'x', totpCode: '123456' })],
      ['PATCH', '/password', JSON.stringify({ currentPassword: 'x', newPassword: 'twelvechars12' })],
    ])('%s %s returns 401 without a token', async (method, path, body) => {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      expect(res.status).toBe(401);
      const payload = await res.json();
      expect(payload.code).toBe('AUTH_ERROR');
    });

    it.each([
      ['POST', '/2fa/setup'],
      ['POST', '/2fa/enable'],
      ['POST', '/2fa/disable'],
      ['PATCH', '/password'],
    ])('%s %s returns 401 with an invalid token', async (method, path) => {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer not-a-valid-token',
        },
        body: '{}',
      });
      expect(res.status).toBe(401);
      const payload = await res.json();
      expect(payload.code).toBe('AUTH_ERROR');
    });
  });

  describe('POST /2fa/setup', () => {
    it('returns otpauthUrl, qrDataUrl and secret; twoFactorEnabled stays false', async () => {
      const res = await authedPost('/2fa/setup', {});

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.otpauthUrl).toBe('otpauth://totp/admin');
      expect(body.qrDataUrl).toBe('data:image/png;base64,QRCODE');
      expect(body.secret).toBe('BASE32SECRET');
      expect(body.twoFactorEnabled).toBeUndefined();

      // Persisted only the encrypted secret — NOT twoFactorEnabled.
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-1' },
        data: { twoFactorSecret: 'iv:tag:ciphertext' },
      });
      expect(mockedTotp.generateSecret).toHaveBeenCalled();
    });

    it('returns 409 when 2FA is already enabled', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOn);

      const res = await authedPost('/2fa/setup', {});
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.code).toBe('CONFLICT');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('POST /2fa/enable', () => {
    it('returns 200 with exactly 10 recovery codes and a message', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(userPendingSecret);

      const res = await authedPost('/2fa/enable', { totpCode: '123456' });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.recoveryCodes).toHaveLength(10);
      for (const code of body.recoveryCodes) {
        expect(code).toMatch(RECOVERY_CODE_REGEX);
      }
      expect(body.message).toBe('Two-factor authentication enabled');
    });

    it('returns 400 for an invalid TOTP code', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(userPendingSecret);
      mockedTotp.verifyTotp.mockRejectedValueOnce(new ValidationError('Invalid or expired verification code'));

      const res = await authedPost('/2fa/enable', { totpCode: '000000' });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when no pending secret exists (setup not started)', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOff);

      const res = await authedPost('/2fa/enable', { totpCode: '123456' });
      expect(res.status).toBe(400);
      expect((await res.json()).code).toBe('VALIDATION_ERROR');
    });

    it('returns 409 when 2FA is already enabled', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOn);

      const res = await authedPost('/2fa/enable', { totpCode: '123456' });
      expect(res.status).toBe(409);
      expect((await res.json()).code).toBe('CONFLICT');
    });
  });

  describe('POST /2fa/disable', () => {
    it('returns 200 and clears the 2FA fields', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOn);

      const res = await authedPost('/2fa/disable', { currentPassword: 'correct', totpCode: '123456' });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('Two-factor authentication disabled');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-1' },
        data: { twoFactorSecret: null, twoFactorEnabled: false, recoveryCodes: [] },
      });
    });

    it('returns 403 when currentPassword is wrong', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOn);
      const { compare } = jest.requireMock('bcrypt') as { compare: jest.Mock };
      compare.mockResolvedValueOnce(false);

      const res = await authedPost('/2fa/disable', { currentPassword: 'wrong', totpCode: '123456' });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.code).toBe('FORBIDDEN');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('returns 400 when the TOTP code is invalid', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOn);
      mockedTotp.verifyTotp.mockRejectedValueOnce(new ValidationError('Invalid or expired verification code'));

      const res = await authedPost('/2fa/disable', { currentPassword: 'correct', totpCode: '000000' });
      expect(res.status).toBe(400);
      expect((await res.json()).code).toBe('VALIDATION_ERROR');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('returns 409 when 2FA is not enabled', async () => {
      const res = await authedPost('/2fa/disable', { currentPassword: 'correct', totpCode: '123456' });
      expect(res.status).toBe(409);
      expect((await res.json()).code).toBe('CONFLICT');
    });
  });

  describe('PATCH /password', () => {
    it('updates the password with currentPassword + newPassword (2FA off)', async () => {
      const res = await authedPatch('/password', {
        currentPassword: 'correct',
        newPassword: 'twelvechars12',
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('Password updated successfully');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-1' },
        data: { password: 'hashed-password' },
      });
    });

    it('returns 400 VALIDATION_ERROR for a newPassword shorter than 12', async () => {
      const res = await authedPatch('/password', {
        currentPassword: 'correct',
        newPassword: 'elevenchars',
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.details.newPassword).toBeDefined();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('returns 403 FORBIDDEN when currentPassword is wrong', async () => {
      const { compare } = jest.requireMock('bcrypt') as { compare: jest.Mock };
      compare.mockResolvedValueOnce(false);

      const res = await authedPatch('/password', {
        currentPassword: 'wrong',
        newPassword: 'twelvechars12',
      });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.code).toBe('FORBIDDEN');
      expect(body.message).toBe('Current password is incorrect');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('returns 400 when 2FA is enabled and neither TOTP nor recovery code is provided', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOn);

      const res = await authedPatch('/password', {
        currentPassword: 'correct',
        newPassword: 'twelvechars12',
      });

      expect(res.status).toBe(400);
      expect((await res.json()).code).toBe('VALIDATION_ERROR');
    });

    it('updates the password with a valid TOTP code when 2FA is enabled', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOn);

      const res = await authedPatch('/password', {
        currentPassword: 'correct',
        totpCode: '123456',
        newPassword: 'twelvechars12',
      });

      expect(res.status).toBe(200);
      expect(mockedTotp.decryptSecret).toHaveBeenCalledWith('iv:tag:ciphertext');
      expect(mockedTotp.verifyTotp).toHaveBeenCalledWith('123456', 'PLAIN-SECRET');
    });

    it('consumes the recovery code when 2FA is enabled and a recovery code is used', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user2faOn);

      const res = await authedPatch('/password', {
        currentPassword: 'correct',
        recoveryCode: 'ABCD-2345',
        newPassword: 'twelvechars12',
      });

      expect(res.status).toBe(200);
      expect(mockedTotp.verifyRecoveryCode).toHaveBeenCalledWith('ABCD-2345', ['rh1', 'rh2']);
      expect(mockedTotp.consumeRecoveryCode).toHaveBeenCalledWith('test-user-1', ['rh1', 'rh2'], 'rh1');
    });

    it('returns 429 after 5 attempts (authLimiter)', async () => {
      const body = { currentPassword: 'correct', newPassword: 'twelvechars12' };
      const statuses: number[] = [];
      for (let i = 0; i < 6; i++) {
        const res = await authedPatch('/password', body);
        statuses.push(res.status);
      }

      expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
      expect(statuses[5]).toBe(429);
      const lastBody = await (async () => {
        const res = await fetch(`${baseUrl}/password`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validToken}`,
          },
          body: JSON.stringify(body),
        });
        return res.json();
      })();
      expect(lastBody.code).toBe('RATE_LIMITED');
    });
  });

  describe('JWT verification hardening', () => {
    it('rejects a token signed with HS384 (algorithm pinned to HS256)', async () => {
      const hs384Token = jwt.sign(
        { userId: 'test-user-1', username: 'admin', role: 'ADMIN' },
        'test-secret',
        { expiresIn: '7d', algorithm: 'HS384' },
      );

      const res = await fetch(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${hs384Token}` },
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('AUTH_ERROR');
    });

    it('fails closed when JWT_SECRET is missing (contract guard)', async () => {
      delete process.env.JWT_SECRET;

      const res = await fetch(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('AUTH_ERROR');
    });
  });

  describe('GET /me', () => {
    it('surfaces twoFactorEnabled status', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'test-user-1',
        username: 'admin',
        email: 'admin@example.com',
        twoFactorEnabled: true,
      });

      const res = await fetch(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.twoFactorEnabled).toBe(true);
    });
  });
});