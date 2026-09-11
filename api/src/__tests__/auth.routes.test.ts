import express from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { PrismaClient } from '@prisma/client';
import { sendVerificationCodeEmail } from '../services/email.service';

const mockPrisma = new PrismaClient();

// bcrypt is native + slow; the code hash/compare is not what these HTTP
// integration tests exercise (that lives in verification-code.service.test.ts).
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-code'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Never hit a real SMTP server from tests.
jest.mock('../services/email.service', () => ({
  sendVerificationCodeEmail: jest.fn(),
}));

const mockedSendEmail = sendVerificationCodeEmail as jest.MockedFunction<typeof sendVerificationCodeEmail>;

/**
 * Regression guard for POST /api/auth/verification-code.
 *
 * The route was previously registered WITHOUT authMiddleware (auth.routes.ts),
 * so the handler's `authReq.user` was always undefined → NotFoundError → 404
 * even with a valid Bearer token. The password-change flow was broken in
 * production because of this. This suite pins the correct behavior:
 *  - no token      → 401 (authMiddleware rejects)
 *  - valid token   → 200, code delivered by email, code NOT in the response
 *  - no profile email → 400 VALIDATION_ERROR
 *  - SMTP failure  → 500 (propagated, never a silent success)
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

    // Authenticated user WITH a profile email by default.
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'test-user-1',
      username: 'admin',
      email: 'admin@example.com',
    });
    (mockPrisma.verificationCode.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (mockPrisma.verificationCode.create as jest.Mock).mockResolvedValue({ id: 'vc-1' });
    (mockPrisma.verificationCode.findFirst as jest.Mock).mockResolvedValue(null);
    mockedSendEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /verification-code', () => {
    it('returns 401 when no Bearer token is provided', async () => {
      const res = await fetch(`${baseUrl}/verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('AUTH_ERROR');
    });

    it('returns 401 when the token is invalid', async () => {
      const res = await fetch(`${baseUrl}/verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer not-a-valid-token',
        },
        body: '{}',
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('AUTH_ERROR');
    });

    it('emails the code to the profile address and never returns it in the response', async () => {
      const res = await fetch(`${baseUrl}/verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
        body: '{}',
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ message: 'Verification code sent', expiresIn: 600 });
      expect(body.code).toBeUndefined();

      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      const [to, code] = mockedSendEmail.mock.calls[0];
      expect(to).toBe('admin@example.com');
      expect(code).toMatch(/^\d{6}$/);
    });

    it('returns 400 VALIDATION_ERROR when the profile has no email', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'test-user-1',
        username: 'admin',
        email: null,
      });

      const res = await fetch(`${baseUrl}/verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
        body: '{}',
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.message).toMatch(/no email/i);
      expect(mockedSendEmail).not.toHaveBeenCalled();
    });

    it('propagates email-send failures as a 500 error (no silent success)', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      mockedSendEmail.mockRejectedValueOnce(new Error('SMTP unavailable'));

      const res = await fetch(`${baseUrl}/verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
        body: '{}',
      });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.code).toBe('INTERNAL_ERROR');
      expect(consoleErrorSpy).toHaveBeenCalled();
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

  describe('PATCH /password', () => {
    it('returns 400 VALIDATION_ERROR for an invalid verification code', async () => {
      const res = await fetch(`${baseUrl}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ verificationCode: '000000', newPassword: 'newpassword12' }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('VALIDATION_ERROR');
    });
  });
});
