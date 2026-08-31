import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Unified project type for the recruiter aggregation.
// Every source MUST be status=PUBLISHED + deletedAt=null (regression guard
// against the old aggregation that leaked DRAFT/PRIVATE rows).
export interface PortfolioProjectSummary {
  id: string;
  type: 'service' | 'product' | 'tool' | 'successCase' | 'project' | 'laboratorio';
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  image: string; // first image / cover
  images?: string[];
  tags?: string[]; // real Project rows only
  featured?: boolean; // Product, Tool, Project
  createdAt: Date;
}

interface PortfolioFilter {
  page?: number;
  limit?: number;
  classification?: string;
  type?: string;
}

const PUBLISHED = { status: 'PUBLISHED', deletedAt: null } as const;

/** Blog posts rendered as lab projects until P2-06 switches to tags hasSome. */
const LAB_CATEGORIES: string[] = ['laboratorio', 'experimento'];

const toProjectSummary = (item: {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  shortDescription: string;
  images: string[];
  featured: boolean;
  order: number;
  createdAt: Date;
}): PortfolioProjectSummary => ({
  id: item.id,
  type: 'project',
  title: item.title,
  slug: item.slug,
  classification: item.tags[0] || '',
  tags: item.tags,
  shortDescription: item.shortDescription,
  image: item.images[0] || '',
  images: item.images,
  featured: item.featured,
  createdAt: item.createdAt,
});

const toLabSummary = (item: {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  coverImage: string;
  mediaGallery: string[];
  createdAt: Date;
}): PortfolioProjectSummary => ({
  id: item.id,
  type: 'laboratorio',
  title: item.title,
  slug: item.slug,
  classification: item.category,
  shortDescription: item.shortDescription,
  image: item.coverImage,
  images: [item.coverImage, ...item.mediaGallery].filter(Boolean),
  createdAt: item.createdAt,
});

export const portfolioService = {
  async findAll(filter?: PortfolioFilter) {
    const { page = 1, limit = 10, classification, type } = filter || {};
    const skip = (page - 1) * limit;

    const queries: Promise<PortfolioProjectSummary[]>[] = [];

    if (!type || type === 'project') {
      queries.push(
        prisma.project.findMany({
          where: {
            ...PUBLISHED,
            ...(classification && { tags: { hasSome: [classification] } }),
          },
          select: {
            id: true,
            title: true,
            slug: true,
            tags: true,
            shortDescription: true,
            images: true,
            featured: true,
            order: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }],
        }).then((items) => items.map(toProjectSummary)),
      );
    }

    if (!type || type === 'service') {
      queries.push(
        prisma.service.findMany({
          where: {
            ...PUBLISHED,
            ...(classification && { classification }),
          },
          select: {
            id: true,
            title: true,
            slug: true,
            classification: true,
            shortDescription: true,
            images: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }],
        }).then((items) => items.map((item) => ({
          id: item.id,
          type: 'service' as const,
          title: item.title,
          slug: item.slug,
          classification: item.classification,
          shortDescription: item.shortDescription,
          image: item.images[0] || '',
          images: item.images,
          createdAt: item.createdAt,
        }))),
      );
    }

    if (!type || type === 'product') {
      queries.push(
        prisma.product.findMany({
          where: {
            ...PUBLISHED,
            ...(classification && { classification }),
          },
          select: {
            id: true,
            title: true,
            slug: true,
            classification: true,
            shortDescription: true,
            images: true,
            featured: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }],
        }).then((items) => items.map((item) => ({
          id: item.id,
          type: 'product' as const,
          title: item.title,
          slug: item.slug,
          classification: item.classification,
          shortDescription: item.shortDescription,
          image: item.images[0] || '',
          images: item.images,
          featured: item.featured,
          createdAt: item.createdAt,
        }))),
      );
    }

    if (!type || type === 'tool') {
      queries.push(
        prisma.tool.findMany({
          where: {
            ...PUBLISHED,
            ...(classification && { classification }),
          },
          select: {
            id: true,
            title: true,
            slug: true,
            classification: true,
            shortDescription: true,
            images: true,
            featured: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }],
        }).then((items) => items.map((item) => ({
          id: item.id,
          type: 'tool' as const,
          title: item.title,
          slug: item.slug,
          classification: item.classification,
          shortDescription: item.shortDescription,
          image: item.images[0] || '',
          images: item.images,
          featured: item.featured,
          createdAt: item.createdAt,
        }))),
      );
    }

    if (!type || type === 'successCase') {
      queries.push(
        prisma.successCase.findMany({
          where: {
            ...PUBLISHED,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            images: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }],
        }).then((items) => items.map((item) => ({
          id: item.id,
          type: 'successCase' as const,
          title: item.title,
          slug: item.slug,
          classification: 'success-case',
          shortDescription: item.description,
          image: item.images[0] || '',
          images: item.images,
          createdAt: item.createdAt,
        }))),
      );
    }

    if (!type || type === 'laboratorio') {
      queries.push(
        prisma.blogPost.findMany({
          where: {
            ...PUBLISHED,
            category: { in: LAB_CATEGORIES },
            ...(classification && { category: classification }),
          },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            shortDescription: true,
            coverImage: true,
            mediaGallery: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }],
        }).then((items) => items.map(toLabSummary)),
      );
    }

    const results = await Promise.all(queries);

    const allProjects: PortfolioProjectSummary[] = results
      .flat()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allProjects.length;

    return {
      data: allProjects.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  async findRecent(limit = 3): Promise<PortfolioProjectSummary[]> {
    const projectSelect = {
      id: true, title: true, slug: true, tags: true, shortDescription: true,
      images: true, featured: true, order: true, createdAt: true,
    } as const;
    const legacySelect = {
      id: true, title: true, slug: true, classification: true,
      shortDescription: true, images: true, createdAt: true,
    } as const;
    const featuredSelect = {
      ...legacySelect,
      featured: true,
    } as const;
    const successCaseSelect = {
      id: true, title: true, slug: true, description: true,
      images: true, createdAt: true,
    } as const;
    const labSelect = {
      id: true, title: true, slug: true, category: true,
      shortDescription: true, coverImage: true, mediaGallery: true, createdAt: true,
    } as const;

    const [projects, services, products, tools, successCases, labPosts] = await Promise.all([
      prisma.project.findMany({ where: PUBLISHED, select: projectSelect, orderBy: [{ createdAt: 'desc' }], take: limit })
        .then((items) => items.map(toProjectSummary)),
      prisma.service.findMany({ where: PUBLISHED, select: legacySelect, orderBy: [{ createdAt: 'desc' }], take: limit })
        .then((items) => items.map((item) => ({
          id: item.id, type: 'service' as const, title: item.title, slug: item.slug,
          classification: item.classification, shortDescription: item.shortDescription,
          image: item.images[0] || '', images: item.images, createdAt: item.createdAt,
        }))),
      prisma.product.findMany({ where: PUBLISHED, select: featuredSelect, orderBy: [{ createdAt: 'desc' }], take: limit })
        .then((items) => items.map((item) => ({
          id: item.id, type: 'product' as const, title: item.title, slug: item.slug,
          classification: item.classification, shortDescription: item.shortDescription,
          image: item.images[0] || '', images: item.images, featured: item.featured, createdAt: item.createdAt,
        }))),
      prisma.tool.findMany({ where: PUBLISHED, select: featuredSelect, orderBy: [{ createdAt: 'desc' }], take: limit })
        .then((items) => items.map((item) => ({
          id: item.id, type: 'tool' as const, title: item.title, slug: item.slug,
          classification: item.classification, shortDescription: item.shortDescription,
          image: item.images[0] || '', images: item.images, featured: item.featured, createdAt: item.createdAt,
        }))),
      prisma.successCase.findMany({ where: PUBLISHED, select: successCaseSelect, orderBy: [{ createdAt: 'desc' }], take: limit })
        .then((items) => items.map((item) => ({
          id: item.id, type: 'successCase' as const, title: item.title, slug: item.slug,
          classification: 'success-case', shortDescription: item.description,
          image: item.images[0] || '', images: item.images, createdAt: item.createdAt,
        }))),
      prisma.blogPost.findMany({ where: { ...PUBLISHED, category: { in: LAB_CATEGORIES } }, select: labSelect, orderBy: [{ createdAt: 'desc' }], take: limit })
        .then((items) => items.map(toLabSummary)),
    ]);

    return [...projects, ...services, ...products, ...tools, ...successCases, ...labPosts]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  /** Legacy classifications + project tags, deduped and sorted. */
  async getClassifications(): Promise<string[]> {
    const [serviceClassifications, productClassifications, toolClassifications, projectTags] = await Promise.all([
      prisma.service.findMany({
        where: PUBLISHED,
        select: { classification: true },
        distinct: ['classification'],
      }).then((items) => items.map((i) => i.classification)),
      prisma.product.findMany({
        where: PUBLISHED,
        select: { classification: true },
        distinct: ['classification'],
      }).then((items) => items.map((i) => i.classification)),
      prisma.tool.findMany({
        where: PUBLISHED,
        select: { classification: true },
        distinct: ['classification'],
      }).then((items) => items.map((i) => i.classification)),
      prisma.project.findMany({
        where: PUBLISHED,
        select: { tags: true },
      }).then((items) => items.flatMap((i) => i.tags)),
    ]);

    return [...new Set([
      ...serviceClassifications,
      ...productClassifications,
      ...toolClassifications,
      ...projectTags,
    ])].sort();
  },
};