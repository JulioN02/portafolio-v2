import { z } from 'zod';

/**
 * Body for POST /auth/2fa/enable — verifies the pending TOTP secret.
 */
export const twoFactorEnableBodySchema = z.object({
  totpCode: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

/**
 * Body for POST /auth/2fa/disable — requires re-authentication.
 */
export const twoFactorDisableBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  totpCode: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

/**
 * Body for PATCH /auth/password.
 *
 * Shape enforced here (currentPassword required, newPassword >= 12, well-formed
 * optional TOTP/recovery codes, at most one of them). The state-dependent rule
 * ("exactly one required when 2FA is enabled") is enforced in the API service,
 * which is the only place that knows the user's 2FA state.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    totpCode: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits').optional(),
    recoveryCode: z
      .string()
      .regex(/^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/, 'Invalid recovery code format')
      .optional(),
    newPassword: z.string().min(12, 'Password must be at least 12 characters'),
  })
  .superRefine((value, ctx) => {
    if (value.totpCode && value.recoveryCode) {
      ctx.addIssue({
        code: 'custom',
        path: ['totpCode'],
        message: 'Provide either a TOTP code or a recovery code, not both',
      });
    }
  });

/**
 * Types inferred from schemas
 */
export type TwoFactorEnableInput = z.infer<typeof twoFactorEnableBodySchema>;
export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableBodySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Response types
 */
export interface TwoFactorSetupResponse {
  otpauthUrl: string;
  qrDataUrl: string;
  secret: string;
}

export interface TwoFactorEnableResponse {
  recoveryCodes: string[];
  message: string;
}

export interface TwoFactorDisableResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}