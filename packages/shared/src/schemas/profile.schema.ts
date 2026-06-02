import { z } from 'zod';

/**
 * Schema for updating admin profile
 * At least one of username or email must be provided
 */
export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
  email: z.string().email('Invalid email format').nullable().optional(),
  currentPassword: z.string().min(1, 'Current password is required'),
});

/**
 * Schema for requesting a verification code
 */
export const sendVerificationCodeSchema = z.object({});

/**
 * Schema for changing password with verification code
 */
export const changePasswordSchema = z.object({
  verificationCode: z.string().length(6, 'Code must be exactly 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Types inferred from schemas
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SendVerificationCodeInput = z.infer<typeof sendVerificationCodeSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Response types
 */
export interface UpdateProfileResponse {
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN';
}

export interface SendVerificationCodeResponse {
  code: string;
  expiresIn: number;
}

export interface ChangePasswordResponse {
  message: string;
}
