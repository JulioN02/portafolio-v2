import { Request, Response } from 'express';
import { blogPostService } from '../services/blog-post.service.js';
import {
  blogPostSchema,
  blogPostUpdateSchema,
  blogPostFilterSchema,
  postStatusEnum,
  publicBlogPostQuerySchema,
} from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

const getExistingPost = async (id: string) => {
  // Admin-scope lookup: internal flows must see drafts/archived entities.
  const existing = await blogPostService.findById(id, 'ALL');
  if (!existing) {
    throw new NotFoundError('Blog post not found');
  }
  return existing;
};

export const blogPostController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const filter = publicBlogPostQuerySchema.parse(req.query);
    const result = await blogPostService.findAllPublic(filter);
    res.json(result);
  }),

  findBySlug: asyncHandler(async (req: Request, res: Response) => {
    publicBlogPostQuerySchema.parse(req.query);
    const slug = getStringParam(req.params.slug);
    const post = await blogPostService.findPublicBySlug(slug);
    if (!post) {
      throw new NotFoundError('Blog post not found');
    }
    res.json(post);
  }),

  findFeatured: asyncHandler(async (req: Request, res: Response) => {
    const filter = publicBlogPostQuerySchema.parse(req.query);
    const limit = req.query.limit === undefined ? 3 : Math.min(filter.limit, 12);
    const posts = await blogPostService.findPublicFeatured(limit);
    res.json(posts);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    // Admin scope passthrough: ?status=ALL disables the PUBLISHED filter so
    // the admin panel can open drafts by id (route already auth-protected).
    const post = await blogPostService.findById(
      id,
      req.query.status === 'ALL' ? 'ALL' : undefined,
    );
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

  toggleFeatured: asyncHandler(async (req: Request, res: Response) => {
    const id = getStringParam(req.params.id);
    const { featured } = req.body;
    if (typeof featured !== 'boolean') {
      throw new ValidationError('Featured must be a boolean');
    }
    await getExistingPost(id);
    const post = await blogPostService.update(id, { featured });
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

  getCategories: asyncHandler(async (req: Request, res: Response) => {
    publicBlogPostQuerySchema.parse(req.query);
    const categories = await blogPostService.getPublicCategories();
    res.json(categories);
  }),

  getTags: asyncHandler(async (req: Request, res: Response) => {
    publicBlogPostQuerySchema.parse(req.query);
    const tags = await blogPostService.getTags();
    res.json(tags);
  }),

  findAllAdmin: asyncHandler(async (req: Request, res: Response) => {
    const filter = blogPostFilterSchema.parse(req.query);
    res.json(await blogPostService.findAll(filter));
  }),
};
