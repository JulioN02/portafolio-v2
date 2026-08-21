import { siteSectionService } from '../services/siteSection.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('siteSectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSection = { id: 'sec1', key: 'services', label: 'Servicios', visible: true, order: 0 };

  describe('findAll', () => {
    it('returns sections ordered by order asc', async () => {
      (mockPrisma.siteSection.findMany as jest.Mock).mockResolvedValue([mockSection]);
      const result = await siteSectionService.findAll();
      expect(mockPrisma.siteSection.findMany).toHaveBeenCalledWith({
        select: expect.any(Object),
        orderBy: [{ order: 'asc' }],
      });
      expect(result).toEqual([mockSection]);
    });

    it('propagates errors', async () => {
      (mockPrisma.siteSection.findMany as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(siteSectionService.findAll()).rejects.toThrow('boom');
    });
  });

  describe('findById', () => {
    it('finds a section by id', async () => {
      (mockPrisma.siteSection.findUnique as jest.Mock).mockResolvedValue(mockSection);
      const result = await siteSectionService.findById('sec1');
      expect(mockPrisma.siteSection.findUnique).toHaveBeenCalledWith({
        where: { id: 'sec1' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockSection);
    });

    it('propagates errors', async () => {
      (mockPrisma.siteSection.findUnique as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(siteSectionService.findById('sec1')).rejects.toThrow('boom');
    });
  });

  describe('reorder', () => {
    it('updates orders in a transaction and returns reordered sections', async () => {
      const sections = [{ id: 'sec1', order: 1 }, { id: 'sec2', order: 2 }];
      (mockPrisma.$transaction as jest.Mock).mockResolvedValue([mockSection, mockSection]);
      (mockPrisma.siteSection.findMany as jest.Mock).mockResolvedValue([mockSection, mockSection]);

      const result = await siteSectionService.reorder({ sections });

      expect(mockPrisma.siteSection.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.siteSection.findMany).toHaveBeenCalledWith({ select: expect.any(Object), orderBy: [{ order: 'asc' }] });
      expect(result).toHaveLength(2);
    });

    it('propagates errors when transaction fails', async () => {
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(siteSectionService.reorder({ sections: [{ id: 'sec1', order: 1 }] })).rejects.toThrow('boom');
    });
  });

  describe('update', () => {
    it('updates visible and label when provided', async () => {
      (mockPrisma.siteSection.update as jest.Mock).mockResolvedValue({ ...mockSection, visible: false });
      const result = await siteSectionService.update('sec1', { visible: false, label: 'Serv' } as any);
      expect(mockPrisma.siteSection.update).toHaveBeenCalledWith({
        where: { id: 'sec1' },
        data: { visible: false, label: 'Serv' },
        select: expect.any(Object),
      });
      expect(result.visible).toBe(false);
    });

    it('ignores undefined fields', async () => {
      (mockPrisma.siteSection.update as jest.Mock).mockResolvedValue(mockSection);
      await siteSectionService.update('sec1', { visible: undefined } as any);
      expect(mockPrisma.siteSection.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: {} }),
      );
    });

    it('propagates errors', async () => {
      (mockPrisma.siteSection.update as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(siteSectionService.update('sec1', { visible: false } as any)).rejects.toThrow('boom');
    });
  });
});