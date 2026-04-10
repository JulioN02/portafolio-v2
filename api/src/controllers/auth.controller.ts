import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { login, getUserById } from '../services/auth.service.js';
import { loginSchema } from '@jsoft/shared';
import { ZodError } from 'zod';

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials = loginSchema.parse(req.body);
    const result = await login(credentials);
    
    res.json(result);
  } catch (error) {
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

export const meHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
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
      role: 'ADMIN',
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};