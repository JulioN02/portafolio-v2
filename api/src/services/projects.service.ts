import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Unified project type for aggregation
export interface ProjectSummary {
  id: string;
  type: 'service' | 'product' | 'tool' | 'successCase';
  title: string;
  slug: string;
  classification: string;
  shortDescription: string;
  image: string; // first image
  featured: boolean;
  createdAt: Date;
}

interface ProjectFilter {
  page?: number;
  limit?: number;
  classification?: string;
  type?: 'service' | 'product' | 'tool' | 'successCase';
}

export const projectsService = {
  async findAll(filter?: ProjectFilter) {
    const { page = 1, limit = 10, classification, type } = filter || {};
    const skip = (page - 1) * limit;

    // Build queries based on filters
    const queries = [];

    if (!type || type === 'service') {
      queries.push(
        prisma.service.findMany({
          where: {
            deletedAt: null,
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
        }).then(items => items.map(item => ({
          ...item,
          type: 'service' as const,
          image: item.images[0] || '',
        })))
      );
    }

    if (!type || type === 'product') {
      queries.push(
        prisma.product.findMany({
          where: {
            deletedAt: null,
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
        }).then(items => items.map(item => ({
          ...item,
          type: 'product' as const,
          image: item.images[0] || '',
        })))
      );
    }

    if (!type || type === 'tool') {
      queries.push(
        prisma.tool.findMany({
          where: {
            deletedAt: null,
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
        }).then(items => items.map(item => ({
          ...item,
          type: 'tool' as const,
          image: item.images[0] || '',
        })))
      );
    }

    if (!type || type === 'successCase') {
      queries.push(
        prisma.successCase.findMany({
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            images: true,
            featured: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }],
        }).then(items => items.map(item => ({
          ...item,
          type: 'successCase' as const,
          classification: 'success-case', // SuccessCase has no classification
          shortDescription: item.description,
          image: item.images[0] || '',
        })))
      );
    }

    // Execute all queries in parallel
    const results = await Promise.all(queries);
    
    // Merge and sort all results by createdAt
    const allProjects: ProjectSummary[] = results.flat()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = allProjects.length;
    const paginatedProjects = allProjects.slice(skip, skip + limit);

    return {
      data: paginatedProjects,
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

  async findRecent(limit = 3): Promise<ProjectSummary[]> {
    const recentSelect = {
      id: true, title: true, slug: true, classification: true,
      shortDescription: true, images: true, featured: true, createdAt: true,
    } as const;

    // Helper: try featured first, fallback to recent
    const featuredOrRecent = async <T extends Record<string, any>>(
      delegate: (where: Record<string, any>) => Promise<T[]>,
      mapItem: (item: T) => ProjectSummary,
    ): Promise<ProjectSummary[]> => {
      const featured = await delegate({ deletedAt: null, featured: true });
      if (featured.length > 0) return featured.map(mapItem);
      const recent = await delegate({ deletedAt: null });
      return recent.map(mapItem);
    };

    const successCaseSelect = {
      id: true, title: true, slug: true, description: true,
      images: true, featured: true, createdAt: true,
    } as const;

    const [services, products, tools, successCases] = await Promise.all([
      featuredOrRecent(
        (where) => prisma.service.findMany({ where, select: recentSelect, orderBy: [{ createdAt: 'desc' }], take: 1 }),
        (i: any) => ({ ...i, type: 'service' as const, image: i.images[0] || '' }),
      ),
      featuredOrRecent(
        (where) => prisma.product.findMany({ where, select: recentSelect, orderBy: [{ createdAt: 'desc' }], take: 1 }),
        (i: any) => ({ ...i, type: 'product' as const, image: i.images[0] || '' }),
      ),
      featuredOrRecent(
        (where) => prisma.tool.findMany({ where, select: recentSelect, orderBy: [{ createdAt: 'desc' }], take: 1 }),
        (i: any) => ({ ...i, type: 'tool' as const, image: i.images[0] || '' }),
      ),
      featuredOrRecent(
        (where) => prisma.successCase.findMany({ where, select: successCaseSelect, orderBy: [{ createdAt: 'desc' }], take: 1 }),
        (i: any) => ({ ...i, type: 'successCase' as const, classification: 'success-case', shortDescription: i.description, image: i.images[0] || '' }),
      ),
    ]);

    // Merge all and sort by createdAt, then take the top N
    const allRecent = [...services, ...products, ...tools, ...successCases]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return allRecent;
  },

  async getClassifications(): Promise<string[]> {
    const [serviceClassifications, productClassifications, toolClassifications] = await Promise.all([
      prisma.service.findMany({
        where: { deletedAt: null },
        select: { classification: true },
        distinct: ['classification'],
      }).then(items => items.map(i => i.classification)),
      
      prisma.product.findMany({
        where: { deletedAt: null },
        select: { classification: true },
        distinct: ['classification'],
      }).then(items => items.map(i => i.classification)),
      
      prisma.tool.findMany({
        where: { deletedAt: null },
        select: { classification: true },
        distinct: ['classification'],
      }).then(items => items.map(i => i.classification)),
    ]);

    // Merge and dedupe
    const allClassifications = [...new Set([
      ...serviceClassifications,
      ...productClassifications,
      ...toolClassifications,
    ])].sort();

    return allClassifications;
  },
};
