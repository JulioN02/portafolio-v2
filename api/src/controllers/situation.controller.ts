import { Request, Response } from 'express';
import {
  situationCreateSchema,
  situationUpdateSchema,
  situationPatchSchema,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { situationService } from '../services/situation.service.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

export const situationController = {
  findPublic: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await situationService.findPublic());
  }),

  findAll: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await situationService.findAll() });
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    res.json(await situationService.findById(id));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = situationCreateSchema.parse(req.body);
    const situation = await situationService.create(data);
    res.status(201).json(situation);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = situationUpdateSchema.parse(req.body);
    res.json(await situationService.update(id, data));
  }),

  patch: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = situationPatchSchema.parse(req.body);
    res.json(await situationService.patch(id, data));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await situationService.remove(id);
    res.json({ message: 'Situation deleted successfully' });
  }),
};
