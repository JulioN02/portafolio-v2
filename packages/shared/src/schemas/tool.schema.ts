import { z } from 'zod';

/**
 * Schema for Tool entity
 * Used for creating and updating tools in the admin
 */
export const toolSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  classification: z.string().min(2).max(50),
  shortDescription: z.string().min(10).max(300),
  fullDescription: z.string().min(50),
  images: z.array(z.string().url()).min(1),
  requiresInstall: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  
  // Technical fields for recruiters (optional)
  technicalExplanation: z.string().max(15000).optional(),
  technicalImages: z.array(z.string().url()).optional(),
});

/**
 * Partial schema for updating tools
 */
export const toolUpdateSchema = toolSchema.partial();

/**
 * Schema for filtering tools in API queries
 */
export const toolFilterSchema = z.object({
  featured: z.boolean().optional(),
  classification: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

/**
 * Type inferred from toolSchema
 */
export type ToolInput = z.infer<typeof toolSchema>;
export type ToolUpdateInput = z.infer<typeof toolUpdateSchema>;
export type ToolFilterInput = z.infer<typeof toolFilterSchema>;

/**
 * Tool response type
 */
export interface ToolResponse extends ToolInput {
  id: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}