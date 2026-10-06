import express from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import projectRoutes from '../routes/project.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

/**
 * PATCH /:id/featured was missing for projects (admin called a 404 route).
 * These tests lock the route: it must require auth and persist the flag.
 */
describe('PATCH /api/projects/:id/featured', () => {
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
    app.use('/api/projects', projectRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without a token (route exists and is protected)', async () => {
    const response = await fetch(`${baseUrl}/api/projects/proj-1/featured`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: true }),
    });

    expect(response.status).toBe(401);
  });

  it('toggles the featured flag with a valid token', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 'proj-1',
      title: 'Project 1',
      deletedAt: null,
    });
    (mockPrisma.project.update as jest.Mock).mockResolvedValue({
      id: 'proj-1',
      title: 'Project 1',
      featured: true,
    });

    const response = await fetch(`${baseUrl}/api/projects/proj-1/featured`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({ featured: true }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.featured).toBe(true);
    expect(mockPrisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'proj-1' },
        data: expect.objectContaining({ featured: true }),
      }),
    );
  });

  it('rejects a non-boolean featured value with 400', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 'proj-1',
      title: 'Project 1',
      deletedAt: null,
    });

    const response = await fetch(`${baseUrl}/api/projects/proj-1/featured`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({ featured: 'yes' }),
    });

    expect(response.status).toBe(400);
  });
});
