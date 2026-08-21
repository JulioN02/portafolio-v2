import { Request, Response } from 'express';
import { productService } from '../services/product.service.js';
import {
  productSchema,
  productUpdateSchema,
  productFilterSchema,
  productStatusSchema,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const getExistingProduct = async (id: string) => {
  const existing = await productService.findById(id);
  if (!existing) {
    throw new NotFoundError('Product not found');
  }
  return existing;
};

export const productController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = productFilterSchema.parse(req.query);
    const result = await productService.findAll(filter);
    res.json(result);
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    const slug = getStringParam(req.params.slug);
    const product = await productService.findBySlug(slug);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  }),

  findFeatured: asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 3;
    const products = await productService.findFeatured(limit);
    res.json(products);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const product = await productService.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = productSchema.parse(req.body);
    const product = await productService.create(data);
    res.status(201).json(product);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = productUpdateSchema.parse(req.body);
    await getExistingProduct(id);
    const product = await productService.update(id, data);
    res.json(product);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingProduct(id);
    await productService.softDelete(id);
    res.json({ message: 'Product deleted successfully' });
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingProduct(id);
    const product = await productService.restore(id);
    res.json(product);
  }),

  toggleFeatured: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { featured } = req.body;
    if (typeof featured !== 'boolean') {
      throw new ValidationError('Featured must be a boolean');
    }
    await getExistingProduct(id);
    const product = await productService.update(id, { featured });
    res.json(product);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { status } = productStatusSchema.parse(req.body);
    await getExistingProduct(id);
    const product = await productService.updateStatus(id, status);
    res.json(product);
  }),

  getClassifications: asyncHandler(async (_req: Request, res: Response) => {
    const classifications = await productService.getClassifications();
    res.json(classifications);
  }),
};