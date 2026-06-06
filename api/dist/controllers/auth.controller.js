import { login, getUserById, updateProfile, changePassword } from '../services/auth.service.js';
import { verificationCodeService } from '../services/verification-code.service.js';
import { loginSchema, updateProfileSchema, changePasswordSchema } from '@jsoft/shared';
import { ZodError } from 'zod';
export const loginHandler = async (req, res) => {
    try {
        const credentials = loginSchema.parse(req.body);
        const result = await login(credentials);
        res.json(result);
    }
    catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                error: 'Validation Error',
                details: error.flatten().fieldErrors,
            });
            return;
        }
        if (error instanceof Error && error.message === 'Invalid credentials') {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const meHandler = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const user = await getUserById(authReq.user.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: 'ADMIN',
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const updateProfileHandler = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const data = updateProfileSchema.parse(req.body);
        const result = await updateProfile(authReq.user.userId, data);
        res.json(result);
    }
    catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                error: 'Validation Error',
                details: error.flatten().fieldErrors,
            });
            return;
        }
        if (error instanceof Error) {
            const message = error.message;
            if (message === 'Invalid credentials') {
                res.status(401).json({ error: 'Current password is incorrect' });
                return;
            }
            if (message === 'Username already taken' || message === 'Email already taken') {
                res.status(409).json({ error: message });
                return;
            }
            if (message === 'User not found') {
                res.status(404).json({ error: message });
                return;
            }
            if (message === 'No fields to update') {
                res.status(400).json({ error: message });
                return;
            }
        }
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const sendVerificationCodeHandler = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const result = verificationCodeService.generate(authReq.user.userId);
        console.log(`[DEV] Verification code for user ${authReq.user.userId}: ${result.code}`);
        res.json(result);
    }
    catch (error) {
        console.error('Send verification code error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const changePasswordHandler = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const data = changePasswordSchema.parse(req.body);
        const result = await changePassword(authReq.user.userId, data);
        res.json(result);
    }
    catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                error: 'Validation Error',
                details: error.flatten().fieldErrors,
            });
            return;
        }
        if (error instanceof Error) {
            const message = error.message;
            if (message.includes('verification code') ||
                message.includes('expired') ||
                message.includes('already been used')) {
                res.status(400).json({ error: message });
                return;
            }
        }
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=auth.controller.js.map