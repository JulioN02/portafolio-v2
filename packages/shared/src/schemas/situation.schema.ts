import { z } from 'zod';

/**
 * Situation entity — homepage problem selector entry.
 * A situation links to at most 3 services (enforced by the API).
 */
const serviceIdsField = z.array(z.string().min(1)).max(3).refine(
  (ids) => new Set(ids).size === ids.length,
  { message: 'serviceIds must be unique' },
);

export const situationCreateSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  active: z.boolean().optional(),
  order: z.number().int().min(0).max(10000).optional(),
  serviceIds: serviceIdsField.optional(),
});

/** PUT — full replacement: title and description are required. */
export const situationUpdateSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  active: z.boolean().optional(),
  order: z.number().int().min(0).max(10000).optional(),
  serviceIds: serviceIdsField.optional(),
});

/** PATCH — at least one optional field required. */
export const situationPatchSchema = z
  .object({
    active: z.boolean().optional(),
    order: z.number().int().min(0).max(10000).optional(),
    serviceIds: serviceIdsField.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export type SituationInput = z.infer<typeof situationCreateSchema>;
export type SituationUpdateInput = z.infer<typeof situationUpdateSchema>;
export type SituationPatchInput = z.infer<typeof situationPatchSchema>;

/**
 * Admin-facing situation response.
 */
export interface SituationResponse {
  id: string;
  title: string;
  description: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Public situation item: only situations with ≥1 PUBLISHED service.
 * `services` holds at most 3 published, non-deleted services ordered by
 * order asc → createdAt asc → id asc. Service shape comes from the public
 * selector (`PublicService`).
 */
export interface SituationPublicItem {
  id: string;
  title: string;
  description: string;
  order: number;
  services: unknown[];
}
