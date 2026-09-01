import { portfolioService } from '../services/portfolio.service';
import { PrismaClient } from '@prisma/client';

/**
 * Portfolio aggregation regression tests.
 * Merges Project + Service + Product + Tool + SuccessCase + lab BlogPosts
 * (tags-based: `tags hasSome [laboratorio, experimento]`, articulo excluded).
 * EVERY source MUST be status=PUBLISHED + deletedAt null (regression guard
 * against the old aggregation that leaked DRAFT/PRIVATE rows).
 */

const mockPrisma = new PrismaClient();

/** Regression guard: every source query MUST filter PUBLISHED + deletedAt null. */
function expectPublishedOnly(mock: jest.Mock) {
  expect(mock).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ status: 'PUBLISHED', deletedAt: null }),
    })
  );
}

describe('Portfolio Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('queries every aggregation source with status PUBLISHED and deletedAt null (no status leak)', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      await portfolioService.findAll({ page: 1, limit: 10 });

      expectPublishedOnly(mockPrisma.project.findMany as jest.Mock);
      expectPublishedOnly(mockPrisma.service.findMany as jest.Mock);
      expectPublishedOnly(mockPrisma.product.findMany as jest.Mock);
      expectPublishedOnly(mockPrisma.tool.findMany as jest.Mock);
      expectPublishedOnly(mockPrisma.successCase.findMany as jest.Mock);
      expectPublishedOnly(mockPrisma.blogPost.findMany as jest.Mock);
    });

    it('queries BlogPost for lab posts via tags hasSome (laboratorio/experimento) with PUBLISHED + deletedAt null, articulo excluded', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      await portfolioService.findAll({ page: 1, limit: 10 });

      expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
            deletedAt: null,
            AND: expect.arrayContaining([
              { tags: { hasSome: ['laboratorio', 'experimento'] } },
              { NOT: { tags: { hasSome: ['articulo'] } } },
            ]),
          }),
        })
      );
    });

    it('excludes posts tagged articulo even when they also carry a lab tag', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      await portfolioService.findAll({ page: 1, limit: 10 });

      const blogPostCall = (mockPrisma.blogPost.findMany as jest.Mock).mock.calls[0][0];
      expect(blogPostCall.where.AND).toEqual(
        expect.arrayContaining([{ NOT: { tags: { hasSome: ['articulo'] } } }])
      );
    });

    it('includes lab blog posts as type "laboratorio" with cover image and first tag as classification', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'b1',
          title: 'Simulador de circuitos',
          slug: 'simulador-circuitos',
          tags: ['laboratorio', 'electronica'],
          shortDescription: 'Post de laboratorio',
          coverImage: 'https://example.com/cover.jpg',
          mediaGallery: ['https://example.com/g1.jpg'],
          createdAt: new Date('2024-01-06'),
        },
      ]);

      const result = await portfolioService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          type: 'laboratorio',
          title: 'Simulador de circuitos',
          slug: 'simulador-circuitos',
          classification: 'laboratorio',
          image: 'https://example.com/cover.jpg',
          images: ['https://example.com/cover.jpg', 'https://example.com/g1.jpg'],
        })
      );
    });

    it('filters lab posts by tag when a classification is selected', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      await portfolioService.findAll({ classification: 'laboratorio' });

      const blogPostCall = (mockPrisma.blogPost.findMany as jest.Mock).mock.calls[0][0];
      expect(blogPostCall.where.AND).toEqual(
        expect.arrayContaining([{ tags: { hasSome: ['laboratorio'] } }])
      );
    });

    it('includes real Project rows as type "project" with tags exposed', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'p1',
          title: 'Portafolio Web',
          slug: 'portafolio-web',
          shortDescription: 'Desc',
          tags: ['proyecto-rapido'],
          images: ['https://example.com/img.jpg'],
          featured: true,
          order: 2,
          createdAt: new Date('2024-01-05'),
        },
      ]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      const result = await portfolioService.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          type: 'project',
          title: 'Portafolio Web',
          slug: 'portafolio-web',
          tags: ['proyecto-rapido'],
          classification: 'proyecto-rapido',
          image: 'https://example.com/img.jpg',
          featured: true,
        })
      );
    });

    it('merges legacy sources (service/product/tool/successCase) preserving type and classification', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([
        { id: 's1', title: 'Servicio', slug: 'servicio', classification: 'web', shortDescription: 'Desc', images: ['i.jpg'], createdAt: new Date('2024-01-01') },
      ]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 'p1', title: 'Producto', slug: 'producto', classification: 'app', shortDescription: 'Desc', images: ['i.jpg'], featured: true, createdAt: new Date('2024-01-02') },
      ]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([
        { id: 't1', title: 'Herramienta', slug: 'herramienta', classification: 'dev', shortDescription: 'Desc', images: ['i.jpg'], featured: false, createdAt: new Date('2024-01-03') },
      ]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([
        { id: 'c1', title: 'Caso', slug: 'caso', description: 'Desc caso', images: ['i.jpg'], createdAt: new Date('2024-01-04') },
      ]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      const result = await portfolioService.findAll({});

      const types = result.data.map((item) => item.type);
      expect(types).toEqual(['successCase', 'tool', 'product', 'service']); // sorted by createdAt desc
      expect(result.data.find((i) => i.type === 'successCase')?.classification).toBe('success-case');
      expect(result.data.find((i) => i.type === 'product')?.featured).toBe(true);
    });

    it('sorts merged rows by createdAt desc and paginates', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([
        { id: 'p1', title: 'Proyecto', slug: 'proyecto', shortDescription: 'D', tags: ['x'], images: [], featured: false, order: 0, createdAt: new Date('2024-01-01') },
        { id: 'p2', title: 'Proyecto 2', slug: 'proyecto-2', shortDescription: 'D', tags: ['x'], images: [], featured: false, order: 0, createdAt: new Date('2024-01-02') },
        { id: 'p3', title: 'Proyecto 3', slug: 'proyecto-3', shortDescription: 'D', tags: ['x'], images: [], featured: false, order: 0, createdAt: new Date('2024-01-03') },
      ]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      const result = await portfolioService.findAll({ page: 2, limit: 2 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe('proyecto'); // oldest remaining on page 2
      expect(result.pagination).toEqual({
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('filters projects by classification via tags hasSome and legacy by classification', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      await portfolioService.findAll({ classification: 'proyecto-rapido' });

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tags: { hasSome: ['proyecto-rapido'] } }),
        })
      );
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ classification: 'proyecto-rapido' }),
        })
      );
    });
  });

  describe('findRecent', () => {
    it('returns the top N newest rows across all sources, PUBLISHED only', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([
        { id: 'p1', title: 'Proyecto', slug: 'proyecto', shortDescription: 'D', tags: [], images: [], featured: false, order: 0, createdAt: new Date('2024-01-10') },
      ]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([
        { id: 's1', title: 'Servicio', slug: 'servicio', classification: 'web', shortDescription: 'D', images: [], createdAt: new Date('2024-01-05') },
      ]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      const result = await portfolioService.findRecent(2);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('project'); // newest first
      expect(result[1].type).toBe('service');
      expectPublishedOnly(mockPrisma.project.findMany as jest.Mock);
      expectPublishedOnly(mockPrisma.blogPost.findMany as jest.Mock);
    });

    it('includes lab posts in recent, PUBLISHED only, merged by createdAt', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'b1',
          title: 'Laboratorio',
          slug: 'laboratorio-1',
          tags: ['laboratorio'],
          shortDescription: 'D',
          coverImage: 'c.jpg',
          mediaGallery: [],
          createdAt: new Date('2024-01-09'),
        },
      ]);

      const result = await portfolioService.findRecent(3);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('laboratorio');
      expectPublishedOnly(mockPrisma.blogPost.findMany as jest.Mock);
    });

    it('does not select featured for Service (model has no featured field — would throw at runtime)', async () => {
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

      await portfolioService.findRecent(3);

      const serviceCall = (mockPrisma.service.findMany as jest.Mock).mock.calls[0][0];
      expect(serviceCall.select).not.toHaveProperty('featured');
      // products/tools DO carry featured
      const productCall = (mockPrisma.product.findMany as jest.Mock).mock.calls[0][0];
      expect(productCall.select.featured).toBe(true);
    });
  });

  describe('getClassifications', () => {
    it('merges legacy classifications with project tags, deduped and sorted', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([{ classification: 'web' }]);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([{ classification: 'app' }]);
      (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([{ classification: 'web' }]);
      (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([
        { tags: ['proyecto-rapido'] },
        { tags: ['pedagogico', 'proyecto-rapido'] },
      ]);

      const result = await portfolioService.getClassifications();

      expect(result).toEqual(['app', 'pedagogico', 'proyecto-rapido', 'web']);
      expectPublishedOnly(mockPrisma.project.findMany as jest.Mock);
    });
  });
});