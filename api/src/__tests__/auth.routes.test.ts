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
  });
});