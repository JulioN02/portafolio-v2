import { PrismaClient } from '@prisma/client';
import { ProductInput, ProductUpdateInput, ProductFilterInput } from '@jsoft/shared';

const prisma = new PrismaClient();

const PRODUCT_SELECT = {
  id: true,
  title: true,
  slug: true,
  classification: true,
  shortDescription: true,
  fullDescription: true,
  images: true,
  externalLink: true,
  order: true,
  featured: true,
  deletedAt: true,
  technicalExplanation: true,
  technicalImages: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const productService = {
  async findAll(filter?: ProductFilterInput) {
    const { featured, classification, page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      deletedAt: null,
      ...(featured !== undefined && { featured }),
      ...(classification && { classification }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: PRODUCT_SELECT,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
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
    return prisma.product.findFirst({
      where: { slug, deletedAt: null },
      select: PRODUCT_SELECT,
    });
  },

  async findFeatured(limit = 3) {
    return prisma.product.findMany({
      where: { featured: true, deletedAt: null },
      select: PRODUCT_SELECT,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: PRODUCT_SELECT,
    });
  },

  async create(data: ProductInput) {
    return prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        classification: data.classification,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        images: data.images,
        externalLink: data.externalLink,
        order: data.order ?? 0,
        featured: data.featured ?? false,
        technicalExplanation: data.technicalExplanation,
        technicalImages: data.technicalImages ?? [],
      },
      select: PRODUCT_SELECT,
    });
  },

  async update(id: string, data: ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.classification !== undefined && { classification: data.classification }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.fullDescription !== undefined && { fullDescription: data.fullDescription }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.externalLink !== undefined && { externalLink: data.externalLink }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.technicalExplanation !== undefined && { technicalExplanation: data.technicalExplanation }),
        ...(data.technicalImages !== undefined && { technicalImages: data.technicalImages }),
      },
      select: PRODUCT_SELECT,
    });
  },

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: PRODUCT_SELECT,
    });
  },

  async restore(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: null },
      select: PRODUCT_SELECT,
    });
  },

  async reorder(id: string, newOrder: number) {
    return prisma.product.update({
      where: { id },
      data: { order: newOrder },
      select: PRODUCT_SELECT,
    });
  },

  async getClassifications() {
    const result = await prisma.product.findMany({
      where: { deletedAt: null },
      select: { classification: true },
      distinct: ['classification'],
      orderBy: { classification: 'asc' },
    });
    return result.map((item: { classification: string }) => item.classification);
  },
};
