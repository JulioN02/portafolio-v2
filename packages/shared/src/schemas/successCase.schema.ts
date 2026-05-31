import { z } from 'zod';
import { postStatusEnum } from './blogPost.schema.js';

/**
 * Schema for SuccessCase entity
 * Used for creating and updating success cases in the admin
 */
export const successCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10).max(1000),
  images: z.array(z.string().url()).min(1),
  videos: z.array(z.string().url()).optional(),
  links: z.array(z.string().url()).optional(),
  status: postStatusEnum.default('DRAFT'),
});

/**
 * Partial schema for updating success cases
 */
export const successCaseUpdateSchema = successCaseSchema.partial();

/**
 * Schema for filtering success cases in API queries
 */
export const successCaseFilterSchema = z.object({
  status: postStatusEnum.optional(),
  classification: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Schema for changing success case status
 */
export const successCaseStatusSchema = z.object({
  status: postStatusEnum,
});

/**
 * Type inferred from successCaseSchema
 */
export type SuccessCaseInput = z.infer<typeof successCaseSchema>;
export type SuccessCaseUpdateInput = z.infer<typeof successCaseUpdateSchema>;
export type SuccessCaseFilterInput = z.infer<typeof successCaseFilterSchema>;
export type SuccessCaseStatusInput = z.infer<typeof successCaseStatusSchema>;

/**
 * SuccessCase response type
 */
export interface SuccessCaseResponse extends SuccessCaseInput {
  id: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}