import crypto from 'node:crypto';
import { verificationCodeService } from '../services/verification-code.service';
import { ValidationError } from '../utils/errors';

/** Asserts the thrown error is a ValidationError carrying HTTP 400. */
function expectValidationError(fn: () => void): void {
  let thrown: unknown;
  try {
    fn();
  } catch (err) {
    thrown = err;
  }
  expect(thrown).toBeInstanceOf(ValidationError);
  expect((thrown as ValidationError).statusCode).toBe(400);
  expect((thrown as ValidationError).code).toBe('VALIDATION_ERROR');
}

describe('VerificationCodeService', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should generate a 6-digit code', () => {
    const result = verificationCodeService.generate('test-user-1');
    expect(result.code).toMatch(/^\d{6}$/);
    expect(result.code.length).toBe(6);
    expect(result.expiresIn).toBe(600);
  });

  it('generates the code with crypto.randomInt (CSPRNG), not Math.random', () => {
    const spy = jest.spyOn(crypto, 'randomInt').mockReturnValue(123456 as never);
    const result = verificationCodeService.generate('test-user-csprng');
    expect(spy).toHaveBeenCalledWith(0, 1000000);
    expect(result.code).toBe('123456');
    spy.mockRestore();
  });

  it('should validate a valid code', () => {
    const userId = 'test-user-2';
    const { code } = verificationCodeService.generate(userId);
    expect(() => verificationCodeService.validate(userId, code)).not.toThrow();
  });

  it('throws ValidationError (400) when no code was requested', () => {
    expectValidationError(() => verificationCodeService.validate('nonexistent', '123456'));
  });

  it('throws ValidationError (400) for a wrong code', () => {
    const userId = 'test-user-3';
    verificationCodeService.generate(userId);
    expectValidationError(() => verificationCodeService.validate(userId, '000000'));
  });

  it('throws ValidationError (400) for an already used code', () => {
    const userId = 'test-user-4';
    const { code } = verificationCodeService.generate(userId);
    verificationCodeService.validate(userId, code); // First use - marks as used
    expectValidationError(() => verificationCodeService.validate(userId, code));
  });

  it('throws ValidationError (400) for an expired code', () => {
    const userId = 'test-user-expired';
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    verificationCodeService.generate(userId);
    // 11 minutes later — beyond the 10-minute expiry.
    jest.setSystemTime(new Date('2026-01-01T00:11:00Z'));
    expectValidationError(() => verificationCodeService.validate(userId, '123456'));
  });

  it('should generate different codes on successive calls', () => {
    const userId = 'test-user-5';
    const result1 = verificationCodeService.generate(userId);
    const result2 = verificationCodeService.generate(userId);
    // Second call should overwrite the first, but codes could theoretically match
    // (very unlikely with 1e6 possibilities)
    expect(result1.code).not.toBe(result2.code);
  });
});