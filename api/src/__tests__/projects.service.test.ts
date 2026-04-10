import { projectsService } from '../services/projects.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('Projects Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should aggregate all project types', async () => {
      const mockServices = [
        { id: 's1', title: 'Service 1', slug: 'service-1', classification: 'web', shortDescription: 'Desc', images: ['img1.jpg'], featured: true, createdAt: new Date('2024-01-01') },
      ];
      const mockProducts = [
        { id: 'p1', title: 'Product 1', slug: 'product-1', classification: 'app', shortDescription: 'Desc', images: ['img2.jpg'], featured: false, createdAt: new Date('2024-01-02') },
      ];
      const mockTools = [
        { id: 't1', title: 'Tool 1', slug: 'tool-1', classification: 'dev', shortDescription: 'Desc', images: ['img3.jpg'], featured: true, createdAt: new Date('2024-01-03') },
      ];
      const mockSuccessCases = [
        { id: 'c1', title: 'Case 1', slug: 'case-1', description: 'Description', images: ['img4.jpg'], createdAt: new Date('2024-01-04') },
      ];

      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue(mockTools);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue(mockSuccessCases);

      const result = await projectsService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(4);
      expect(result.data[0].type).toBe('successCase'); // Most recent
      expect(result.pagination.total).toBe(4);
    });

    it('should filter by type', async () => {
      const mockProducts = [
        { id: 'p1', title: 'Product 1', slug: 'product-1', classification: 'app', shortDescription: 'Desc', images: ['img.jpg'], featured: false, createdAt: new Date() },
      ];

      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await projectsService.findAll({ type: 'product' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('product');
      expect(mockPrisma.service.findMany).not.toHaveBeenCalled();
    });

    it('should filter by classification', async () => {
      const mockServices = [
        { id: 's1', title: 'Service', slug: 'service', classification: 'web', shortDescription: 'Desc', images: ['img.jpg'], featured: true, createdAt: new Date() },
      ];

      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);

      await projectsService.findAll({ classification: 'web' });

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ classification: 'web' }),
        })
      );
    });

    it('should handle empty results', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);

      const result = await projectsService.findAll({});

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should paginate results correctly', async () => {
      const mockItems = Array.from({ length: 25 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
        slug: `item-${i}`,
        classification: 'test',
        shortDescription: 'Desc',
        images: ['img.jpg'],
        featured: false,
        createdAt: new Date(2024, 0, i + 1),
      }));

      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue(mockItems.slice(0, 10));
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockItems.slice(10, 15));
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue(mockItems.slice(15, 20));
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue(mockItems.slice(20).map(item => ({ ...item, description: item.shortDescription })));

      const result = await projectsService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
    });

    it('should normalize successCase to have shortDescription', async () => {
      const mockSuccessCases = [
        { id: 'c1', title: 'Case', slug: 'case', description: 'Case description', images: ['img.jpg'], createdAt: new Date() },
      ];

      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue(mockSuccessCases);

      const result = await projectsService.findAll({});

      expect(result.data[0].shortDescription).toBe('Case description');
      expect(result.data[0].classification).toBe('success-case');
      expect(result.data[0].featured).toBe(false);
    });
  });

  describe('findRecent', () => {
    it('should return recent items from all types', async () => {
      const mockServices = [
        { id: 's1', title: 'Service', slug: 'service', classification: 'web', shortDescription: 'Desc', images: ['img.jpg'], featured: true, createdAt: new Date('2024-01-15') },
      ];
      const mockProducts = [
        { id: 'p1', title: 'Product', slug: 'product', classification: 'app', shortDescription: 'Desc', images: ['img.jpg'], featured: false, createdAt: new Date('2024-01-10') },
      ];
      const mockTools = [
        { id: 't1', title: 'Tool', slug: 'tool', classification: 'dev', shortDescription: 'Desc', images: ['img.jpg'], featured: true, createdAt: new Date('2024-01-20') },
      ];
      const mockSuccessCases = [
        { id: 'c1', title: 'Case', slug: 'case', description: 'Desc', images: ['img.jpg'], createdAt: new Date('2024-01-05') },
      ];

      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue(mockTools);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue(mockSuccessCases);

      const result = await projectsService.findRecent(3);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('tool'); // Most recent
    });

    it('should return items with first image', async () => {
      const mockServices = [
        { id: 's1', title: 'Service', slug: 'service', classification: 'web', shortDescription: 'Desc', images: ['image1.jpg', 'image2.jpg'], featured: true, createdAt: new Date() },
      ];

      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);

      const result = await projectsService.findRecent(3);

      expect(result[0].image).toBe('image1.jpg');
    });
  });

  describe('getClassifications', () => {
    it('should return unique classifications from all types', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([
        { classification: 'web' },
        { classification: 'mobile' },
      ]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([
        { classification: 'web' },
        { classification: 'desktop' },
      ]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([
        { classification: 'dev' },
      ]);

      const result = await projectsService.getClassifications();

      expect(result).toContain('web');
      expect(result).toContain('mobile');
      expect(result).toContain('desktop');
      expect(result).toContain('dev');
      expect(result).toEqual(['desktop', 'dev', 'mobile', 'web']); // Sorted
    });

    it('should deduplicate classifications', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([
        { classification: 'web' },
        { classification: 'web' },
      ]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);

      const result = await projectsService.getClassifications();

      expect(result.filter(c => c === 'web')).toHaveLength(1);
    });
  });
});
