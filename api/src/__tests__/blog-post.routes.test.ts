import express from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import blogPostRoutes from '../routes/blog-post.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

/**
 * Integration tests over the REAL express router (HTTP level, Node fetch).
 * Guards the route-order contract: /tags and /by-id/:id MUST be registered
 * before /:slug (Express matches in registration order).
 */
describe('BlogPost routes (integration)', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/blog-posts', blogPostRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/blog-posts`;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('route order guard', () => {
    it('GET /tags resolves to the tags endpoint, NOT /:slug', async () => {
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([
        { tags: ['react'] },
        { tags: ['laboratorio', 'react'] },
      ]);

      const res = await fetch(`${baseUrl}/tags`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual(['laboratorio', 'react']);
      // If /:slug matched first, this would be a 404 from findBySlug('tags').
      expect(mockPrisma.blogPost.findFirst).not.toHaveBeenCalled();
    });

    it('GET /by-id/:id hits the protected route, NOT /:slug (401 without JWT)', async () => {
      const res = await fetch(`${baseUrl}/by-id/abc123`);
      expect(res.status).toBe(401);
      expect(mockPrisma.blogPost.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('protected routes reject requests without JWT', () => {
    it('POST / → 401', async () => {
      const res = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'x' }),
      });
      expect(res.status).toBe(401);
    });

    it('PUT /:id → 401', async () => {
      const res = await fetch(`${baseUrl}/some-id`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'x' }),
      });
      expect(res.status).toBe(401);
    });

    it('DELETE /:id → 401', async () => {
      const res = await fetch(`${baseUrl}/some-id`, { method: 'DELETE' });
      expect(res.status).toBe(401);
    });

    it('PATCH /:id/status → 401', async () => {
      const res = await fetch(`${baseUrl}/some-id/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      expect(res.status).toBe(401);
    });

    it('PATCH /:id/restore → 401', async () => {
      const res = await fetch(`${baseUrl}/some-id/restore`, { method: 'PATCH' });
      expect(res.status).toBe(401);
    });
  });

  describe('public routes', () => {
    it('GET / returns the paginated post list', async () => {
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue([
        { id: '1', title: 'A', slug: 'a', status: 'PUBLISHED', deletedAt: null },
      ]);
      (mockPrisma.blogPost.count as jest.Mock).mockResolvedValue(1);

      const res = await fetch(`${baseUrl}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].slug).toBe('a');
      expect(body.pagination.total).toBe(1);
    });

    it('GET /:slug returns 404 for an unknown slug', async () => {
      (mockPrisma.blogPost.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await fetch(`${baseUrl}/no-existe`);
      expect(res.status).toBe(404);
    });
  });
});