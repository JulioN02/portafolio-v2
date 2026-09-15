import { totpService } from '../services/totp.service';
import { PrismaClient } from '@prisma/client';
import { ValidationError, AppError } from '../utils/errors';

const mockPrisma = new PrismaClient();

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import bcrypt from 'bcrypt';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(),
    keyuri: jest.fn(),
    check: jest.fn(),
    options: {},
  },
}));

import otplib from 'otplib';
const mockedAuthenticator = (otplib as unknown as { authenticator: Record<string, jest.Mock | Record<string, unknown>> }).authenticator;

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
}));

import QRCode from 'qrcode';
const mockedToDataURL = (QRCode as unknown as { toDataURL: jest.Mock }).toDataURL;

const TEST_KEY_B64 = Buffer.alloc(32, 7).toString('base64'); // fixed 32-byte key

describe('totpService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TOTP_ENCRYPTION_KEY = TEST_KEY_B64;
  });

  describe('encryptSecret / decryptSecret (AES-256-GCM)', () => {
    it('round-trips a secret: decrypt(encrypt(secret)) === secret', () => {
      const encrypted = totpService.encryptSecret('JBSWY3DPEHPK3PXP');
      expect(totpService.decryptSecret(encrypted)).toBe('JBSWY3DPEHPK3PXP');
    });

    it('round-trips a different secret value (triangulation)', () => {
      const encrypted = totpService.encryptSecret('GEZDGNBVGY3TQOJQ');
      expect(totpService.decryptSecret(encrypted)).toBe('GEZDGNBVGY3TQOJQ');
    });

    it('stores the ciphertext as base64 iv:tag:ciphertext (3 segments)', () => {
      const encrypted = totpService.encryptSecret('SECRET');
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);
      for (const segment of parts) {
        expect(Buffer.from(segment, 'base64').toString('base64')).toBe(segment);
      }
      // iv = 12 bytes (16 b64 chars), tag = 16 bytes (24 b64 chars)
      expect(Buffer.from(parts[0], 'base64')).toHaveLength(12);
      expect(Buffer.from(parts[1], 'base64')).toHaveLength(16);
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('throws AppError(500) when the ciphertext has been tampered with', () => {
      const encrypted = totpService.encryptSecret('SECRET');
      const parts = encrypted.split(':');
      const tamperedCt = (Buffer.from(parts[2], 'base64')[0] ^ 0xff).toString(16).padStart(2, '0') + parts[2].slice(1);
      const tampered = `${parts[0]}:${parts[1]}:${tamperedCt}`;

      expect(() => totpService.decryptSecret(tampered)).toThrow(
        expect.objectContaining({ statusCode: 500, code: 'INTERNAL_ERROR' }),
      );
    });

    it('throws AppError(500) when TOTP_ENCRYPTION_KEY is missing (fail closed)', () => {
      delete process.env.TOTP_ENCRYPTION_KEY;
      expect(() => totpService.encryptSecret('SECRET')).toThrow(
        expect.objectContaining({ statusCode: 500 }),
      );
    });

    it('throws AppError(500) when TOTP_ENCRYPTION_KEY is not a 32-byte key', () => {
      process.env.TOTP_ENCRYPTION_KEY = Buffer.alloc(16, 1).toString('base64');
      expect(() => totpService.encryptSecret('SECRET')).toThrow(
        expect.objectContaining({ statusCode: 500 }),
      );
    });
  });

  describe('generateSecret / generateKeyUri / generateQrDataUrl', () => {
    it('generates a base32 secret via otplib', () => {
      (mockedAuthenticator.generateSecret as jest.Mock).mockReturnValue('JBSWY3DPEHPK3PXP');
      expect(totpService.generateSecret()).toBe('JBSWY3DPEHPK3PXP');
      expect(mockedAuthenticator.generateSecret).toHaveBeenCalledTimes(1);
    });

    it('builds the otpauth URI with issuer "JSoft Solutions"', () => {
      (mockedAuthenticator.keyuri as jest.Mock).mockReturnValue('otpauth://totp/...');
      const uri = totpService.generateKeyUri('admin', 'JBSWY3DPEHPK3PXP');
      expect(uri).toBe('otpauth://totp/...');
      expect(mockedAuthenticator.keyuri).toHaveBeenCalledWith('admin', 'JSoft Solutions', 'JBSWY3DPEHPK3PXP');
    });

    it('returns a QR data URL from the otpauth URI', async () => {
      mockedToDataURL.mockResolvedValue('data:image/png;base64,AAA');
      const dataUrl = await totpService.generateQrDataUrl('otpauth://totp/...');
      expect(dataUrl).toBe('data:image/png;base64,AAA');
      expect(mockedToDataURL).toHaveBeenCalledWith('otpauth://totp/...');
    });
  });

  describe('verifyTotp', () => {
    it('accepts a valid code within window 1', async () => {
      (mockedAuthenticator.check as jest.Mock).mockReturnValue(true);
      await expect(totpService.verifyTotp('123456', 'SECRET')).resolves.toBeUndefined();
      expect(mockedAuthenticator.check).toHaveBeenCalledWith('123456', 'SECRET');
    });

    it('throws ValidationError for an invalid code', async () => {
      (mockedAuthenticator.check as jest.Mock).mockReturnValue(false);
      await expect(totpService.verifyTotp('000000', 'SECRET')).rejects.toThrow(ValidationError);
    });

    it('configures a window of 1 for clock-skew tolerance', () => {
      totpService.verifyTotp('123456', 'SECRET').catch(() => undefined);
      expect(mockedAuthenticator.options).toEqual(expect.objectContaining({ window: 1 }));
    });
  });

  describe('generateRecoveryCodes', () => {
    it('generates exactly 10 unique codes in XXXX-XXXX format', () => {
      const codes = totpService.generateRecoveryCodes();
      expect(codes).toHaveLength(10);
      expect(new Set(codes).size).toBe(10);
      for (const code of codes) {
        expect(code).toMatch(/^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/);
      }
    });

    it('uses an unambiguous alphabet (no 0/O/1/I/L)', () => {
      const codes = totpService.generateRecoveryCodes();
      const allChars = codes.join('').replace(/-/g, '');
      for (const excluded of ['0', 'O', '1', 'I', 'L']) {
        expect(allChars).not.toContain(excluded);
      }
    });

    it('supports a custom count (triangulation)', () => {
      const codes = totpService.generateRecoveryCodes(3);
      expect(codes).toHaveLength(3);
      expect(new Set(codes).size).toBe(3);
    });
  });

  describe('hashRecoveryCode / verifyRecoveryCode / consumeRecoveryCode', () => {
    it('hashes a recovery code with bcrypt cost 10', async () => {
      mockedBcrypt.hash.mockResolvedValue('hash-abc' as never);
      await expect(totpService.hashRecoveryCode('ABCD-2345')).resolves.toBe('hash-abc');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('ABCD-2345', 10);
    });

    it('returns the matching hash when a code matches one of the stored hashes', async () => {
      mockedBcrypt.compare.mockResolvedValueOnce(false as never).mockResolvedValueOnce(true as never);
      const matched = await totpService.verifyRecoveryCode('ABCD-2345', ['hash-1', 'hash-2']);
      expect(matched).toBe('hash-2');
      expect(mockedBcrypt.compare).toHaveBeenCalledTimes(2);
    });

    it('returns null when no stored hash matches', async () => {
      mockedBcrypt.compare.mockResolvedValue(false as never);
      const matched = await totpService.verifyRecoveryCode('ABCD-2345', ['hash-1', 'hash-2']);
      expect(matched).toBeNull();
    });

    it('consumes a recovery code by removing the matched hash from the array', async () => {
      await totpService.consumeRecoveryCode('u1', ['hash-1', 'hash-2'], 'hash-2');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { recoveryCodes: { set: ['hash-1'] } },
      });
    });
  });
});