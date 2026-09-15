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

  describe('changePasswordSchema (new contract)', () => {
    it('rejects a newPassword shorter than 12 characters', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'old-pass',
        newPassword: 'elevenchars',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
      }
    });

    it('accepts a newPassword of 12 characters with currentPassword only', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'old-pass',
        newPassword: 'twelvechars12',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.newPassword).toBe('twelvechars12');
      }
    });

    it('rejects both a TOTP code and a recovery code together', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'old-pass',
        totpCode: '123456',
        recoveryCode: 'ABCD-2345',
        newPassword: 'twelvechars12',
      });
      expect(result.success).toBe(false);
    });
  });
});