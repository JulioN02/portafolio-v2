import { describe, it, expect } from 'vitest';
import { loginSchema, changePasswordSchema } from '../index';

/**
 * Password policy hardening: admin credentials must be >= 12 characters
 * (admin-credential-hardening capability).
 */
describe('Password policy (min 12)', () => {
  describe('loginSchema.password', () => {
    it('rejects a password shorter than 12 characters', () => {
      const result = loginSchema.safeParse({ username: 'admin', password: 'elevenchars' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });

    it('accepts a password of exactly 12 characters', () => {
      const result = loginSchema.safeParse({ username: 'admin', password: 'twelvechars12' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('twelvechars12');
      }
    });
  });

  describe('changePasswordSchema.newPassword', () => {
    it('rejects a newPassword shorter than 12 characters', () => {
      const result = changePasswordSchema.safeParse({
        verificationCode: '123456',
        newPassword: 'elevenchars',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
      }
    });

    it('accepts a newPassword of 12 characters with a valid 6-digit code', () => {
      const result = changePasswordSchema.safeParse({
        verificationCode: '123456',
        newPassword: 'twelvechars12',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.newPassword).toBe('twelvechars12');
      }
    });
  });
});