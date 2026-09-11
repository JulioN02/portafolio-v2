import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { verificationCodeService } from '../services/verification-code.service';
import { ValidationError } from '../utils/errors';

const mockPrisma = new PrismaClient();

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

/** Asserts the rejected error is a ValidationError carrying HTTP 400. */
async function expectValidationError(fn: () => Promise<unknown>): Promise<ValidationError> {
  let thrown: unknown;
  try {
    await fn();
  } catch (err) {
    thrown = err;
  }
  expect(thrown).toBeInstanceOf(ValidationError);
  const error = thrown as ValidationError;
  expect(error.statusCode).toBe(400);
  expect(error.code).toBe('VALIDATION_ERROR');
  return error;
}

describe('VerificationCodeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue('hashed-code' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    (mockPrisma.verificationCode.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (mockPrisma.verificationCode.create as jest.Mock).mockResolvedValue({ id: 'vc-1' });
    (mockPrisma.verificationCode.update as jest.Mock).mockResolvedValue({ id: 'vc-1' });
    (mockPrisma.verificationCode.delete as jest.Mock).mockResolvedValue({ id: 'vc-1' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate a 6-digit code with 600s expiry', async () => {
    const result = await verificationCodeService.generate('test-user-1');
    expect(result.code).toMatch(/^\d{6}$/);
    expect(result.code.length).toBe(6);
    expect(result.expiresIn).toBe(600);
  });

  it('stores only a bcrypt hash of the code, never the plaintext', async () => {
    const result = await verificationCodeService.generate('test-user-hash');

    expect(mockedBcrypt.hash).toHaveBeenCalledWith(result.code, 10);
    const createArg = (mockPrisma.verificationCode.create as jest.Mock).mock.calls[0][0] as {
      data: { userId: string; codeHash: string; expiresAt: Date };
    };
    expect(createArg.data.userId).toBe('test-user-hash');
    expect(createArg.data.codeHash).toBe('hashed-code');
    expect(createArg.data.codeHash).not.toBe(result.code);
    expect(createArg.data.expiresAt).toBeInstanceOf(Date);
    expect(createArg.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('supersedes any previous unused code for the same user', async () => {
    await verificationCodeService.generate('test-user-supersede');
    expect(mockPrisma.verificationCode.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'test-user-supersede', used: false },
    });
  });

  it('generates the code with crypto.randomInt (CSPRNG), not Math.random', async () => {
    const spy = jest.spyOn(crypto, 'randomInt').mockReturnValue(123456 as never);
    const result = await verificationCodeService.generate('test-user-csprng');
    expect(spy).toHaveBeenCalledWith(0, 1000000);
    expect(result.code).toBe('123456');
    spy.mockRestore();
  });

  it('should validate a valid code and mark it used', async () => {
    (mockPrisma.verificationCode.findFirst as jest.Mock).mockResolvedValue({
      id: 'vc-valid',
      userId: 'test-user-2',
      codeHash: 'hashed-code',
      expiresAt: new Date(Date.now() + 60_000),
      used: false,
    });
    mockedBcrypt.compare.mockResolvedValue(true as never);

    await expect(verificationCodeService.validate('test-user-2', '123456')).resolves.toBeUndefined();

    expect(mockedBcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-code');
    expect(mockPrisma.verificationCode.update).toHaveBeenCalledWith({
      where: { id: 'vc-valid' },
      data: { used: true },
    });
  });

  it('throws ValidationError (400) when no code was requested', async () => {
    (mockPrisma.verificationCode.findFirst as jest.Mock).mockResolvedValue(null);
    await expectValidationError(() => verificationCodeService.validate('nonexistent', '123456'));
  });

  it('throws ValidationError (400) for a wrong code', async () => {
    (mockPrisma.verificationCode.findFirst as jest.Mock).mockResolvedValue({
      id: 'vc-wrong',
      userId: 'test-user-3',
      codeHash: 'hashed-code',
      expiresAt: new Date(Date.now() + 60_000),
      used: false,
    });
    mockedBcrypt.compare.mockResolvedValue(false as never);

    await expectValidationError(() => verificationCodeService.validate('test-user-3', '000000'));
    expect(mockPrisma.verificationCode.update).not.toHaveBeenCalled();
  });

  it('throws ValidationError (400) for an already used code', async () => {
    (mockPrisma.verificationCode.findFirst as jest.Mock).mockResolvedValue({
      id: 'vc-used',
      userId: 'test-user-4',
      codeHash: 'hashed-code',
      expiresAt: new Date(Date.now() + 60_000),
      used: true,
    });

    await expectValidationError(() => verificationCodeService.validate('test-user-4', '123456'));
  });

  it('throws ValidationError (400) for an expired code', async () => {
    (mockPrisma.verificationCode.findFirst as jest.Mock).mockResolvedValue({
      id: 'vc-expired',
      userId: 'test-user-expired',
      codeHash: 'hashed-code',
      expiresAt: new Date(Date.now() - 1_000),
      used: false,
    });

    await expectValidationError(() =>
      verificationCodeService.validate('test-user-expired', '123456'),
    );
    expect(mockPrisma.verificationCode.delete).toHaveBeenCalledWith({ where: { id: 'vc-expired' } });
  });

  it('generates different codes on successive calls', async () => {
    const result1 = await verificationCodeService.generate('test-user-5');
    const result2 = await verificationCodeService.generate('test-user-5');
    // Second call supersedes the first, but codes could theoretically match
    // (very unlikely with 1e6 possibilities)
    expect(result1.code).not.toBe(result2.code);
  });
});
