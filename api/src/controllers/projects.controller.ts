import { Request, Response } from 'express';
import { projectsService } from '../services/projects.service.js';

export const projectsController = {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const classification = req.query.classification as string | undefined;
      const type = req.query.type as 'service' | 'product' | 'tool' | 'successCase' | undefined;

      // Validate type if provided
      if (type && !['service', 'product', 'tool', 'successCase'].includes(type)) {
        res.status(400).json({ error: 'Invalid type. Must be: service, product, tool, or successCase' });
        return;
      }

      const result = await projectsService.findAll({ page, limit, classification, type });
      res.json(result);
    } catch (error) {
      console.error('Projects findAll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findRecent(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const projects = await projectsService.findRecent(limit);
      res.json(projects);
    } catch (error) {
      console.error('Projects findRecent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getClassifications(_req: Request, res: Response): Promise<void> {
    try {
      const classifications = await projectsService.getClassifications();
      res.json(classifications);
    } catch (error) {
      console.error('Projects getClassifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
