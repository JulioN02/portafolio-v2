import express from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import serviceRoutes from '../routes/service.routes';
import productRoutes from '../routes/product.routes';
import toolRoutes from '../routes/tool.routes';
import successCaseRoutes from '../routes/successCase.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

/**
 * Status-filter hardening integration tests (status-management capability):
 *  - GET /by-id/:id on service/product/tool/successCase is now PROTECTED
 *    (admin-only). Public sites only use /:slug, so protecting by-id cannot
 *    break public rendering.
 *  - The controller passes ?status=ALL through so admin edit pages still open
 *    drafts; without it, the service filters PUBLISHED.
 *  - Route-order guard: /by-id/:id must NOT fall through to /:slug.
 */
const ROUTERS = [
  { name: 'services', mount: '/api/services', model: 'service', router: serviceRoutes },
  { name: 'products', mount: '/api/products', model: 'product', router: productRoutes },
  { name: 'tools', mount: '/api/tools', model: 'tool', router: toolRoutes },
  { name: 'success-cases', mount: '/api/success-cases', model: 'successCase', router: successCaseRoutes },
] as const;

describe('GET /by-id/:id requires auth + ?status=ALL passthrough', () => {
  let server: Server;
  let baseUrl: string;
  let validToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    validToken = jwt.sign(
      { userId: 'admin-1', username: 'admin', role: 'ADMIN' },
      'test-secret',
      { expiresIn: '12h' },
    );

    const app = express();
    app.use(express.json());
    for (const r of ROUTERS) {
      app.use(r.mount, r.router);
    }
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
  });

  for (const { name, model } of ROUTERS) {
    describe(`${name} router`, () => {
      const mock = () => (mockPrisma as Record<string, Record<string, jest.Mock>>)[model];

      it('rejects GET /by-id/:id without a JWT (401)', async () => {
        const res = await fetch(`${baseUrl}/api/${name}/by-id/abc123`);
        expect(res.status).toBe(401);
        // Route-order guard: the protected route matched, NOT /:slug.
        expect(mock().findFirst).not.toHaveBeenCalled();
      });

      it('allows GET /by-id/:id with a valid JWT (admin)', async () => {
        const entity = { id: 'abc123', title: 'Entity', status: 'PUBLISHED' };
        mock().findUnique.mockResolvedValue(entity);

        const res = await fetch(`${baseUrl}/api/${name}/by-id/abc123`, {
          headers: { Authorization: `Bearer ${validToken}` },
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.id).toBe('abc123');
        expect(mock().findUnique).toHaveBeenCalledWith({
          where: { id: 'abc123', status: 'PUBLISHED' },
          select: expect.any(Object),
        });
        expect(mock().findFirst).not.toHaveBeenCalled();
      });

      it("passes ?status=ALL through so admin still sees drafts", async () => {
        const draft = { id: 'draft-1', title: 'Draft', status: 'DRAFT' };
        mock().findUnique.mockResolvedValue(draft);

        const res = await fetch(`${baseUrl}/api/${name}/by-id/draft-1?status=ALL`, {
          headers: { Authorization: `Bearer ${validToken}` },
        });

        expect(res.status).toBe(200);
        expect(mock().findUnique).toHaveBeenCalledWith({
          where: { id: 'draft-1' },
          select: expect.any(Object),
        });
      });

      it('keeps the public GET /:slug detail route working (404 for unknown)', async () => {
        mock().findFirst.mockResolvedValue(null);

        const res = await fetch(`${baseUrl}/api/${name}/some-public-slug`);

        expect(res.status).toBe(404);
        expect(mock().findFirst).toHaveBeenCalledWith({
          where: { slug: 'some-public-slug', deletedAt: null, status: 'PUBLISHED' },
          select: expect.any(Object),
        });
      });
    });
  }
});