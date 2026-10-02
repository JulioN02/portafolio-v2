import type {
  PublicBlogPost,
  PublicExternalLink,
  PublicProduct,
  PublicProject,
  PublicService,
  PublicSuccessCase,
  PublicTool,
} from '@jsoft/shared';

export const PUBLIC_SERVICE_SELECT = {
  id: true,
  title: true,
  slug: true,
  classification: true,
  shortDescription: true,
  fullDescription: true,
  includedItems: true,
  images: true,
  technicalImages: true,
  externalLink: true,
} as const;

export const PUBLIC_PRODUCT_SELECT = {
  id: true,
  title: true,
  slug: true,
  classification: true,
  shortDescription: true,
  fullDescription: true,
  images: true,
  technicalImages: true,
  externalLink: true,
  featured: true,
} as const;

export const PUBLIC_TOOL_SELECT = {
  ...PUBLIC_PRODUCT_SELECT,
  requiresInstall: true,
} as const;

export const PUBLIC_SUCCESS_CASE_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  images: true,
  videos: true,
  links: true,
} as const;

export const PUBLIC_PROJECT_SELECT = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  body: true,
  images: true,
  repositoryUrl: true,
  tags: true,
  featured: true,
  order: true,
} as const;

export const PUBLIC_BLOG_POST_SELECT = {
  id: true,
  title: true,
  slug: true,
  category: true,
  tags: true,
  shortDescription: true,
  coverImage: true,
  mediaGallery: true,
  body: true,
  externalLink: true,
  lessonsLearned: true,
} as const;

const MAX_SHORT_DESCRIPTION = 700;
const MAX_FULL_DESCRIPTION = 50_000;
const MAX_BODY = 50_000;
const MAX_LESSONS_LEARNED = 20_000;
const MAX_TAG_LENGTH = 100;

const cap = (value: string | null | undefined, max: number): string => (value ?? '').slice(0, max);

const capArray = (values: string[] | null | undefined, maxItems: number, maxItemLength = 2_000): string[] =>
  (values ?? []).slice(0, maxItems).map((value) => cap(value, maxItemLength));

const safeHttpsUrl = (value: string | null | undefined): PublicExternalLink => {
  if (!value) return null;
  try {
    return new URL(value).protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
};

const safeHttpsUrls = (values: string[]): string[] =>
  values.map((value) => safeHttpsUrl(value)).filter((value): value is string => value !== null).slice(0, 12);

export const selectPublicService = (item: {
  id: string;
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  fullDescription: string;
  includedItems: string[];
  images: string[];
  technicalImages: string[];
  externalLink: string | null;
}): PublicService => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  classification: item.classification,
  shortDescription: cap(item.shortDescription, MAX_SHORT_DESCRIPTION),
  fullDescription: cap(item.fullDescription, MAX_FULL_DESCRIPTION),
  includedItems: capArray(item.includedItems, 20),
  images: (item.images ?? []).slice(0, 12),
  technicalImages: (item.technicalImages ?? []).slice(0, 12),
  externalLink: safeHttpsUrl(item.externalLink),
});

export const selectPublicProduct = (item: {
  id: string;
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  technicalImages: string[];
  externalLink: string | null;
  featured: boolean;
}): PublicProduct => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  classification: item.classification,
  shortDescription: cap(item.shortDescription, MAX_SHORT_DESCRIPTION),
  fullDescription: cap(item.fullDescription, MAX_FULL_DESCRIPTION),
  images: (item.images ?? []).slice(0, 12),
  technicalImages: (item.technicalImages ?? []).slice(0, 12),
  externalLink: safeHttpsUrl(item.externalLink),
  featured: item.featured,
});

export const selectPublicTool = (item: {
  id: string;
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  technicalImages: string[];
  externalLink: string | null;
  featured: boolean;
  requiresInstall: boolean;
}): PublicTool => ({
  ...selectPublicProduct(item),
  requiresInstall: item.requiresInstall,
});

export const selectPublicSuccessCase = (item: {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  videos: string[];
  links: string[];
}): PublicSuccessCase => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  description: cap(item.description, 1_000),
  images: (item.images ?? []).slice(0, 12),
  videos: safeHttpsUrls(item.videos ?? []),
  links: safeHttpsUrls(item.links ?? []),
});

export const selectPublicProject = (item: {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  body: string;
  images: string[];
  repositoryUrl: string | null;
  tags: string[];
  featured: boolean;
  order: number;
}): PublicProject => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  shortDescription: cap(item.shortDescription, MAX_SHORT_DESCRIPTION),
  body: cap(item.body, MAX_BODY),
  images: (item.images ?? []).slice(0, 12),
  repositoryUrl: safeHttpsUrl(item.repositoryUrl),
  tags: capArray(item.tags, 20, MAX_TAG_LENGTH),
  featured: item.featured,
  order: item.order,
});

export const selectPublicBlogPost = (item: {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  shortDescription: string;
  coverImage: string;
  mediaGallery: string[];
  body: string;
  externalLink: string | null;
  lessonsLearned: string | null;
}): PublicBlogPost => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  category: item.category,
  tags: capArray(item.tags, 20, MAX_TAG_LENGTH),
  shortDescription: cap(item.shortDescription, MAX_SHORT_DESCRIPTION),
  coverImage: item.coverImage,
  mediaGallery: (item.mediaGallery ?? []).slice(0, 12),
  body: cap(item.body, MAX_BODY),
  externalLink: safeHttpsUrl(item.externalLink),
  lessonsLearned: item.lessonsLearned === null ? null : cap(item.lessonsLearned, MAX_LESSONS_LEARNED),
});
