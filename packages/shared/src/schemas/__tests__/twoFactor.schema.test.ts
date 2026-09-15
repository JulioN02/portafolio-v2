import { describe, it, expect } from 'vitest';
import {
  twoFactorEnableBodySchema,
  twoFactorDisableBodySchema,
  changePasswordSchema,
} from '../index';

describe('twoFactorEnableBodySchema', () => {
  it('accepts a 6-digit TOTP code', () => {
    const result = twoFactorEnableBodySchema.safeParse({ totpCode: '123456' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totpCode).toBe('123456');
    }
  });

  it('rejects a 5-digit code', () => {
    const result = twoFactorEnableBodySchema.safeParse({ totpCode: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-digit code', () => {
    const result = twoFactorEnableBodySchema.safeParse({ totpCode: '12a456' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing code', () => {
    const result = twoFactorEnableBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('twoFactorDisableBodySchema', () => {
  it('accepts currentPassword with a 6-digit TOTP code', () => {
    const result = twoFactorDisableBodySchema.safeParse({
      currentPassword: 'current-pass',
      totpCode: '123456',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentPassword).toBe('current-pass');
    }
  });

  it('rejects when currentPassword is missing', () => {
    const result = twoFactorDisableBodySchema.safeParse({ totpCode: '123456' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.currentPassword).toBeDefined();
    }
  });

  it('rejects a malformed TOTP code', () => {
    const result = twoFactorDisableBodySchema.safeParse({
      currentPassword: 'pass',
      totpCode: 'abcdef',
    });
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema (new contract)', () => {
  it('accepts currentPassword + newPassword only (2FA disabled path)', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-pass',
      newPassword: 'twelvechars12',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentPassword).toBe('old-pass');
      expect(result.data.totpCode).toBeUndefined();
      expect(result.data.recoveryCode).toBeUndefined();
    }
  });

  it('accepts a valid TOTP code alongside the new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-pass',
      totpCode: '123456',
      newPassword: 'twelvechars12',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid recovery code alongside the new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-pass',
      recoveryCode: 'ABCD-2345',
      newPassword: 'twelvechars12',
    });
    expect(result.success).toBe(true);
  });

  it('rejects newPassword shorter than 12 characters', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-pass',
      newPassword: 'elevenchars',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
    }
  });

  it('rejects a malformed recovery code format', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-pass',
      recoveryCode: 'ABCD-EFGH-I',
      newPassword: 'twelvechars12',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.recoveryCode).toBeDefined();
    }
  });

  it('rejects both totpCode and recoveryCode together', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-pass',
      totpCode: '123456',
      recoveryCode: 'ABCD-2345',
      newPassword: 'twelvechars12',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some((i) => i.path.includes('totpCode'))).toBe(true);
    }
  });

  it('rejects when currentPassword is missing', () => {
    const result = changePasswordSchema.safeParse({ newPassword: 'twelvechars12' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.currentPassword).toBeDefined();
    }
  });
});