/**
 * TOTP 2FA Service
 *
 * Owns every TOTP / recovery-code primitive used by the auth service:
 *  - otplib authenticator (30s step, 6 digits, window 1) for secret generation,
 *    otpauth URI building and code verification.
 *  - AES-256-GCM (node:crypto, zero new dep) to encrypt the secret at rest.
 *    Storage format: `iv:tag:ciphertext`, each segment base64. The key comes
 *    from TOTP_ENCRYPTION_KEY (base64 of 32 random bytes) and FAILS CLOSED
 *    (HTTP 500) when missing or malformed — an unencrypted secret must never
 *    be written.
 *  - 10 single-use recovery codes (XXXX-XXXX, CSPRNG, unambiguous alphabet),
 *    stored only as bcrypt(10) hashes and removed from the array on use.
 *
 * The plaintext secret is never logged and never returned after setup.
 */

import otplib from 'otplib';
import QRCode from 'qrcode';
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { AppError, ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

const { authenticator } = otplib;

/** Clock-skew tolerance: ±1 step (90s) around the current 30s window. */
authenticator.options = { window: 1, step: 30, digits: 6 };

/** bcrypt cost for recovery codes — matches the repo convention (10). */
const RECOVERY_HASH_ROUNDS = 10;

/** Unambiguous alphabet: no 0/O/1/I/L (easy to mistype/confuse). */
const RECOVERY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const RECOVERY_ALPHABET_LENGTH = RECOVERY_ALPHABET.length;

/** Issuer label shown in authenticator apps. */
const TOTP_ISSUER = 'JSoft Solutions';

/** Encryption key: base64 of 32 random bytes. Fail loudly (500) if unset/malformed. */
function getEncryptionKey(): Buffer {
  const raw = process.env.TOTP_ENCRYPTION_KEY;
  if (!raw) {
    throw new AppError('TOTP_ENCRYPTION_KEY is not configured', 500, 'INTERNAL_ERROR');
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new AppError('TOTP_ENCRYPTION_KEY must be a base64-encoded 32-byte key', 500, 'INTERNAL_ERROR');
  }
  return key;
}

/** Sample one character from the unambiguous alphabet (rejection sampling). */
function sampleRecoveryChar(): string {
  // 31 chars -> accept bytes < 248 (31 * 8) to keep the distribution uniform.
  let byte = randomBytes(1)[0];
  while (byte >= RECOVERY_ALPHABET_LENGTH * 8) {
    byte = randomBytes(1)[0];
  }
  return RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET_LENGTH];
}

function generateOneRecoveryCode(): string {
  const chars = Array.from({ length: 8 }, sampleRecoveryChar);
  return chars.slice(0, 4).join('') + '-' + chars.slice(4).join('');
}

export const totpService = {
  /** Generate a base32 TOTP secret via otplib. */
  generateSecret(): string {
    return authenticator.generateSecret();
  },

  /**
   * Encrypt a TOTP secret with AES-256-GCM.
   * Output: `iv:tag:ciphertext` — each segment base64 (no AAD; single-tenant).
   */
  encryptSecret(secret: string): string {
    const key = getEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString('base64'), tag.toString('base64'), ciphertext.toString('base64')].join(':');
  },

  /**
   * Decrypt a TOTP secret stored by encryptSecret. Any tag mismatch (tampering,
   * corruption, wrong key) surfaces as AppError 500 — an ops problem, never a
   * silent wrong secret.
   */
  decryptSecret(stored: string): string {
    const key = getEncryptionKey();
    const parts = stored.split(':');
    if (parts.length !== 3) {
      throw new AppError('Stored TOTP secret is corrupt', 500, 'INTERNAL_ERROR');
    }
    try {
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(parts[0], 'base64'));
      decipher.setAuthTag(Buffer.from(parts[1], 'base64'));
      return Buffer.concat([
        decipher.update(Buffer.from(parts[2], 'base64')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new AppError('Stored TOTP secret is corrupt', 500, 'INTERNAL_ERROR');
    }
  },

  /** Build the otpauth:// URI for authenticator apps. */
  generateKeyUri(username: string, secret: string): string {
    return authenticator.keyuri(username, TOTP_ISSUER, secret);
  },

  /** Render the otpauth URI as a PNG data URL (server-side, no frontend dep). */
  generateQrDataUrl(uri: string): Promise<string> {
    return QRCode.toDataURL(uri);
  },

  /**
   * Verify a TOTP code against the plaintext secret (window 1).
   * Throws ValidationError (400) on invalid/expired codes — never a 500.
   */
  async verifyTotp(code: string, secret: string): Promise<void> {
    const valid = authenticator.check(code, secret);
    if (!valid) {
      throw new ValidationError('Invalid or expired verification code');
    }
  },

  /** Generate `n` (default 10) pairwise-distinct recovery codes `XXXX-XXXX`. */
  generateRecoveryCodes(n = 10): string[] {
    const codes = new Set<string>();
    while (codes.size < n) {
      codes.add(generateOneRecoveryCode());
    }
    return [...codes];
  },

  /** Hash a recovery code with bcrypt cost 10 (compare-only; never recoverable). */
  hashRecoveryCode(code: string): Promise<string> {
    return bcrypt.hash(code, RECOVERY_HASH_ROUNDS);
  },

  /**
   * Verify a recovery code against the stored bcrypt hashes.
   * Returns the matching hash (so the caller can consume it) or null.
   */
  async verifyRecoveryCode(code: string, hashes: string[]): Promise<string | null> {
    for (const hash of hashes) {
      if (await bcrypt.compare(code, hash)) {
        return hash;
      }
    }
    return null;
  },

  /**
   * Consume a recovery code: remove its hash from the user's array (single-use,
   * atomic `set` update — concurrent double-use cannot both succeed).
   */
  async consumeRecoveryCode(
    userId: string,
    currentHashes: string[],
    matchedHash: string,
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { recoveryCodes: { set: currentHashes.filter((h) => h !== matchedHash) } },
    });
  },
};
