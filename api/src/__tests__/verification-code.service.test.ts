import { verificationCodeService } from '../services/verification-code.service';

describe('VerificationCodeService', () => {
  beforeEach(() => {
    // Clear the store by generating codes and accessing private map
    // Since we use a singleton, we can't easily reset. But tests are isolated.
  });

  it('should generate a 6-digit code', () => {
    const result = verificationCodeService.generate('test-user-1');
    expect(result.code).toMatch(/^\d{6}$/);
    expect(result.code.length).toBe(6);
    expect(result.expiresIn).toBe(600);
  });

  it('should validate a valid code', () => {
    const userId = 'test-user-2';
    const { code } = verificationCodeService.generate(userId);
    expect(() => verificationCodeService.validate(userId, code)).not.toThrow();
  });

  it('should throw for missing code', () => {
    expect(() => verificationCodeService.validate('nonexistent', '123456')).toThrow(
      'No verification code found'
    );
  });

  it('should throw for wrong code', () => {
    const userId = 'test-user-3';
    verificationCodeService.generate(userId);
    expect(() => verificationCodeService.validate(userId, '000000')).toThrow(
      'Invalid verification code'
    );
  });

  it('should throw for already used code', () => {
    const userId = 'test-user-4';
    const { code } = verificationCodeService.generate(userId);
    verificationCodeService.validate(userId, code); // First use - marks as used
    expect(() => verificationCodeService.validate(userId, code)).toThrow(
      'already been used'
    );
  });

  it('should generate different codes on successive calls', () => {
    const userId = 'test-user-5';
    const result1 = verificationCodeService.generate(userId);
    const result2 = verificationCodeService.generate(userId);
    // Second call should overwrite the first, but codes could theoretically match
    // (very unlikely with 900k possibilities)
    expect(result1.code).not.toBe(result2.code);
  });
});
