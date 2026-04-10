import { toolService } from '../services/tool.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('Tool Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated tools', async () => {
      const mockTools = [
        { id: '1', title: 'Tool 1', slug: 'tool-1', deletedAt: null },
        { id: '2', title: 'Tool 2', slug: 'tool-2', deletedAt: null },
      ];
      
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue(mockTools);
      (mockPrisma.tool.count as jest.Mock).mockResolvedValue(2);

      const result = await toolService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by requiresInstall', async () => {
      const mockTools = [
        { id: '1', title: 'Tool 1', requiresInstall: true, deletedAt: null },
      ];
      
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue(mockTools);
      (mockPrisma.tool.count as jest.Mock).mockResolvedValue(1);

      const result = await toolService.findAll({});

      expect(mockPrisma.tool.findMany).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should find tool by slug', async () => {
      const mockTool = { id: '1', title: 'Test Tool', slug: 'test-tool', deletedAt: null };
      (mockPrisma.tool.findFirst as jest.Mock).mockResolvedValue(mockTool);

      const result = await toolService.findBySlug('test-tool');

      expect(result).toEqual(mockTool);
    });

    it('should return null when tool not found', async () => {
      (mockPrisma.tool.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await toolService.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findFeatured', () => {
    it('should return featured tools', async () => {
      const mockTools = [
        { id: '1', title: 'Featured Tool', featured: true, deletedAt: null },
      ];
      
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue(mockTools);

      const result = await toolService.findFeatured(3);

      expect(result).toHaveLength(1);
      expect(mockPrisma.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { featured: true, deletedAt: null },
          take: 3,
        })
      );
    });
  });

  describe('create', () => {
    it('should create a new tool with requiresInstall', async () => {
      const toolData = {
        title: 'New Tool',
        slug: 'new-tool',
        classification: 'development',
        shortDescription: 'Short desc',
        fullDescription: 'Full description',
        images: ['https://example.com/tool.jpg'],
        requiresInstall: true,
        order: 0,
        featured: false,
      };
      
      const mockCreatedTool = { id: '1', ...toolData, deletedAt: null };
      (mockPrisma.tool.create as jest.Mock).mockResolvedValue(mockCreatedTool);

      const result = await toolService.create(toolData);

      expect(result).toEqual(mockCreatedTool);
      expect(mockPrisma.tool.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: toolData.title,
          requiresInstall: true,
        }),
        select: expect.any(Object),
      });
    });

    it('should create tool with requiresInstall false by default', async () => {
      const toolData = {
        title: 'Simple Tool',
        slug: 'simple-tool',
        classification: 'utility',
        shortDescription: 'Short desc',
        fullDescription: 'Full description',
        images: ['https://example.com/tool.jpg'],
        order: 0,
        featured: false,
      };
      
      const mockCreatedTool = { id: '1', ...toolData, requiresInstall: false, deletedAt: null };
      (mockPrisma.tool.create as jest.Mock).mockResolvedValue(mockCreatedTool);

      await toolService.create(toolData);

      expect(mockPrisma.tool.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          requiresInstall: false,
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update requiresInstall field', async () => {
      const updateData = { requiresInstall: false };
      const mockUpdatedTool = { id: '1', title: 'Tool', requiresInstall: false, deletedAt: null };
      
      (mockPrisma.tool.update as jest.Mock).mockResolvedValue(mockUpdatedTool);

      const result = await toolService.update('1', updateData);

      expect(result.requiresInstall).toBe(false);
      expect(mockPrisma.tool.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { requiresInstall: false },
        select: expect.any(Object),
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a tool', async () => {
      const mockTool = { id: '1', title: 'Tool', deletedAt: new Date() };
      (mockPrisma.tool.update as jest.Mock).mockResolvedValue(mockTool);

      const result = await toolService.softDelete('1');

      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted tool', async () => {
      const mockTool = { id: '1', title: 'Tool', deletedAt: null };
      (mockPrisma.tool.update as jest.Mock).mockResolvedValue(mockTool);

      const result = await toolService.restore('1');

      expect(result.deletedAt).toBeNull();
    });
  });
});
