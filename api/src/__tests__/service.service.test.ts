import { serviceService } from '../services/service.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('serviceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockService = { id: 's1', slug: 'desarrollo-web', status: 'DRAFT' };

  describe('findAll', () => {
    it('returns paginated services', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([mockService]);
      (mockPrisma.service.count as jest.Mock).mockResolvedValue(1);

      const result = await serviceService.findAll({ page: 1, limit: 10 });

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null, status: 'PUBLISHED' }, skip: 0, take: 10 }),
      );
      expect(result.data).toEqual([mockService]);
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false });
    });

    it('filters by status and classification', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.count as jest.Mock).mockResolvedValue(0);

      await serviceService.findAll({ status: 'PUBLISHED', classification: 'Web' });

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null, status: 'PUBLISHED', classification: 'Web' } }),
      );
    });

    it('propagates errors', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(serviceService.findAll({})).rejects.toThrow('boom');
    });
  });

  describe('findBySlug', () => {
    it('finds a service by slug (non-deleted)', async () => {
      (mockPrisma.service.findFirst as jest.Mock).mockResolvedValue(mockService);
      const result = await serviceService.findBySlug('desarrollo-web');
      expect(mockPrisma.service.findFirst).toHaveBeenCalledWith({
        where: { slug: 'desarrollo-web', deletedAt: null },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockService);
    });

    it('propagates errors', async () => {
      (mockPrisma.service.findFirst as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(serviceService.findBySlug('x')).rejects.toThrow('boom');
    });
  });

  describe('findById', () => {
    it('finds a service by id', async () => {
      (mockPrisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      const result = await serviceService.findById('s1');
      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({ where: { id: 's1' }, select: expect.any(Object) });
      expect(result).toEqual(mockService);
    });

    it('propagates errors', async () => {
      (mockPrisma.service.findUnique as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(serviceService.findById('s1')).rejects.toThrow('boom');
    });
  });

  describe('create', () => {
    it('creates a service with DRAFT default', async () => {
      (mockPrisma.service.create as jest.Mock).mockResolvedValue(mockService);
      const result = await serviceService.create({ title: 'S', slug: 's' } as any);
      expect(mockPrisma.service.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'DRAFT' }) }),
      );
      expect(result).toEqual(mockService);
    });

    it('sets publishedAt when status is PUBLISHED', async () => {
      (mockPrisma.service.create as jest.Mock).mockResolvedValue({ ...mockService, status: 'PUBLISHED' });
      const result = await serviceService.create({ title: 'S', slug: 's', status: 'PUBLISHED' } as any);
      expect(mockPrisma.service.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'PUBLISHED', publishedAt: expect.any(Date) }) }),
      );
      expect(result.status).toBe('PUBLISHED');
    });

    it('propagates errors', async () => {
      (mockPrisma.service.create as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(serviceService.create({} as any)).rejects.toThrow('boom');
    });
  });

  describe('update', () => {
    it('updates only provided fields', async () => {
      (mockPrisma.service.update as jest.Mock).mockResolvedValue(mockService);
      const result = await serviceService.update('s1', { title: 'S2' } as any);
      expect(mockPrisma.service.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 's1' }, data: { title: 'S2' } }),
      );
      expect(result).toEqual(mockService);
    });

    it('sets publishedAt when status changes to PUBLISHED', async () => {
      (mockPrisma.service.update as jest.Mock).mockResolvedValue({ ...mockService, status: 'PUBLISHED' });
      await serviceService.update('s1', { status: 'PUBLISHED' } as any);
      expect(mockPrisma.service.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'PUBLISHED', publishedAt: expect.any(Date) }) }),
      );
    });

    it('propagates errors', async () => {
      (mockPrisma.service.update as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(serviceService.update('s1', {} as any)).rejects.toThrow('boom');
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt', async () => {
      (mockPrisma.service.update as jest.Mock).mockResolvedValue({ ...mockService, deletedAt: new Date() });
      const result = await serviceService.softDelete('s1');
      expect(mockPrisma.service.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 's1' }, data: { deletedAt: expect.any(Date) } }),
      );
      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it('propagates errors', async () => {
      (mockPrisma.service.update as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(serviceService.softDelete('s1')).rejects.toThrow('boom');
    });
  });

  describe('restore', () => {
    it('clears deletedAt', async () => {
      (mockPrisma.service.update as jest.Mock).mockResolvedValue({ ...mockService, deletedAt: null });
      const result = await serviceService.restore('s1');
      expect(mockPrisma.service.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 's1' }, data: { deletedAt: null } }),
      );
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('updates status and sets publishedAt when publishing', async () => {
      (mockPrisma.service.update as jest.Mock).mockResolvedValue({ ...mockService, status: 'PUBLISHED', publishedAt: new Date() });
      const result = await serviceService.updateStatus('s1', 'PUBLISHED');
      expect(mockPrisma.service.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 's1' }, data: expect.objectContaining({ status: 'PUBLISHED', publishedAt: expect.any(Date) }) }),
      );
      expect(result.status).toBe('PUBLISHED');
    });

    it('updates status without publishedAt when not publishing', async () => {
      (mockPrisma.service.update as jest.Mock).mockResolvedValue({ ...mockService, status: 'ARCHIVED' });
      await serviceService.updateStatus('s1', 'ARCHIVED');
      expect(mockPrisma.service.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ARCHIVED' } }),
      );
    });

    it('propagates errors', async () => {
      (mockPrisma.service.update as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(serviceService.updateStatus('s1', 'PUBLISHED')).rejects.toThrow('boom');
    });
  });

  describe('getClassifications', () => {
    it('returns unique classifications', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([
        { classification: 'Web' },
        { classification: 'Movil' },
      ]);
      const result = await serviceService.getClassifications();
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null }, distinct: ['classification'] }),
      );
      expect(result).toEqual(['Web', 'Movil']);
    });

    it('propagates errors', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(serviceService.getClassifications()).rejects.toThrow('boom');
    });
  });
});