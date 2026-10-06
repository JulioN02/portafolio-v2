import { Request, Response } from 'express';
import { successCaseService } from '../services/successCase.service.js';
import {
  successCaseSchema,
  successCaseUpdateSchema,
  successCaseFilterSchema,
  successCaseStatusSchema,
  publicSuccessCaseQuerySchema,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const getExistingCase = async (id: string) => {
  // Admin-scope lookup: internal flows must see drafts/archived entities.
  const existing = await successCaseService.findById(id, 'ALL');
  if (!existing) {
    throw new NotFoundError('Success case not found');
  }
  return existing;
};

export const successCaseController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = publicSuccessCaseQuerySchema.parse(req.query);
    const result = await successCaseService.findAllPublic(filter);
    res.json(result);
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    publicSuccessCaseQuerySchema.parse(req.query);
    const slug = getStringParam(req.params.slug);
    const successCase = await successCaseService.findPublicBySlug(slug);
    if (!successCase) {
      throw new NotFoundError('Success case not found');
    }
    res.json(successCase);
  }),

  findRecent: asyncHandler(async (req: Request, res: Response) => {
    const filter = publicSuccessCaseQuerySchema.parse(req.query);
    const limit = req.query.limit === undefined ? 3 : Math.min(filter.limit, 12);
    const successCases = await successCaseService.findPublicRecent(limit);
    res.json(successCases);
  }),

  findFeatured: asyncHandler(async (req: Request, res: Response) => {
    const filter = publicSuccessCaseQuerySchema.parse(req.query);
    const limit = req.query.limit === undefined ? 3 : Math.min(filter.limit, 12);
    const successCases = await successCaseService.findPublicFeatured(limit);
    res.json(successCases);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    // Admin scope passthrough: ?status=ALL disables the PUBLISHED filter.
    const successCase = await successCaseService.findById(
      id,
      req.query.status === 'ALL' ? 'ALL' : undefined,
    );
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

  toggleFeatured: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { featured } = req.body;
    if (typeof featured !== 'boolean') {
      throw new ValidationError('Featured must be a boolean');
    }
    await getExistingCase(id);
    const successCase = await successCaseService.update(id, { featured });
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

  findAllAdmin: asyncHandler(async (req: Request, res: Response) => {
    const filter = successCaseFilterSchema.parse(req.query);
    res.json(await successCaseService.findAll(filter));
  }),
};
