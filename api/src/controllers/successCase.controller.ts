import { Request, Response } from 'express';
import { successCaseService } from '../services/successCase.service.js';
import {
  successCaseSchema,
  successCaseUpdateSchema,
  successCaseFilterSchema,
  successCaseStatusSchema,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const getExistingCase = async (id: string) => {
  const existing = await successCaseService.findById(id);
  if (!existing) {
    throw new NotFoundError('Success case not found');
  }
  return existing;
};

export const successCaseController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = successCaseFilterSchema.parse(req.query);
    const result = await successCaseService.findAll(filter);
    res.json(result);
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    const slug = getStringParam(req.params.slug);
    const successCase = await successCaseService.findBySlug(slug);
    if (!successCase) {
      throw new NotFoundError('Success case not found');
    }
    res.json(successCase);
  }),

  findRecent: asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 3;
    const successCases = await successCaseService.findRecent(limit);
    res.json(successCases);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const successCase = await successCaseService.findById(id);
    if (!successCase) {
      throw new NotFoundError('Success case not found');
    }
    res.json(successCase);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = successCaseSchema.parse(req.body);
    const successCase = await successCaseService.create(data);
    res.status(201).json(successCase);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = successCaseUpdateSchema.parse(req.body);
    await getExistingCase(id);
    const successCase = await successCaseService.update(id, data);
    res.json(successCase);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingCase(id);
    await successCaseService.softDelete(id);
    res.json({ message: 'Success case deleted successfully' });
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingCase(id);
    const successCase = await successCaseService.restore(id);
    res.json(successCase);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { status } = successCaseStatusSchema.parse(req.body);
    if (status === 'ALL') { res.status(400).json({ error: 'ALL is not a valid status' }); return; }
    await getExistingCase(id);
    const successCase = await successCaseService.updateStatus(id, status);
    res.json(successCase);
  }),
};