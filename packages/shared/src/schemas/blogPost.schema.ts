import { z } from 'zod';

/**
 * Enum for blog post status
 */
export const postStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'PRIVATE', 'ARCHIVED']);
export type PostStatus = z.infer<typeof postStatusEnum>;

/**
 * Schema for BlogPost entity
 * Used for creating and updating blog posts in the admin
 */
export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  category: z.string().min(2).max(50),
  shortDescription: z.string().min(10).max(500),
  coverImage: z.string().url(),
  mediaGallery: z.array(z.string().url()).optional(),
  body: z.string().min(100, 'Body must be at least 100 characters').max(50000),
  externalLink: z.string().url().optional(),
  lessonsLearned: z.string().max(20000).optional(),
  status: postStatusEnum.default('DRAFT'),
});

/**
 * Partial schema for updating blog posts
 */
export const blogPostUpdateSchema = blogPostSchema.partial();

/**
 * Schema for filtering blog posts in API queries (public)
 */
export const blogPostFilterSchema = z.object({
  status: postStatusEnum.optional(),
  category: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

/**
 * Schema for changing post status
 */
export const blogPostStatusSchema = z.object({
  status: postStatusEnum,
});

/**
 * Type inferred from blogPostSchema
 */
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;
export type BlogPostFilterInput = z.infer<typeof blogPostFilterSchema>;
export type BlogPostStatusInput = z.infer<typeof blogPostStatusSchema>;

/**
 * BlogPost response type
 */
export interface BlogPostResponse extends BlogPostInput {
  id: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}