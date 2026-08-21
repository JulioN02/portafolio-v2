import { Request, Response } from 'express';
import { siteSectionService } from '../services/siteSection.service.js';
import { siteSectionUpdateSchema, siteSectionReorderSchema } from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

export const siteSectionController = {
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const sections = await siteSectionService.findAll();
    res.json(sections);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const section = await siteSectionService.findById(id);
    if (!section) {
      throw new NotFoundError('Site section not found');
    }
    res.json(section);
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    const data = siteSectionReorderSchema.parse(req.body);
    const sections = await siteSectionService.reorder(data);
    res.json(sections);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = siteSectionUpdateSchema.parse(req.body);

    const existing = await siteSectionService.findById(id);
    if (!existing) {
      throw new NotFoundError('Site section not found');
    }

    const section = await siteSectionService.update(id, data);
    res.json(section);
  }),
};