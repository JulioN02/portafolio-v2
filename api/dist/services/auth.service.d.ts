import { LoginInput, LoginResponse, UpdateProfileInput, ChangePasswordInput } from '@jsoft/shared';
export declare const login: (credentials: LoginInput) => Promise<LoginResponse>;
export declare const getUserById: (userId: string) => Promise<{
    id: string;
    username: string;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
} | null>;
/**
 * Update user profile (username, email).
 * Requires currentPassword verification.
 */
export declare const updateProfile: (userId: string, data: UpdateProfileInput) => Promise<{
    id: string;
    username: string;
    email: string | null;
    role: "ADMIN";
}>;
/**
 * Change password using verification code.
 */
export declare const changePassword: (userId: string, data: ChangePasswordInput) => Promise<{
    message: string;
}>;
//# sourceMappingURL=auth.service.d.ts.map