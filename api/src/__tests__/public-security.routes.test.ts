import express from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import { PrismaClient } from '@prisma/client';
import serviceRoutes from '../routes/service.routes';
import productRoutes from '../routes/product.routes';
import toolRoutes from '../routes/tool.routes';
import successCaseRoutes from '../routes/successCase.routes';
import projectRoutes from '../routes/project.routes';
import blogPostRoutes from '../routes/blog-post.routes';
import portfolioRoutes from '../routes/portfolio.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import jwt from 'jsonwebtoken';
import { adminServiceRoutes } from '../routes/service.routes';
import { adminProductRoutes } from '../routes/product.routes';
import { adminToolRoutes } from '../routes/tool.routes';
import { adminSuccessCaseRoutes } from '../routes/successCase.routes';
import { adminProjectRoutes } from '../routes/project.routes';
import { adminBlogPostRoutes } from '../routes/blog-post.routes';

const mockPrisma = new PrismaClient();

const PUBLIC_COLLECTIONS = [
  '/api/services',
  '/api/products',
  '/api/tools',
  '/api/success-cases',
  '/api/projects',
  '/api/blog-posts',
] as const;

const ADMIN_COLLECTIONS = [
  ['/services', '/admin/services', 'service'],
  ['/products', '/admin/products', 'product'],
  ['/tools', '/admin/tools', 'tool'],
  ['/success-cases', '/admin/success-cases', 'successCase'],
  ['/projects', '/admin/projects', 'project'],
  ['/blog-posts', '/admin/blog-posts', 'blogPost'],
] as const;

describe('public API security contract', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'public-security-test-secret';
    const app = express();
    app.use(express.json());
    app.use('/api/services', serviceRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/tools', toolRoutes);
    app.use('/api/success-cases', successCaseRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/blog-posts', blogPostRoutes);
    app.use('/api/portfolio/projects', portfolioRoutes);
    app.use('/api/admin/services', adminServiceRoutes);
    app.use('/api/admin/products', adminProductRoutes);
    app.use('/api/admin/tools', adminToolRoutes);
    app.use('/api/admin/success-cases', adminSuccessCaseRoutes);
    app.use('/api/admin/projects', adminProjectRoutes);
    app.use('/api/admin/blog-posts', adminBlogPostRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server.close();
    delete process.env.JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.service.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.product.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.tool.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.tool.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.successCase.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.successCase.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.project.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.blogPost.count as jest.Mock).mockResolvedValue(0);
  });

  it.each(PUBLIC_COLLECTIONS)(
    'rejects unsafe status overrides on %s before Prisma executes',
    async (path) => {
      for (const status of ['ALL', 'DRAFT', 'PRIVATE', 'ARCHIVED', 'UNKNOWN']) {
        const res = await fetch(`${baseUrl}${path}?status=${status}`);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body).toEqual(expect.objectContaining({
          error: expect.objectContaining({
            code: expect.any(String),
            message: expect.any(String),
            fields: expect.any(Object),
          }),
        }));
      }
    },
  );

  it.each(PUBLIC_COLLECTIONS)(
    'rejects repeated status and invalid pagination on %s before Prisma executes',
    async (path) => {
      const invalidQueries = [
        'status=PUBLISHED&status=DRAFT',
        'page=0',
        'page=10001',
        'page=1.5',
        'page=nope',
        'limit=0',
        'limit=51',
        'limit=1.5',
        'limit=nope',
        'limit=999999999999999999999',
      ];

      for (const query of invalidQueries) {
        const res = await fetch(`${baseUrl}${path}?${query}`);
        expect(res.status).toBe(400);
      }

      expect(mockPrisma.service.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.tool.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.successCase.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.project.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.blogPost.findMany).not.toHaveBeenCalled();
    },
  );

  it('accepts an absent status and applies the safe published default', async () => {
    const res = await fetch(`${baseUrl}/api/services?page=2&limit=50`);

    expect(res.status).toBe(200);
    expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED', deletedAt: null },
        skip: 50,
        take: 50,
      }),
    );
  });

  it('accepts the explicit PUBLISHED status with bounded pagination', async () => {
    const res = await fetch(`${baseUrl}/api/services?status=PUBLISHED&page=2&limit=50`);

    expect(res.status).toBe(200);
    expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED', deletedAt: null },
        skip: 50,
        take: 50,
      }),
    );
  });

  it('caps portfolio aggregate reads and output at twelve records', async () => {
    const rows = Array.from({ length: 20 }, (_, index) => ({
      id: `p-${index}`,
      title: `Project ${index}`,
      slug: `project-${index}`,
      tags: [],
      shortDescription: 'Description',
      images: [],
      featured: false,
      order: index,
      createdAt: new Date(2024, 0, index + 1),
    }));
    (mockPrisma.project.findMany as jest.Mock).mockResolvedValue(rows);

    const res = await fetch(`${baseUrl}/api/portfolio/projects?limit=50`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(12);
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 12 }),
    );
  });

  it.each([
    ['/api/products/featured', 'product'],
    ['/api/tools/featured', 'tool'],
    ['/api/success-cases/recent', 'successCase'],
  ] as const)('caps featured/recent public endpoint %s at twelve', async (path, model) => {
    const rows = Array.from({ length: 20 }, (_, index) => ({
      id: `${model}-${index}`,
      title: `${model} ${index}`,
      slug: `${model}-${index}`,
      classification: 'web',
      shortDescription: 'Description',
      fullDescription: 'Full description',
      description: 'Description',
      images: [],
      technicalImages: [],
      videos: [],
      links: [],
      externalLink: null,
      featured: true,
      requiresInstall: false,
    }));
    const prismaModel = mockPrisma[model] as unknown as { findMany: jest.Mock };
    prismaModel.findMany.mockResolvedValue(rows);

    const res = await fetch(`${baseUrl}${path}?limit=50`);
    const body = await res.json();

    expect(res.status).toBe(200);
    const data = Array.isArray(body) ? body : body.data;
    expect(data).toHaveLength(12);
    expect(prismaModel.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 12 }));
  });

  it.each([
    ['/api/services/service-1', 'service'],
    ['/api/products/product-1', 'product'],
    ['/api/tools/tool-1', 'tool'],
    ['/api/success-cases/case-1', 'successCase'],
    ['/api/projects/project-1', 'project'],
    ['/api/blog-posts/post-1', 'blogPost'],
  ] as const)('does not return unpublished or deleted public detail %s', async (path, model) => {
    const fixture = {
      id: 'public-1',
      title: 'Public item',
      slug: 'public-item',
      status: 'DRAFT',
      deletedAt: new Date(),
      technicalExplanation: 'internal',
      classification: 'web',
      shortDescription: 'A public description',
      fullDescription: 'A full public description',
      includedItems: ['item'],
      images: [],
      technicalImages: [],
      externalLink: 'http://unsafe.example.com',
      featured: false,
      requiresInstall: false,
      description: 'A success case',
      videos: [],
      links: [],
      body: 'A body',
      repositoryUrl: 'http://unsafe.example.com/repository',
      tags: [],
      order: 0,
      category: 'test',
      coverImage: 'cover.jpg',
      mediaGallery: [],
      lessonsLearned: null,
    };
    const prismaModel = mockPrisma[model] as unknown as { findFirst: jest.Mock };
    prismaModel.findFirst.mockImplementation(
      ({ where }: { where: Record<string, unknown> }) => Promise.resolve(
        where.status === 'PUBLISHED' && where.deletedAt === null &&
        fixture.status === 'PUBLISHED' && fixture.deletedAt === null
          ? fixture
          : null,
      ),
    );

    const res = await fetch(`${baseUrl}${path}`);

    expect(res.status).toBe(404);
    expect(prismaModel.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: expect.any(String), status: 'PUBLISHED', deletedAt: null },
      }),
    );
  });

  it('returns a published detail fixture after database-like filtering', async () => {
    const publishedFixture = {
      id: 'public-1',
      title: 'Public item',
      slug: 'public-item',
      status: 'PUBLISHED',
      deletedAt: null,
      technicalExplanation: 'internal',
      classification: 'web',
      shortDescription: 'A public description',
      fullDescription: 'A full public description',
      includedItems: ['item'],
      images: [],
      technicalImages: [],
      externalLink: 'http://unsafe.example.com',
    };
    (mockPrisma.service.findFirst as jest.Mock).mockImplementation(
      ({ where }: { where: Record<string, unknown> }) => Promise.resolve(
        where.status === publishedFixture.status && where.deletedAt === publishedFixture.deletedAt
          ? publishedFixture
          : null,
      ),
    );

    const res = await fetch(`${baseUrl}/api/services/public-item`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBeUndefined();
    expect(body.deletedAt).toBeUndefined();
    expect(body.technicalExplanation).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('unsafe.example.com');
  });

  it.each(ADMIN_COLLECTIONS)(
    'keeps ALL-status %s list queries behind the authenticated %s route',
    async (publicPath, adminPath, model) => {
      const prismaModel = mockPrisma[model] as unknown as {
        findMany: jest.Mock;
        count: jest.Mock;
      };
      prismaModel.findMany.mockResolvedValue([
        { id: 'draft-1', title: 'Draft', status: 'DRAFT' },
      ]);
      prismaModel.count.mockResolvedValue(1);
      const token = jwt.sign({ userId: 'admin-1', role: 'ADMIN' }, process.env.JWT_SECRET as string);

      const publicResponse = await fetch(`${baseUrl}/api${publicPath}?status=ALL`);
      const adminResponse = await fetch(`${baseUrl}/api${adminPath}?status=ALL`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(publicResponse.status).toBe(400);
      expect(adminResponse.status).toBe(200);
      expect(prismaModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null } }),
      );
    },
  );
});
