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
            createdAt: true,
          },
          orderBy: [{ createdAt: 'desc' }],
        }).then(items => items.map(item => ({
          id: item.id,
          type: 'successCase' as const,
          title: item.title,
          slug: item.slug,
          classification: 'success-case', // SuccessCase has no classification
          shortDescription: item.description,
          image: item.images[0] || '',
          featured: false, // SuccessCase has no featured
          createdAt: item.createdAt,
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
    // Get recent items from each type
    const [services, products, tools, successCases] = await Promise.all([
      prisma.service.findMany({
        where: { deletedAt: null },
        select: {
          id: true, title: true, slug: true, classification: true,
          shortDescription: true, images: true, featured: true, createdAt: true,
        },
        orderBy: [{ createdAt: 'desc' }],
        take: limit,
      }).then(items => items.map(item => ({
        ...item, type: 'service' as const, image: item.images[0] || '',
      }))),
      
      prisma.product.findMany({
        where: { deletedAt: null },
        select: {
          id: true, title: true, slug: true, classification: true,
          shortDescription: true, images: true, featured: true, createdAt: true,
        },
        orderBy: [{ createdAt: 'desc' }],
        take: limit,
      }).then(items => items.map(item => ({
        ...item, type: 'product' as const, image: item.images[0] || '',
      }))),
      
      prisma.tool.findMany({
        where: { deletedAt: null },
        select: {
          id: true, title: true, slug: true, classification: true,
          shortDescription: true, images: true, featured: true, createdAt: true,
        },
        orderBy: [{ createdAt: 'desc' }],
        take: limit,
      }).then(items => items.map(item => ({
        ...item, type: 'tool' as const, image: item.images[0] || '',
      }))),
      
      prisma.successCase.findMany({
        where: { deletedAt: null },
        select: {
          id: true, title: true, slug: true, description: true,
          images: true, createdAt: true,
        },
        orderBy: [{ createdAt: 'desc' }],
        take: limit,
      }).then(items => items.map(item => ({
        id: item.id, type: 'successCase' as const, title: item.title,
        slug: item.slug, classification: 'success-case',
        shortDescription: item.description, image: item.images[0] || '',
        featured: false, createdAt: item.createdAt,
      }))),
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
