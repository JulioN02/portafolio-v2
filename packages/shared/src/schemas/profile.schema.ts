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
 * Types inferred from schemas
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Response types
 */
export interface UpdateProfileResponse {
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN';
  twoFactorEnabled: boolean;
}