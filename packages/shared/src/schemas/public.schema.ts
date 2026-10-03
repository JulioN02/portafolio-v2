import { z } from 'zod';

export const PUBLIC_DEFAULT_LIMIT = 12;
export const PUBLIC_MAX_PAGE = 10_000;
export const PUBLIC_MAX_LIMIT = 50;
export const PUBLIC_MAX_AGGREGATE = 12;
export const PUBLIC_MAX_MEDIA_ITEMS = 12;
export const PUBLIC_MAX_INCLUDED_ITEMS = 20;
export const PUBLIC_MAX_TAGS = 20;

const repeatedQueryValue = (value: unknown): unknown =>
  Array.isArray(value) ? '__repeated_query_value__' : value;

const publicIntegerQuery = (defaultValue: number, max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string' && /^[0-9]+$/.test(value)) return Number(value);
      return value;
    },
    z.number().int().min(1).max(max).default(defaultValue),
  );

const publicPage = z.preprocess(
  repeatedQueryValue,
  publicIntegerQuery(1, PUBLIC_MAX_PAGE),
);

const publicLimit = z.preprocess(
  repeatedQueryValue,
  publicIntegerQuery(PUBLIC_DEFAULT_LIMIT, PUBLIC_MAX_LIMIT),
);

const publicOptionalString = (max: number) =>
  z.preprocess(
    repeatedQueryValue,
    z.string().trim().min(1).max(max).optional(),
  );

const publicBoolean = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return '__repeated_query_value__';
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  },
  z.boolean().optional(),
);

/** Public callers may omit status or explicitly repeat the canonical value. */
export const publicStatusSchema = z.preprocess(
  repeatedQueryValue,
  z.literal('PUBLISHED').optional(),
);

const publicPaginationSchema = z.object({
  page: publicPage,
  limit: publicLimit,
});

export const publicServiceQuerySchema = publicPaginationSchema.extend({
  status: publicStatusSchema,
  classification: publicOptionalString(50),
}).strict();

export const publicProductQuerySchema = publicPaginationSchema.extend({
  status: publicStatusSchema,
  featured: publicBoolean,
  classification: publicOptionalString(50),
}).strict();

export const publicToolQuerySchema = publicProductQuerySchema;

export const publicSuccessCaseQuerySchema = publicPaginationSchema.extend({
  status: publicStatusSchema,
}).strict();

export const publicProjectQuerySchema = publicPaginationSchema.extend({
  status: publicStatusSchema,
  tag: publicOptionalString(100),
  search: publicOptionalString(200),
}).strict();

export const publicBlogPostQuerySchema = publicPaginationSchema.extend({
  status: publicStatusSchema,
  category: publicOptionalString(100),
  tag: publicOptionalString(100),
  search: publicOptionalString(200),
}).strict();

export const publicPortfolioQuerySchema = publicPaginationSchema.extend({
  status: publicStatusSchema,
  classification: publicOptionalString(100),
  type: z.preprocess(
    repeatedQueryValue,
    z.enum(['product', 'tool', 'successCase', 'project', 'laboratorio']).optional(),
  ),
}).strict();

export const httpsUrlSchema = z.string().url().refine(
  (value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  },
  'URL must use HTTPS',
);

export const safeExternalLinkSchema = z.union([httpsUrlSchema, z.literal('')]).optional();
export const publicExternalLinkSchema = httpsUrlSchema.nullable();

export type PublicServiceQuery = z.infer<typeof publicServiceQuerySchema>;
export type PublicProductQuery = z.infer<typeof publicProductQuerySchema>;
export type PublicToolQuery = z.infer<typeof publicToolQuerySchema>;
export type PublicSuccessCaseQuery = z.infer<typeof publicSuccessCaseQuerySchema>;
export type PublicProjectQuery = z.infer<typeof publicProjectQuerySchema>;
export type PublicBlogPostQuery = z.infer<typeof publicBlogPostQuerySchema>;
export type PublicPortfolioQuery = z.infer<typeof publicPortfolioQuerySchema>;
