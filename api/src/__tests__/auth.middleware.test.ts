import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AuthError } from '../utils/errors';

/**
 * Unit tests for the fail-closed JWT verification behavior
 * (admin-auth capability):
 *  - JWT_SECRET missing → AuthError BEFORE any jwt.verify attempt
 *    (no empty-string fallback).
 *  - Algorithms pinned to HS256.
 */
describe('authMiddleware (fail closed)', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects when JWT_SECRET is missing WITHOUT calling jwt.verify', () => {
    delete process.env.JWT_SECRET;
    const verifySpy = jest.spyOn(jwt, 'verify');
    const next = jest.fn();
    const req = { headers: { authorization: 'Bearer some-token' } } as AuthRequest;

    authMiddleware(req, {} as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AuthError);
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it('verifies with the configured secret and pins algorithms to HS256', () => {
    const decoded = { userId: 'u1', username: 'admin', role: 'ADMIN' as const };
    const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValue(decoded as never);
    const next = jest.fn();
    const req = { headers: { authorization: 'Bearer my-token' } } as AuthRequest;

    authMiddleware(req, {} as never, next);

    expect(verifySpy).toHaveBeenCalledWith('my-token', 'test-secret', {
      algorithms: ['HS256'],
    });
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(decoded);
  });
});