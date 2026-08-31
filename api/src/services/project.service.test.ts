import { projectService } from '../services/project.service';
import { PrismaClient, PostStatus } from '@prisma/client';

const mockPrisma = new PrismaClient();

const PROJECT_BASE = {
  title: 'Portafolio Web',
  slug: 'portafolio-web',
  shortDescription: 'Aplicación web para mostrar el portafolio profesional.',
  body: '<p>Proyecto desarrollado con React, Node.js y PostgreSQL para presentar servicios y proyectos de forma profesional.</p>',
};

describe('Project Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated projects (default PUBLISHED + deletedAt null)', async () => {
      const mockProjects = [
        { id: '1', ...PROJECT_BASE, status: 'PUBLISHED', deletedAt: null },
        { id: '2', ...PROJECT_BASE, slug: 'otro', status: 'PUBLISHED', deletedAt: null },
      ];
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);
      (mockPrisma.project.count as jest.Mock).mockResolvedValue(2);

      const result = await projectService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PUBLISHED' as PostStatus, deletedAt: null }),
        })
      );
    });

    it('applies a tag filter via tags hasSome', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.project.count as jest.Mock).mockResolvedValue(0);

      await projectService.findAll({ tag: 'proyecto-rapido' });

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tags: { hasSome: ['proyecto-rapido'] } }),
        })
      );
    });

    it('applies a search filter across title/shortDescription/body', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.project.count as jest.Mock).mockResolvedValue(0);

      await projectService.findAll({ search: 'portafolio' });

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'portafolio', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('computes pagination metadata', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.project.count as jest.Mock).mockResolvedValue(25);

      const result = await projectService.findAll({ page: 2, limit: 10 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('findBySlug', () => {
    it('finds a PUBLISHED, non-deleted project by slug', async () => {
      const mockProject = { id: '1', ...PROJECT_BASE, status: 'PUBLISHED', deletedAt: null };
      (mockPrisma.project.findFirst as jest.Mock).mockResolvedValue(mockProject);

      const result = await projectService.findBySlug('portafolio-web');

      expect(result).toEqual(mockProject);
      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: { slug: 'portafolio-web', deletedAt: null, status: 'PUBLISHED' },
        select: expect.any(Object),
      });
    });

    it('returns null when the slug is unknown (controller maps to 404)', async () => {
      (mockPrisma.project.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await projectService.findBySlug('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('finds a project by id (admin by-id endpoint)', async () => {
      const mockProject = { id: 'abc', ...PROJECT_BASE, deletedAt: null };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await projectService.findById('abc');

      expect(result).toEqual(mockProject);
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'abc' },
        select: expect.any(Object),
      });
    });

    it('returns null when the id is unknown', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await projectService.findById('nope');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createData = {
      ...PROJECT_BASE,
      images: ['https://example.com/img.jpg'],
      repositoryUrl: 'https://github.com/example/portafolio',
      tags: ['proyecto-rapido'],
      status: 'DRAFT' as const,
    };

    it('creates a project with default featured/order and empty arrays when omitted', async () => {
      const mockCreated = { id: '1', ...createData, tags: [], deletedAt: null };
      (mockPrisma.project.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await projectService.create({ ...createData, tags: undefined, images: undefined, repositoryUrl: undefined });

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: createData.title,
            slug: createData.slug,
            tags: [],
            images: [],
            featured: false,
            order: 0,
          }),
        })
      );
    });

    it('sets publishedAt when status is PUBLISHED', async () => {
      const mockCreated = { id: '1', ...createData, status: 'PUBLISHED', publishedAt: new Date() };
      (mockPrisma.project.create as jest.Mock).mockResolvedValue(mockCreated);

      await projectService.create({ ...createData, status: 'PUBLISHED' });

      expect(mockPrisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PUBLISHED',
            publishedAt: expect.any(Date),
          }),
        })
      );
    });

    it('does not set publishedAt when status is DRAFT', async () => {
      const mockCreated = { id: '1', ...createData, publishedAt: null };
      (mockPrisma.project.create as jest.Mock).mockResolvedValue(mockCreated);

      await projectService.create(createData);

      const createCall = (mockPrisma.project.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('DRAFT');
      expect(createCall.data).not.toHaveProperty('publishedAt');
    });
  });

  describe('update', () => {
    it('updates provided fields only', async () => {
      const mockUpdated = { id: '1', ...PROJECT_BASE, title: 'Nuevo título', deletedAt: null };
      (mockPrisma.project.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await projectService.update('1', { title: 'Nuevo título' });

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'Nuevo título' },
        select: expect.any(Object),
      });
    });

    it('sets publishedAt when status changes to PUBLISHED', async () => {
      (mockPrisma.project.update as jest.Mock).mockResolvedValue({ id: '1', status: 'PUBLISHED', publishedAt: new Date() });

      await projectService.update('1', { status: 'PUBLISHED' });

      expect(mockPrisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED', publishedAt: expect.any(Date) }),
        })
      );
    });

    it('rejects the reserved "ALL" status with a ValidationError (400) instead of hitting Prisma', async () => {
      await expect(projectService.update('1', { status: 'ALL' as PostStatus })).rejects.toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });
      expect(mockPrisma.project.update).not.toHaveBeenCalled();
    });
  });

  describe('softDelete / restore', () => {
    it('soft deletes by setting deletedAt', async () => {
      const mockDeleted = { id: '1', ...PROJECT_BASE, deletedAt: new Date() };
      (mockPrisma.project.update as jest.Mock).mockResolvedValue(mockDeleted);

      const result = await projectService.softDelete('1');

      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
        select: expect.any(Object),
      });
    });

    it('restores by clearing deletedAt', async () => {
      const mockRestored = { id: '1', ...PROJECT_BASE, deletedAt: null };
      (mockPrisma.project.update as jest.Mock).mockResolvedValue(mockRestored);

      const result = await projectService.restore('1');

      expect(result.deletedAt).toBeNull();
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: null },
        select: expect.any(Object),
      });
    });
  });

  describe('updateStatus', () => {
    it('sets publishedAt when publishing', async () => {
      (mockPrisma.project.update as jest.Mock).mockResolvedValue({ id: '1', status: 'PUBLISHED', publishedAt: new Date() });

      const result = await projectService.updateStatus('1', 'PUBLISHED');

      expect(result.status).toBe('PUBLISHED');
      expect(mockPrisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED', publishedAt: expect.any(Date) }),
        })
      );
    });

    it('does not set publishedAt for non-PUBLISHED statuses', async () => {
      (mockPrisma.project.update as jest.Mock).mockResolvedValue({ id: '1', status: 'ARCHIVED', publishedAt: null });

      const result = await projectService.updateStatus('1', 'ARCHIVED');

      expect(result.status).toBe('ARCHIVED');
      expect(mockPrisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ARCHIVED' } })
      );
    });
  });

  describe('reorder', () => {
    it('sets the order field', async () => {
      const mockProject = { id: '1', ...PROJECT_BASE, order: 5, deletedAt: null };
      (mockPrisma.project.update as jest.Mock).mockResolvedValue(mockProject);

      const result = await projectService.reorder('1', 5);

      expect(result.order).toBe(5);
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { order: 5 },
        select: expect.any(Object),
      });
    });
  });

  describe('getTags', () => {
    it('returns distinct, sorted tags from PUBLISHED non-deleted projects only', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([
        { tags: ['b', 'a'] },
        { tags: ['c', 'a'] },
        { tags: ['d'] }, // draft would be excluded by the query
      ]);

      const result = await projectService.getTags();

      expect(result).toEqual(['a', 'b', 'c', 'd']);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED', deletedAt: null },
          select: { tags: true },
        })
      );
    });

    it('returns an empty array when there are no published tags', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);

      const result = await projectService.getTags();

      expect(result).toEqual([]);
    });
  });
});