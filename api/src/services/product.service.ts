import { PrismaClient, PostStatus } from '@prisma/client';
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
  featured: true,
  status: true,
  publishedAt: true,
  deletedAt: true,
  technicalExplanation: true,
  technicalImages: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const productService = {
  async findAll(filter?: ProductFilterInput) {
    const { featured, status, classification, page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      deletedAt: null,
      ...(featured !== undefined && { featured }),
      ...(status && { status: status as PostStatus }),
      ...(classification && { classification }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: PRODUCT_SELECT,
        orderBy: [{ createdAt: 'desc' }],
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
      orderBy: [{ createdAt: 'desc' }],
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
        featured: data.featured ?? false,
        status: data.status || 'DRAFT',
        ...(data.status === 'PUBLISHED' && { publishedAt: new Date() }),
        technicalExplanation: data.technicalExplanation,
        technicalImages: data.technicalImages ?? [],
      },
      select: PRODUCT_SELECT,
    });
  },

  async update(id: string, data: ProductUpdateInput) {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.classification !== undefined) updateData.classification = data.classification;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.fullDescription !== undefined) updateData.fullDescription = data.fullDescription;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.externalLink !== undefined) updateData.externalLink = data.externalLink;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }
    if (data.technicalExplanation !== undefined) updateData.technicalExplanation = data.technicalExplanation;
    if (data.technicalImages !== undefined) updateData.technicalImages = data.technicalImages;

    return prisma.product.update({
      where: { id },
      data: updateData,
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

  async updateStatus(id: string, status: PostStatus) {
    const updateData: Record<string, unknown> = { status };
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
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
