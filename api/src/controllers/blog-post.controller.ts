import { Request, Response } from 'express';
import { blogPostService } from '../services/blog-post.service.js';
import {
  blogPostSchema,
  blogPostUpdateSchema,
  blogPostFilterSchema,
  postStatusEnum,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const getExistingPost = async (id: string) => {
  const existing = await blogPostService.findById(id);
  if (!existing) {
    throw new NotFoundError('Blog post not found');
  }
  return existing;
};

export const blogPostController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = blogPostFilterSchema.parse(req.query);
    const result = await blogPostService.findAll(filter);
    res.json(result);
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    const slug = getStringParam(req.params.slug);
    const post = await blogPostService.findBySlug(slug);
    if (!post) {
      throw new NotFoundError('Blog post not found');
    }
    res.json(post);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const post = await blogPostService.findById(id);
    if (!post) {
      throw new NotFoundError('Blog post not found');
    }
    res.json(post);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = blogPostSchema.parse(req.body);
    const post = await blogPostService.create(data);
    res.status(201).json(post);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const data = blogPostUpdateSchema.parse(req.body);
    await getExistingPost(id);
    const post = await blogPostService.update(id, data);
    res.json(post);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingPost(id);
    await blogPostService.softDelete(id);
    res.json({ message: 'Blog post deleted successfully' });
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    await getExistingPost(id);
    const post = await blogPostService.restore(id);
    res.json(post);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { status } = req.body;
    const parsedStatus = postStatusEnum.safeParse(status);
    if (!parsedStatus.success) {
      throw new ValidationError('Invalid status value');
    }
    if (parsedStatus.data === 'ALL') { res.status(400).json({ error: 'ALL is not a valid status' }); return; }
    await getExistingPost(id);
    const post = await blogPostService.updateStatus(id, parsedStatus.data);
    res.json(post);
  }),

  getCategories: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await blogPostService.getCategories();
    res.json(categories);
  }),
};