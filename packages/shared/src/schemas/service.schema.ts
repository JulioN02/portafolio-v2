import { z } from 'zod';

/**
 * Schema for Service entity
 * Used for creating and updating services in the admin
 */
export const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  classification: z.string().min(2, 'Classification must be at least 2 characters').max(50),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(300),
  fullDescription: z.string().min(50, 'Full description must be at least 50 characters'),
  includedItems: z.array(z.string().min(3)).min(1, 'At least one included item is required'),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  order: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  
  // Technical fields for recruiters (optional)
  technicalExplanation: z.string().max(15000).optional(),
  technicalImages: z.array(z.string().url()).optional(),
});

/**
 * Partial schema for updating services (all fields optional)
 */
export const serviceUpdateSchema = serviceSchema.partial();

/**
 * Schema for filtering services in API queries
 */
export const serviceFilterSchema = z.object({
  featured: z.boolean().optional(),
  classification: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

/**
 * Type inferred from serviceSchema
 */
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type ServiceFilterInput = z.infer<typeof serviceFilterSchema>;

/**
 * Service response type (what the API returns)
 */
export interface ServiceResponse extends ServiceInput {
  id: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}