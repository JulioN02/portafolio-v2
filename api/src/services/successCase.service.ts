import { PrismaClient } from '@prisma/client';
import { SuccessCaseInput, SuccessCaseUpdateInput, SuccessCaseFilterInput } from '@jsoft/shared';

const prisma = new PrismaClient();

const SUCCESS_CASE_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  images: true,
  videos: true,
  links: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const successCaseService = {
  async findAll(filter?: SuccessCaseFilterInput) {
    const { page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
    };

    const [successCases, total] = await Promise.all([
      prisma.successCase.findMany({
        where,
        select: SUCCESS_CASE_SELECT,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.successCase.count({ where }),
    ]);

    return {
      data: successCases,
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
    return prisma.successCase.findFirst({
      where: { slug, deletedAt: null },
      select: SUCCESS_CASE_SELECT,
    });
  },

  async findRecent(limit = 3) {
    return prisma.successCase.findMany({
      where: { deletedAt: null },
      select: SUCCESS_CASE_SELECT,
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
    });
  },

  async findById(id: string) {
    return prisma.successCase.findUnique({
      where: { id },
      select: SUCCESS_CASE_SELECT,
    });
  },

  async create(data: SuccessCaseInput) {
    return prisma.successCase.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        images: data.images,
        videos: data.videos ?? [],
        links: data.links ?? [],
      },
      select: SUCCESS_CASE_SELECT,
    });
  },

  async update(id: string, data: SuccessCaseUpdateInput) {
    return prisma.successCase.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.videos !== undefined && { videos: data.videos }),
        ...(data.links !== undefined && { links: data.links }),
      },
      select: SUCCESS_CASE_SELECT,
    });
  },

  async softDelete(id: string) {
    return prisma.successCase.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: SUCCESS_CASE_SELECT,
    });
  },

  async restore(id: string) {
    return prisma.successCase.update({
      where: { id },
      data: { deletedAt: null },
      select: SUCCESS_CASE_SELECT,
    });
  },
};
