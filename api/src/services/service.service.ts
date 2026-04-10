import { PrismaClient, Prisma } from '@prisma/client';
import { ServiceInput, ServiceUpdateInput, ServiceFilterInput } from '@jsoft/shared';

const prisma = new PrismaClient();

const SERVICE_SELECT = {
  id: true,
  title: true,
  slug: true,
  classification: true,
  shortDescription: true,
  fullDescription: true,
  includedItems: true,
  images: true,
  order: true,
  featured: true,
  deletedAt: true,
  technicalExplanation: true,
  technicalImages: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const serviceService = {
  async findAll(filter?: ServiceFilterInput) {
    const { featured, classification, page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {
      deletedAt: null,
      ...(featured !== undefined && { featured }),
      ...(classification && { classification }),
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        select: SERVICE_SELECT,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      data: services,
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
    return prisma.service.findFirst({
      where: { slug, deletedAt: null },
      select: SERVICE_SELECT,
    });
  },

  async findFeatured(limit = 3) {
    return prisma.service.findMany({
      where: { featured: true, deletedAt: null },
      select: SERVICE_SELECT,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
  },

  async findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      select: SERVICE_SELECT,
    });
  },

  async create(data: ServiceInput) {
    return prisma.service.create({
      data: {
        title: data.title,
        slug: data.slug,
        classification: data.classification,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        includedItems: data.includedItems,
        images: data.images,
        order: data.order ?? 0,
        featured: data.featured ?? false,
        technicalExplanation: data.technicalExplanation,
        technicalImages: data.technicalImages,
      },
      select: SERVICE_SELECT,
    });
  },

  async update(id: string, data: ServiceUpdateInput) {
    return prisma.service.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.classification !== undefined && { classification: data.classification }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.fullDescription !== undefined && { fullDescription: data.fullDescription }),
        ...(data.includedItems !== undefined && { includedItems: data.includedItems }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.technicalExplanation !== undefined && { technicalExplanation: data.technicalExplanation }),
        ...(data.technicalImages !== undefined && { technicalImages: data.technicalImages }),
      },
      select: SERVICE_SELECT,
    });
  },

  async softDelete(id: string) {
    return prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: SERVICE_SELECT,
    });
  },

  async restore(id: string) {
    return prisma.service.update({
      where: { id },
      data: { deletedAt: null },
      select: SERVICE_SELECT,
    });
  },

  async reorder(id: string, newOrder: number) {
    return prisma.service.update({
      where: { id },
      data: { order: newOrder },
      select: SERVICE_SELECT,
    });
  },

  async getClassifications() {
    const result = await prisma.service.findMany({
      where: { deletedAt: null },
      select: { classification: true },
      distinct: ['classification'],
      orderBy: { classification: 'asc' },
    });
    return result.map((item: { classification: string }) => item.classification);
  },
};