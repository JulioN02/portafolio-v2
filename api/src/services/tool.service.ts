import { PrismaClient } from '@prisma/client';
import { ToolInput, ToolUpdateInput, ToolFilterInput } from '@jsoft/shared';

const prisma = new PrismaClient();

const TOOL_SELECT = {
  id: true,
  title: true,
  slug: true,
  classification: true,
  shortDescription: true,
  fullDescription: true,
  images: true,
  requiresInstall: true,
  order: true,
  featured: true,
  deletedAt: true,
  technicalExplanation: true,
  technicalImages: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const toolService = {
  async findAll(filter?: ToolFilterInput) {
    const { featured, classification, page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      deletedAt: null,
      ...(featured !== undefined && { featured }),
      ...(classification && { classification }),
    };

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        select: TOOL_SELECT,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.tool.count({ where }),
    ]);

    return {
      data: tools,
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

  async findBySlug(slug: string) {
    return prisma.tool.findFirst({
      where: { slug, deletedAt: null },
      select: TOOL_SELECT,
    });
  },

  async findFeatured(limit = 3) {
    return prisma.tool.findMany({
      where: { featured: true, deletedAt: null },
      select: TOOL_SELECT,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
  },

  async findById(id: string) {
    return prisma.tool.findUnique({
      where: { id },
      select: TOOL_SELECT,
    });
  },

  async create(data: ToolInput) {
    return prisma.tool.create({
      data: {
        title: data.title,
        slug: data.slug,
        classification: data.classification,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        images: data.images,
        requiresInstall: data.requiresInstall ?? false,
        order: data.order ?? 0,
        featured: data.featured ?? false,
        technicalExplanation: data.technicalExplanation,
        technicalImages: data.technicalImages ?? [],
      },
      select: TOOL_SELECT,
    });
  },

  async update(id: string, data: ToolUpdateInput) {
    return prisma.tool.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.classification !== undefined && { classification: data.classification }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.fullDescription !== undefined && { fullDescription: data.fullDescription }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.requiresInstall !== undefined && { requiresInstall: data.requiresInstall }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.technicalExplanation !== undefined && { technicalExplanation: data.technicalExplanation }),
        ...(data.technicalImages !== undefined && { technicalImages: data.technicalImages }),
      },
      select: TOOL_SELECT,
    });
  },

  async softDelete(id: string) {
    return prisma.tool.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: TOOL_SELECT,
    });
  },

  async restore(id: string) {
    return prisma.tool.update({
      where: { id },
      data: { deletedAt: null },
      select: TOOL_SELECT,
    });
  },

  async reorder(id: string, newOrder: number) {
    return prisma.tool.update({
      where: { id },
      data: { order: newOrder },
      select: TOOL_SELECT,
    });
  },

  async getClassifications() {
    const result = await prisma.tool.findMany({
      where: { deletedAt: null },
      select: { classification: true },
      distinct: ['classification'],
      orderBy: { classification: 'asc' },
    });
    return result.map((item: { classification: string }) => item.classification);
  },
};
