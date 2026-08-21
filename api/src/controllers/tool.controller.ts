import { Request, Response } from 'express';
import { toolService } from '../services/tool.service.js';
import {
  toolSchema,
  toolUpdateSchema,
  toolFilterSchema,
  toolStatusSchema,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const getExistingTool = async (id: string) => {
  const existing = await toolService.findById(id);
  if (!existing) {
    throw new NotFoundError('Tool not found');
  }
  return existing;
};

export const toolController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = toolFilterSchema.parse(req.query);
    const result = await toolService.findAll(filter);
    res.json(result);
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    const slug = getStringParam(req.params.slug);
    const tool = await toolService.findBySlug(slug);
    if (!tool) {
      throw new NotFoundError('Tool not found');
    }
    res.json(tool);
  }),

  findFeatured: asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 3;
    const tools = await toolService.findFeatured(limit);
    res.json(tools);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const tool = await toolService.findById(id);
    if (!tool) {
      throw new NotFoundError('Tool not found');
    }
    res.json(tool);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = toolSchema.parse(req.body);
    const tool = await toolService.create(data);
    res.status(201).json(tool);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = toolUpdateSchema.parse(req.body);
    await getExistingTool(id);
    const tool = await toolService.update(id, data);
    res.json(tool);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingTool(id);
    await toolService.softDelete(id);
    res.json({ message: 'Tool deleted successfully' });
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingTool(id);
    const tool = await toolService.restore(id);
    res.json(tool);
  }),

  toggleFeatured: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { featured } = req.body;
    if (typeof featured !== 'boolean') {
      throw new ValidationError('Featured must be a boolean');
    }
    await getExistingTool(id);
    const tool = await toolService.update(id, { featured });
    res.json(tool);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { status } = toolStatusSchema.parse(req.body);
    if (status === 'ALL') { res.status(400).json({ error: 'ALL is not a valid status' }); return; }
    await getExistingTool(id);
    const tool = await toolService.updateStatus(id, status);
    res.json(tool);
  }),

  getClassifications: asyncHandler(async (_req: Request, res: Response) => {
    const classifications = await toolService.getClassifications();
    res.json(classifications);
  }),
};