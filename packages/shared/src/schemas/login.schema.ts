import { z } from 'zod';

/**
 * Schema for admin login
 * Validates username and password
 */
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Schema for login response (JWT payload)
 */
export const jwtPayloadSchema = z.object({
  userId: z.string(),
  username: z.string(),
  role: z.enum(['ADMIN']).default('ADMIN'),
});

/**
 * Type inferred from schemas
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

/**
 * Login response type
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: 'ADMIN';
  };
}