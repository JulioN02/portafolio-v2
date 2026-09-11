import express from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

/**
 * Regression guard for POST /api/auth/verification-code.
 *
 * The route was previously registered WITHOUT authMiddleware (auth.routes.ts),
 * so the handler's `authReq.user` was always undefined → NotFoundError → 404
 * even with a valid Bearer token. The password-change flow was broken in
 * production because of this. This suite pins the correct behavior:
 *  - no token      → 401 (authMiddleware rejects)
 *  - valid token   → 200 + verification code
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

    it('returns 200 with a verification code when authenticated (regression: was 404)', async () => {
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
      expect(body.code).toMatch(/^\d{6}$/);
      expect(body.expiresIn).toBeGreaterThan(0);
    });

    it('does NOT log the verification code when NODE_ENV=production', async () => {
      const logSpy = jest.spyOn(console, 'log');
      process.env.NODE_ENV = 'production';

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
      const logged = logSpy.mock.calls.some((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes(body.code))
      );
      expect(logged).toBe(false);
    });

    it('logs the verification code when NODE_ENV is not production', async () => {
      const logSpy = jest.spyOn(console, 'log');
      process.env.NODE_ENV = 'development';

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
      const logged = logSpy.mock.calls.some((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes(body.code))
      );
      expect(logged).toBe(true);
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