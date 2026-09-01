import express from 'express';
import helmet from 'helmet';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';
import simulatorRoutes from '../routes/simulator.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { storageService } from '../services/storage.service';
import { PrismaClient } from '@prisma/client';
import { SIMULATOR_MAX_SIZE } from '../services/simulator.service';

// Mock object storage: /content streams from downloadFile, never real network.
jest.mock('../services/storage.service', () => ({
  storageService: {
    isConfigured: jest.fn(),
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
  },
}));

const mockedStorage = storageService as jest.Mocked<typeof storageService>;
const mockPrisma = new PrismaClient();

const HTML = '<html><body><h1>Demo</h1><script>alert(1)</script></body></html>';

const RECORD = {
  id: 'cm-sim-1',
  title: 'Mi Simulador',
  slug: 'mi-simulador',
  fileName: '1700000000000-simulador.html',
  size: 2048,
  mimeType: 'text/html',
  width: null,
  height: null,
  uploadedAt: new Date('2026-08-31T00:00:00.000Z'),
  createdAt: new Date('2026-08-31T00:00:00.000Z'),
  updatedAt: new Date('2026-08-31T00:00:00.000Z'),
  deletedAt: null,
};

/**
 * Integration tests over the REAL express router (HTTP level, Node fetch)
 * with helmet mounted the same way app.ts does, so the /content header
 * overrides (CSP replacement + X-Frame-Options removal) are truly exercised.
 */
describe('Simulator routes (integration)', () => {
  let server: Server;
  let baseUrl: string;
  let adminToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    adminToken = jwt.sign({ username: 'admin', role: 'ADMIN' }, process.env.JWT_SECRET);

    const app = express();
    app.use(express.json());
    app.use(helmet()); // same global security middleware as app.ts
    app.use('/api/simulators', simulatorRoutes);
    app.use(errorHandler);

    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/simulators`;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CORS_ORIGIN;
  });

  describe('protected routes reject requests without JWT', () => {
    it('POST /upload → 401', async () => {
      const res = await fetch(`${baseUrl}/upload`, { method: 'POST' });
      expect(res.status).toBe(401);
    });

    it('GET / → 401', async () => {
      const res = await fetch(`${baseUrl}`);
      expect(res.status).toBe(401);
    });

    it('GET /:id → 401', async () => {
      const res = await fetch(`${baseUrl}/cm-sim-1`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id/content (public serving endpoint)', () => {
    it('streams the raw HTML with CSP sandbox + nosniff + no-store and no X-Frame-Options', async () => {
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue(RECORD);
      mockedStorage.downloadFile.mockResolvedValue({ stream: Readable.from([HTML]), mimetype: 'text/html' });

      const res = await fetch(`${baseUrl}/cm-sim-1/content`);

      expect(res.status).toBe(200);
      expect(await res.text()).toBe(HTML);
      expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
      // Helmet's default CSP is REPLACED by the sandbox CSP for this route.
      const csp = res.headers.get('content-security-policy') || '';
      expect(csp).toContain('sandbox allow-scripts');
      expect(csp).toContain("default-src 'none'");
      expect(csp).toContain("base-uri 'none'");
      expect(csp).toContain("form-action 'none'");
      expect(csp).toContain('frame-ancestors http://localhost:5173 http://localhost:4173');
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('cache-control')).toBe('no-store');
      // Helmet sets X-Frame-Options: SAMEORIGIN by default; cross-origin
      // embeds must work → the controller removes it for this response.
      expect(res.headers.get('x-frame-options')).toBeNull();
    });

    it('derives frame-ancestors from CORS_ORIGIN', async () => {
      process.env.CORS_ORIGIN = 'https://client.example.com, https://recruiter.example.com';
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue(RECORD);
      mockedStorage.downloadFile.mockResolvedValue({ stream: Readable.from([HTML]), mimetype: 'text/html' });

      const res = await fetch(`${baseUrl}/cm-sim-1/content`);

      const csp = res.headers.get('content-security-policy') || '';
      expect(csp).toContain('frame-ancestors https://client.example.com https://recruiter.example.com');
    });

    it('returns 404 for an unknown simulator', async () => {
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await fetch(`${baseUrl}/nope/content`);

      expect(res.status).toBe(404);
      expect(mockedStorage.downloadFile).not.toHaveBeenCalled();
    });
  });

  describe('POST /upload with a valid JWT', () => {
    it('rejects files over 1MB with 400 (multer LIMIT_FILE_SIZE → errorHandler)', async () => {
      const form = new FormData();
      form.append(
        'file',
        new Blob([new Uint8Array(SIMULATOR_MAX_SIZE + 1)], { type: 'text/html' }),
        'grande.html',
      );
      form.append('title', 'Grande');

      const res = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('UPLOAD_ERROR');
      expect(mockPrisma.simulator.create).not.toHaveBeenCalled();
    });
  });
});