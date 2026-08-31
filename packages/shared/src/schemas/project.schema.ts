import { z } from 'zod';
import { postStatusEnum } from './blogPost.schema.js';

/**
 * Free-form tags used for Project and BlogPost classification.
 * Each tag is a trimmed string of 1-30 chars; at most 10 tags.
 */
export const tagsSchema = z.array(
  z.string().trim().min(1, 'Tag must be at least 1 character').max(30, 'Tag must be at most 30 characters'),
).max(10, 'Maximum 10 tags allowed');

/**
 * Schema for Project entity
 * Used for creating and updating projects in the admin.
 * Classification is expressed via free-form `tags` (no type enum).
 */
export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  shortDescription: z.string().min(10).max(500),
  body: z.string().min(100, 'Body must be at least 100 characters').max(50000),
  images: z.array(z.string().url()).optional(),
  repositoryUrl: z.string().url().optional(),
  tags: tagsSchema.optional(),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  status: postStatusEnum.default('DRAFT'),
});

/**
 * Partial schema for updating projects
 */
export const projectUpdateSchema = projectSchema.partial();

/**
 * Schema for filtering projects in API queries (public)
 */
export const projectFilterSchema = z.object({
  status: postStatusEnum.optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Schema for changing project status
 */
export const projectStatusSchema = z.object({
  status: postStatusEnum,
});

/**
 * Schema for reordering projects (featured ordering)
 */
export const projectReorderSchema = z.object({
  order: z.number().int().min(0),
});

/**
 * Type inferred from projectSchema
 */
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;
export type ProjectStatusInput = z.infer<typeof projectStatusSchema>;
export type ProjectReorderInput = z.infer<typeof projectReorderSchema>;

/**
 * Project response type
 */
export interface ProjectResponse extends ProjectInput {
  id: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}