import { Request, Response } from 'express';
import { projectsService } from '../services/projects.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError } from '../utils/errors.js';

const VALID_TYPES = ['service', 'product', 'tool', 'successCase'];

export const projectsController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const classification = req.query.classification as string | undefined;
    const type = req.query.type as 'service' | 'product' | 'tool' | 'successCase' | undefined;

    if (type && !VALID_TYPES.includes(type)) {
      throw new ValidationError('Invalid type. Must be: service, product, tool, or successCase');
    }

    const result = await projectsService.findAll({ page, limit, classification, type });
    res.json(result);
  }),

  findRecent: asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 3;
    const projects = await projectsService.findRecent(limit);
    res.json({
      data: projects,
      pagination: {
        page: 1,
        limit,
        total: projects.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  }),

  getClassifications: asyncHandler(async (_req: Request, res: Response) => {
    const classifications = await projectsService.getClassifications();
    res.json(classifications);
  }),
};