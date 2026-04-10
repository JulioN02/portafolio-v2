import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { serviceService } from '../services/service.service.js';
import { serviceSchema, serviceUpdateSchema, serviceFilterSchema } from '@jsoft/shared';

// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

export const serviceController = {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filter = serviceFilterSchema.parse(req.query);
      const result = await serviceService.findAll(filter);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid filter parameters', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Service findAll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = getStringParam(req.params.slug);
      const service = await serviceService.findBySlug(slug);
      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      res.json(service);
    } catch (error) {
      console.error('Service findBySlug error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findFeatured(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const services = await serviceService.findFeatured(limit);
      res.json(services);
    } catch (error) {
      console.error('Service findFeatured error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const service = await serviceService.findById(id);
      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      res.json(service);
    } catch (error) {
      console.error('Service findById error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = serviceSchema.parse(req.body);
      const service = await serviceService.create(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Service create error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const data = serviceUpdateSchema.parse(req.body);
      
      const existing = await serviceService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      
      const service = await serviceService.update(id, data);
      res.json(service);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Service update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      const existing = await serviceService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      
      await serviceService.softDelete(id);
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      console.error('Service delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      const existing = await serviceService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      
      const service = await serviceService.restore(id);
      res.json(service);
    } catch (error) {
      console.error('Service restore error:', error);
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
      
      const service = await serviceService.reorder(id, order);
      res.json(service);
    } catch (error) {
      console.error('Service reorder error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getClassifications(_req: Request, res: Response): Promise<void> {
    try {
      const classifications = await serviceService.getClassifications();
      res.json(classifications);
    } catch (error) {
      console.error('Service getClassifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};