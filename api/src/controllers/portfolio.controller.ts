import { Request, Response } from 'express';
import { portfolioService } from '../services/portfolio.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { publicPortfolioQuerySchema } from '@jsoft/shared';

export const portfolioController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = publicPortfolioQuerySchema.parse(req.query);
    const result = await portfolioService.findAll(filter);
    res.json(result);
  }),

  findRecent: asyncHandler(async (req: Request, res: Response) => {
    const filter = publicPortfolioQuerySchema.parse(req.query);
    const limit = req.query.limit === undefined ? 3 : Math.min(filter.limit, 12);
    const projects = await portfolioService.findRecent(limit);
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

  getClassifications: asyncHandler(async (req: Request, res: Response) => {
    publicPortfolioQuerySchema.parse(req.query);
    const classifications = await portfolioService.getClassifications();
    res.json(classifications);
  }),
};
