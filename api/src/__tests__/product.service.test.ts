import { productService } from '../services/product.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        { id: '1', title: 'Product 1', slug: 'product-1', deletedAt: null },
        { id: '2', title: 'Product 2', slug: 'product-2', deletedAt: null },
      ];
      
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (mockPrisma.product.count as jest.Mock).mockResolvedValue(2);

      const result = await productService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by classification', async () => {
      const mockProducts = [
        { id: '1', title: 'Product 1', slug: 'product-1', classification: 'software', deletedAt: null },
      ];
      
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (mockPrisma.product.count as jest.Mock).mockResolvedValue(1);

      const result = await productService.findAll({ classification: 'software' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ classification: 'software' }),
        })
      );
    });

    it('should filter by featured', async () => {
      const mockProducts = [
        { id: '1', title: 'Featured Product', featured: true, deletedAt: null },
      ];
      
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (mockPrisma.product.count as jest.Mock).mockResolvedValue(1);

      await productService.findAll({ featured: true });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ featured: true }),
        })
      );
    });
  });

  describe('findBySlug', () => {
    it('should find product by slug', async () => {
      const mockProduct = { id: '1', title: 'Test Product', slug: 'test-product', deletedAt: null };
      (mockPrisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.findBySlug('test-product');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findFirst).toHaveBeenCalledWith({
        where: { slug: 'test-product', deletedAt: null },
        select: expect.any(Object),
      });
    });

    it('should return null when product not found', async () => {
      (mockPrisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await productService.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findFeatured', () => {
    it('should return featured products', async () => {
      const mockProducts = [
        { id: '1', title: 'Featured 1', featured: true, deletedAt: null },
        { id: '2', title: 'Featured 2', featured: true, deletedAt: null },
      ];
      
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.findFeatured(3);

      expect(result).toHaveLength(2);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { featured: true, deletedAt: null },
          take: 3,
        })
      );
    });
  });

  describe('findById', () => {
    it('should find product by id', async () => {
      const mockProduct = { id: '123', title: 'Test Product', deletedAt: null };
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.findById('123');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        select: expect.any(Object),
      });
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const productData = {
        title: 'New Product',
        slug: 'new-product',
        classification: 'software',
        shortDescription: 'Short desc',
        fullDescription: 'Full description here',
        images: ['https://example.com/image.jpg'],
        order: 0,
        featured: false,
      };
      
      const mockCreatedProduct = { id: '1', ...productData, deletedAt: null };
      (mockPrisma.product.create as jest.Mock).mockResolvedValue(mockCreatedProduct);

      const result = await productService.create(productData);

      expect(result).toEqual(mockCreatedProduct);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: productData.title,
          slug: productData.slug,
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const updateData = { title: 'Updated Title' };
      const mockUpdatedProduct = { id: '1', title: 'Updated Title', deletedAt: null };
      
      (mockPrisma.product.update as jest.Mock).mockResolvedValue(mockUpdatedProduct);

      const result = await productService.update('1', updateData);

      expect(result).toEqual(mockUpdatedProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'Updated Title' },
        select: expect.any(Object),
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a product', async () => {
      const mockProduct = { id: '1', title: 'Product', deletedAt: new Date() };
      (mockPrisma.product.update as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.softDelete('1');

      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
        select: expect.any(Object),
      });
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted product', async () => {
      const mockProduct = { id: '1', title: 'Product', deletedAt: null };
      (mockPrisma.product.update as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.restore('1');

      expect(result.deletedAt).toBeNull();
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: null },
        select: expect.any(Object),
      });
    });
  });

  describe('reorder', () => {
    it('should update product order', async () => {
      const mockProduct = { id: '1', title: 'Product', order: 5, deletedAt: null };
      (mockPrisma.product.update as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.reorder('1', 5);

      expect(result.order).toBe(5);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { order: 5 },
        select: expect.any(Object),
      });
    });
  });

  describe('getClassifications', () => {
    it('should return unique classifications', async () => {
      const mockClassifications = [
        { classification: 'software' },
        { classification: 'hardware' },
        { classification: 'software' },
      ];
      
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockClassifications);

      const result = await productService.getClassifications();

      expect(result).toContain('software');
      expect(result).toContain('hardware');
    });
  });
});
