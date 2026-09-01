import express from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import portfolioRoutes from '../routes/portfolio.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('Portfolio routes (integration)', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/portfolio/projects', portfolioRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/portfolio/projects`;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns the merged paginated portfolio including lab blog posts as type "laboratorio"', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([
      { id: 'p1', title: 'Proyecto', slug: 'proyecto', tags: ['x'], shortDescription: 'D', images: [], featured: false, order: 0, createdAt: new Date('2024-01-02') },
    ]);
    (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([
      { id: 'b1', title: 'Laboratorio', slug: 'lab-1', tags: ['laboratorio'], shortDescription: 'D', coverImage: 'c.jpg', mediaGallery: [], createdAt: new Date('2024-01-03') },
    ]);

    const res = await fetch(`${baseUrl}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].type).toBe('laboratorio'); // newest first
    expect(body.data[0].classification).toBe('laboratorio'); // first tag
    expect(body.data[1].type).toBe('project');
    expect(body.pagination.total).toBe(2);
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

  it('GET /recent returns the top N merged rows', async () => {
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([
      { id: 'p1', title: 'Proyecto', slug: 'proyecto', tags: [], shortDescription: 'D', images: [], featured: false, order: 0, createdAt: new Date('2024-01-03') },
    ]);
    (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([
      { id: 's1', title: 'Servicio', slug: 'servicio', classification: 'web', shortDescription: 'D', images: [], featured: true, createdAt: new Date('2024-01-01') },
    ]);
    (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

    const res = await fetch(`${baseUrl}/recent?limit=2`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].type).toBe('project');
  });

  it('GET /classifications returns deduped classifications + project tags', async () => {
    (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([{ classification: 'web' }]);
    (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([{ tags: ['proyecto-rapido'] }]);
    (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);

    const res = await fetch(`${baseUrl}/classifications`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual(['proyecto-rapido', 'web']);
  });

  it('GET / rejects an invalid type filter with 400', async () => {
    const res = await fetch(`${baseUrl}?type=bogus`);
    expect(res.status).toBe(400);
  });
});