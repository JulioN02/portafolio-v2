import { describe, expect, it } from 'vitest';
import {
  publicServiceQuerySchema,
  publicProductQuerySchema,
  publicStatusSchema,
  publicExternalLinkSchema,
} from '../public.schema';

describe('public query contracts', () => {
  it('defaults to page one and twelve records', () => {
    expect(publicServiceQuerySchema.parse({})).toMatchObject({ page: 1, limit: 12 });
  });

  it.each(['ALL', 'DRAFT', 'PRIVATE', 'ARCHIVED', 'UNKNOWN'])('rejects unsafe status %s', (status) => {
    expect(publicStatusSchema.safeParse(status).success).toBe(false);
  });

  it('rejects repeated status and pagination values', () => {
    expect(publicStatusSchema.safeParse(['PUBLISHED', 'PUBLISHED']).success).toBe(false);
    expect(publicServiceQuerySchema.safeParse({ page: ['1', '2'] }).success).toBe(false);
    expect(publicServiceQuerySchema.safeParse({ limit: '51' }).success).toBe(false);
    expect(publicServiceQuerySchema.safeParse({ page: '1e2' }).success).toBe(false);
    expect(publicProductQuerySchema.safeParse({ featured: ['true', 'false'] }).success).toBe(false);
    expect(publicProductQuerySchema.safeParse({ featured: 'not-a-boolean' }).success).toBe(false);
  });

  it('accepts only HTTPS external links', () => {
    expect(publicExternalLinkSchema.safeParse('https://example.com/demo').success).toBe(true);
    expect(publicExternalLinkSchema.safeParse('http://example.com/demo').success).toBe(false);
    expect(publicExternalLinkSchema.safeParse(null).success).toBe(true);
  });
});
