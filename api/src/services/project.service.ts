import { PrismaClient, PostStatus } from '@prisma/client';
import { ProjectInput, ProjectUpdateInput, ProjectFilterInput } from '@jsoft/shared';
import { ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

const PROJECT_SELECT = {
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
  status: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
} as const;

export const projectService = {
  async findAll(filter?: ProjectFilterInput) {
    const { status, tag, search, page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    const resolvedStatus = (status as string) === 'ALL' ? undefined : (status || 'PUBLISHED');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      deletedAt: null,
      ...(resolvedStatus && { status: resolvedStatus as PostStatus }),
      ...(tag && { tags: { hasSome: [tag] } }),
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: PROJECT_SELECT,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      data: projects,
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

  /** Public detail — PUBLISHED + non-deleted only (anything else → null → 404). */
  async findBySlug(slug: string) {
    return prisma.project.findFirst({
      where: { slug, deletedAt: null, status: 'PUBLISHED' },
      select: PROJECT_SELECT,
    });
  },

  /** Admin fetch (any status, incl. soft-deleted, so editors can restore). */
  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      select: PROJECT_SELECT,
    });
  },

  async create(data: ProjectInput) {
    return prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription,
        body: data.body,
        images: data.images || [],
        repositoryUrl: data.repositoryUrl,
        tags: data.tags || [],
        featured: data.featured ?? false,
        order: data.order ?? 0,
        status: (data.status && data.status !== 'ALL') ? data.status : 'DRAFT',
        ...(data.status === 'PUBLISHED' && { publishedAt: new Date() }),
      },
      select: PROJECT_SELECT,
    });
  },

  async update(id: string, data: ProjectUpdateInput) {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.repositoryUrl !== undefined) updateData.repositoryUrl = data.repositoryUrl;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.status !== undefined) {
      if (data.status === 'ALL') {
        // Reserved filter sentinel — never a real status. Mirror the create()
        // guard so a malformed admin request returns 400, not a Prisma 500.
        throw new ValidationError('ALL is not a valid status');
      }
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }

    return prisma.project.update({
      where: { id },
      data: updateData,
      select: PROJECT_SELECT,
    });
  },

  async softDelete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: PROJECT_SELECT,
    });
  },

  async restore(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: null },
      select: PROJECT_SELECT,
    });
  },

  async updateStatus(id: string, status: PostStatus) {
    const updateData: Record<string, unknown> = { status };
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    return prisma.project.update({
      where: { id },
      data: updateData,
      select: PROJECT_SELECT,
    });
  },

  async reorder(id: string, order: number) {
    return prisma.project.update({
      where: { id },
      data: { order },
      select: PROJECT_SELECT,
    });
  },

  /** Distinct tags among PUBLISHED, non-deleted projects, sorted. */
  async getTags() {
    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      select: { tags: true },
    });
    const tags = [...new Set(projects.flatMap((project) => project.tags))].sort();
    return tags;
  },
};