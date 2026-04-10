import { z } from 'zod';

/**
 * Schema for Product entity
 * Used for creating and updating products in the admin
 */
export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  classification: z.string().min(2).max(50),
  shortDescription: z.string().min(10).max(300),
  fullDescription: z.string().min(50),
  images: z.array(z.string().url()).min(1),
  externalLink: z.string().url().optional(),
  order: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  
  // Technical fields for recruiters (optional)
  technicalExplanation: z.string().max(15000).optional(),
  technicalImages: z.array(z.string().url()).optional(),
});

/**
 * Partial schema for updating products
 */
export const productUpdateSchema = productSchema.partial();

/**
 * Schema for filtering products in API queries
 */
export const productFilterSchema = z.object({
  featured: z.boolean().optional(),
  classification: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

/**
 * Type inferred from productSchema
 */
export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;

/**
 * Product response type
 */
export interface ProductResponse extends ProductInput {
  id: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}