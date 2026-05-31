import { PrismaClient, PostStatus } from '@prisma/client';
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
  featured: true,
  status: true,
  publishedAt: true,
  deletedAt: true,
  technicalExplanation: true,
  technicalImages: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const toolService = {
  async findAll(filter?: ToolFilterInput) {
    const { featured, status, classification, page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      deletedAt: null,
      ...(featured !== undefined && { featured }),
      ...(status && { status: status as PostStatus }),
      ...(classification && { classification }),
    };

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        select: TOOL_SELECT,
        orderBy: [{ createdAt: 'desc' }],
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
      orderBy: [{ createdAt: 'desc' }],
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
        featured: data.featured ?? false,
        status: data.status || 'DRAFT',
        ...(data.status === 'PUBLISHED' && { publishedAt: new Date() }),
        technicalExplanation: data.technicalExplanation,
        technicalImages: data.technicalImages ?? [],
      },
      select: TOOL_SELECT,
    });
  },

  async update(id: string, data: ToolUpdateInput) {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.classification !== undefined) updateData.classification = data.classification;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.fullDescription !== undefined) updateData.fullDescription = data.fullDescription;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.requiresInstall !== undefined) updateData.requiresInstall = data.requiresInstall;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }
    if (data.technicalExplanation !== undefined) updateData.technicalExplanation = data.technicalExplanation;
    if (data.technicalImages !== undefined) updateData.technicalImages = data.technicalImages;

    return prisma.tool.update({
      where: { id },
      data: updateData,
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

  async updateStatus(id: string, status: PostStatus) {
    const updateData: Record<string, unknown> = { status };
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    return prisma.tool.update({
      where: { id },
      data: updateData,
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
