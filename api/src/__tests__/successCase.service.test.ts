import { successCaseService } from '../services/successCase.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('SuccessCase Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated success cases', async () => {
      const mockCases = [
        { id: '1', title: 'Case 1', slug: 'case-1', deletedAt: null },
        { id: '2', title: 'Case 2', slug: 'case-2', deletedAt: null },
      ];
      
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue(mockCases);
      (mockPrisma.successCase.count as jest.Mock).mockResolvedValue(2);

      const result = await successCaseService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should not have classification filter', async () => {
      const mockCases = [{ id: '1', title: 'Case 1', deletedAt: null }];
      
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue(mockCases);
      (mockPrisma.successCase.count as jest.Mock).mockResolvedValue(1);

      await successCaseService.findAll({});

      expect(mockPrisma.successCase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
        })
      );
    });
  });

  describe('findBySlug', () => {
    it('should find success case by slug', async () => {
      const mockCase = { 
        id: '1', 
        title: 'Test Case', 
        slug: 'test-case', 
        description: 'Description',
        deletedAt: null 
      };
      (mockPrisma.successCase.findFirst as jest.Mock).mockResolvedValue(mockCase);

      const result = await successCaseService.findBySlug('test-case');

      expect(result).toEqual(mockCase);
    });

    it('should return null when case not found', async () => {
      (mockPrisma.successCase.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await successCaseService.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findRecent', () => {
    it('should return recent success cases', async () => {
      const mockCases = [
        { id: '1', title: 'Recent 1', createdAt: new Date(), deletedAt: null },
        { id: '2', title: 'Recent 2', createdAt: new Date(), deletedAt: null },
      ];
      
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue(mockCases);

      const result = await successCaseService.findRecent(3);

      expect(result).toHaveLength(2);
      expect(mockPrisma.successCase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ createdAt: 'desc' }],
          take: 3,
        })
      );
    });
  });

  describe('create', () => {
    it('should create a new success case with videos and links', async () => {
      const caseData = {
        title: 'New Case',
        slug: 'new-case',
        description: 'Case description',
        images: ['https://example.com/case.jpg'],
        videos: ['https://youtube.com/video1'],
        links: ['https://example.com'],
      };
      
      const mockCreatedCase = { 
        id: '1', 
        ...caseData, 
        videos: caseData.videos,
        links: caseData.links,
        deletedAt: null 
      };
      (mockPrisma.successCase.create as jest.Mock).mockResolvedValue(mockCreatedCase);

      const result = await successCaseService.create(caseData);

      expect(result).toEqual(mockCreatedCase);
      expect(mockPrisma.successCase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: caseData.title,
          videos: caseData.videos,
          links: caseData.links,
        }),
        select: expect.any(Object),
      });
    });

    it('should create with empty videos and links arrays by default', async () => {
      const caseData = {
        title: 'Simple Case',
        slug: 'simple-case',
        description: 'Description',
        images: ['https://example.com/case.jpg'],
      };
      
      const mockCreatedCase = { 
        id: '1', 
        ...caseData, 
        videos: [],
        links: [],
        deletedAt: null 
      };
      (mockPrisma.successCase.create as jest.Mock).mockResolvedValue(mockCreatedCase);

      await successCaseService.create(caseData);

      expect(mockPrisma.successCase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          videos: [],
          links: [],
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update success case with videos and links', async () => {
      const updateData = { 
        videos: ['https://vimeo.com/video1'],
        links: ['https://github.com/project'],
      };
      const mockUpdatedCase = { 
        id: '1', 
        title: 'Case', 
        videos: updateData.videos,
        links: updateData.links,
        deletedAt: null 
      };
      
      (mockPrisma.successCase.update as jest.Mock).mockResolvedValue(mockUpdatedCase);

      const result = await successCaseService.update('1', updateData);

      expect(result.videos).toEqual(updateData.videos);
      expect(result.links).toEqual(updateData.links);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a success case', async () => {
      const mockCase = { id: '1', title: 'Case', deletedAt: new Date() };
      (mockPrisma.successCase.update as jest.Mock).mockResolvedValue(mockCase);

      const result = await successCaseService.softDelete('1');

      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted success case', async () => {
      const mockCase = { id: '1', title: 'Case', deletedAt: null };
      (mockPrisma.successCase.update as jest.Mock).mockResolvedValue(mockCase);

      const result = await successCaseService.restore('1');

      expect(result.deletedAt).toBeNull();
    });
  });

  describe('no reorder method', () => {
    it('should not have reorder method unlike product/tool', () => {
      expect(successCaseService.reorder).toBeUndefined();
    });
  });
});
