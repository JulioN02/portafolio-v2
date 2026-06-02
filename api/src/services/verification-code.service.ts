/**
 * Verification Code Service
 *
 * In-memory storage for 6-digit verification codes used in the
 * password change flow. Codes expire after 10 minutes.
 *
 * Design decision: In-memory Map is sufficient for single-admin panel.
 * See design.md for rationale.
 */

interface VerificationCodeEntry {
  code: string;
  expiresAt: Date;
  used: boolean;
}

class VerificationCodeService {
  private store = new Map<string, VerificationCodeEntry>();

  /**
   * Generate a 6-digit verification code for a user.
   * Overwrites any previous unexpired code for the same user.
   */
  generate(userId: string): { code: string; expiresIn: number } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = 10 * 60; // 10 minutes in seconds

    this.store.set(userId, {
      code,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      used: false,
    });

    return { code, expiresIn };
  }

  /**
   * Validate a verification code for a user.
   * Throws with descriptive messages for each failure mode.
   */
  validate(userId: string, code: string): void {
    const entry = this.store.get(userId);

    if (!entry) {
      throw new Error('No verification code found. Please request a new code.');
    }

    if (entry.used) {
      throw new Error('This verification code has already been used.');
    }

    if (new Date() > entry.expiresAt) {
      this.store.delete(userId);
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (entry.code !== code) {
      throw new Error('Invalid verification code.');
    }

    // Mark as used (single-use)
    entry.used = true;
  }

  /**
   * Get the number of stored codes (for testing/debugging).
   */
  get size(): number {
    return this.store.size;
  }
}

// Singleton instance
export const verificationCodeService = new VerificationCodeService();
