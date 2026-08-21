import { Request, Response } from 'express';
import { serviceService } from '../services/service.service.js';
import {
  serviceSchema,
  serviceUpdateSchema,
  serviceFilterSchema,
  serviceStatusSchema,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const getExistingService = async (id: string) => {
  const existing = await serviceService.findById(id);
  if (!existing) {
    throw new NotFoundError('Service not found');
  }
  return existing;
};

export const serviceController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = serviceFilterSchema.parse(req.query);
    const result = await serviceService.findAll(filter);
    res.json(result);
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    const slug = getStringParam(req.params.slug);
    const service = await serviceService.findBySlug(slug);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    res.json(service);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const service = await serviceService.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    res.json(service);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = serviceSchema.parse(req.body);
    const service = await serviceService.create(data);
    res.status(201).json(service);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = serviceUpdateSchema.parse(req.body);
    await getExistingService(id);
    const service = await serviceService.update(id, data);
    res.json(service);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingService(id);
    await serviceService.softDelete(id);
    res.json({ message: 'Service deleted successfully' });
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingService(id);
    const service = await serviceService.restore(id);
    res.json(service);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { status } = serviceStatusSchema.parse(req.body);
    await getExistingService(id);
    const service = await serviceService.updateStatus(id, status);
    res.json(service);
  }),

  getClassifications: asyncHandler(async (_req: Request, res: Response) => {
    const classifications = await serviceService.getClassifications();
    res.json(classifications);
  }),
};