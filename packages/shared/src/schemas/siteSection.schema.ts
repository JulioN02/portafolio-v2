import { z } from 'zod';

/**
 * Schema for SiteSection entity
 * Used for managing homepage section visibility and order
 */
export const siteSectionSchema = z.object({
  key: z.string().min(2),
  label: z.string().min(2),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

/**
 * Schema for updating a site section (partial)
 */
export const siteSectionUpdateSchema = z.object({
  visible: z.boolean().optional(),
  label: z.string().min(2).optional(),
});

/**
 * Schema for batch reorder of site sections
 */
export const siteSectionReorderSchema = z.object({
  sections: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0),
  })),
});

/**
 * Type inferred from siteSectionSchema
 */
export type SiteSectionInput = z.infer<typeof siteSectionSchema>;
export type SiteSectionUpdateInput = z.infer<typeof siteSectionUpdateSchema>;
export type SiteSectionReorderInput = z.infer<typeof siteSectionReorderSchema>;

/**
 * SiteSection response type
 */
export interface SiteSectionResponse extends SiteSectionInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
