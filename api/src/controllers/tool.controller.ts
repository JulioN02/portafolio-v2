import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { toolService } from '../services/tool.service.js';
import { toolSchema, toolUpdateSchema, toolFilterSchema } from '@jsoft/shared';

// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

export const toolController = {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filter = toolFilterSchema.parse(req.query);
      const result = await toolService.findAll(filter);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid filter parameters', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Tool findAll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = getStringParam(req.params.slug);
      const tool = await toolService.findBySlug(slug);
      if (!tool) {
        res.status(404).json({ error: 'Tool not found' });
        return;
      }
      res.json(tool);
    } catch (error) {
      console.error('Tool findBySlug error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findFeatured(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const tools = await toolService.findFeatured(limit);
      res.json(tools);
    } catch (error) {
      console.error('Tool findFeatured error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const tool = await toolService.findById(id);
      if (!tool) {
        res.status(404).json({ error: 'Tool not found' });
        return;
      }
      res.json(tool);
    } catch (error) {
      console.error('Tool findById error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = toolSchema.parse(req.body);
      const tool = await toolService.create(data);
      res.status(201).json(tool);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Tool create error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const data = toolUpdateSchema.parse(req.body);
      
      const existing = await toolService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Tool not found' });
        return;
      }
      
      const tool = await toolService.update(id, data);
      res.json(tool);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Tool update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      const existing = await toolService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Tool not found' });
        return;
      }
      
      await toolService.softDelete(id);
      res.json({ message: 'Tool deleted successfully' });
    } catch (error) {
      console.error('Tool delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      const existing = await toolService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Tool not found' });
        return;
      }
      
      const tool = await toolService.restore(id);
      res.json(tool);
    } catch (error) {
      console.error('Tool restore error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async reorder(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const { order } = req.body;
      
      if (typeof order !== 'number') {
        res.status(400).json({ error: 'Order must be a number' });
        return;
      }
      
      const tool = await toolService.reorder(id, order);
      res.json(tool);
    } catch (error) {
      console.error('Tool reorder error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getClassifications(_req: Request, res: Response): Promise<void> {
    try {
      const classifications = await toolService.getClassifications();
      res.json(classifications);
    } catch (error) {
      console.error('Tool getClassifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
