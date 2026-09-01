import { z } from 'zod';

/**
 * Free-form tags used for Project and BlogPost classification.
 * Each tag is a trimmed string of 1-30 chars; at most 10 tags.
 *
 * Lives in its own module so both `project.schema.ts` and
 * `blogPost.schema.ts` can import it without a circular dependency
 * (project.schema imports postStatusEnum from blogPost.schema).
 */
export const tagsSchema = z.array(
  z.string().trim().min(1, 'Tag must be at least 1 character').max(30, 'Tag must be at most 30 characters'),
).max(10, 'Maximum 10 tags allowed');

export type TagsInput = z.infer<typeof tagsSchema>;