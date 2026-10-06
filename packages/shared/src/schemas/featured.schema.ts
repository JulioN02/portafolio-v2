import { z } from 'zod';

/**
 * Featured flag patch for content entities (services, success cases,
 * blog posts). Auth-only route body.
 */
export const featuredSchema = z.object({
  featured: z.boolean(),
});

/** Backward-compatible alias. */
export const featuredUpdateSchema = featuredSchema;

export type FeaturedUpdateInput = z.infer<typeof featuredSchema>;
