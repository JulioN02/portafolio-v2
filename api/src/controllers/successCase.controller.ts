import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { successCaseService } from '../services/successCase.service.js';
import { successCaseSchema, successCaseUpdateSchema, successCaseFilterSchema } from '@jsoft/shared';

// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

export const successCaseController = {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filter = successCaseFilterSchema.parse(req.query);
      const result = await successCaseService.findAll(filter);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid filter parameters', details: error.flatten().fieldErrors });
        return;
      }
      console.error('SuccessCase findAll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = getStringParam(req.params.slug);
      const successCase = await successCaseService.findBySlug(slug);
      if (!successCase) {
        res.status(404).json({ error: 'Success case not found' });
        return;
      }
      res.json(successCase);
    } catch (error) {
      console.error('SuccessCase findBySlug error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findRecent(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const successCases = await successCaseService.findRecent(limit);
      res.json(successCases);
    } catch (error) {
      console.error('SuccessCase findRecent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const successCase = await successCaseService.findById(id);
      if (!successCase) {
        res.status(404).json({ error: 'Success case not found' });
        return;
      }
      res.json(successCase);
    } catch (error) {
      console.error('SuccessCase findById error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = successCaseSchema.parse(req.body);
      const successCase = await successCaseService.create(data);
      res.status(201).json(successCase);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('SuccessCase create error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const data = successCaseUpdateSchema.parse(req.body);
      
      const existing = await successCaseService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Success case not found' });
        return;
      }
      
      const successCase = await successCaseService.update(id, data);
      res.json(successCase);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('SuccessCase update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      const existing = await successCaseService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Success case not found' });
        return;
      }
      
      await successCaseService.softDelete(id);
      res.json({ message: 'Success case deleted successfully' });
    } catch (error) {
      console.error('SuccessCase delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      const existing = await successCaseService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Success case not found' });
        return;
      }
      
      const successCase = await successCaseService.restore(id);
      res.json(successCase);
    } catch (error) {
      console.error('SuccessCase restore error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
