/**
 * Verification Code Service
 *
 * DB-backed storage for 6-digit verification codes used in the password
 * change flow. Codes expire after 10 minutes and are stored hashed (bcrypt),
 * so a database leak never exposes usable plaintext codes.
 *
 * Design decision: persistence lives in Postgres (Prisma) instead of a
 * process-local Map so codes survive across serverless invocations on Vercel.
 * The strict auth limiter (5 tries/15 min per IP) still mitigates brute-forcing
 * the 6-digit code.
 */

import { randomInt } from 'node:crypto';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

/** Code lifetime in seconds (10 minutes). */
const CODE_TTL_SECONDS = 10 * 60;

/** bcrypt cost for the short-lived 6-digit code (cheaper than password hashing). */
const CODE_HASH_ROUNDS = 10;

class VerificationCodeService {
  /**
   * Generate a 6-digit verification code for a user.
   * Any previous unused code for the same user is deleted so only the newest
   * code is valid (previous codes become unusable immediately).
   *
   * Returns the plaintext code ONLY so the caller can email it. It must never
   * be returned to the HTTP client.
   */
  async generate(userId: string): Promise<{ code: string; expiresIn: number }> {
    // CSPRNG source: crypto.randomInt (never Math.random — predictable codes
    // would allow brute-forcing the password-change flow).
    const code = randomInt(0, 1000000).toString().padStart(6, '0');
    const expiresIn = CODE_TTL_SECONDS;

    // Supersede any pending code: at most one active code per user.
    await prisma.verificationCode.deleteMany({
      where: { userId, used: false },
    });

    await prisma.verificationCode.create({
      data: {
        userId,
        codeHash: await bcrypt.hash(code, CODE_HASH_ROUNDS),
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    return { code, expiresIn };
  }

  /**
   * Validate a verification code for a user.
   * Throws ValidationError (HTTP 400) for each failure mode — never a 500.
   * Marks the code as used (single-use) on success.
   */
  async validate(userId: string, code: string): Promise<void> {
    const entry = await prisma.verificationCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!entry) {
      throw new ValidationError('No verification code found. Please request a new code.');
    }

    if (entry.used) {
      throw new ValidationError('This verification code has already been used.');
    }

    if (new Date() > entry.expiresAt) {
      await prisma.verificationCode.delete({ where: { id: entry.id } });
      throw new ValidationError('Verification code has expired. Please request a new code.');
    }

    const isMatch = await bcrypt.compare(code, entry.codeHash);
    if (!isMatch) {
      throw new ValidationError('Invalid verification code.');
    }

    // Mark as used (single-use)
    await prisma.verificationCode.update({
      where: { id: entry.id },
      data: { used: true },
    });
  }
}

// Singleton instance
export const verificationCodeService = new VerificationCodeService();
