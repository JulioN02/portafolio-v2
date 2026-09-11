import express, { type Express } from 'express';
import { Server } from 'http';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import type { PrismaClient } from '@prisma/client';

// Real fetch captured BEFORE the Turnstile suites mock global.fetch — client
// requests must always use the real fetch, never the siteverify mock.
const realFetch = global.fetch;

type Env = Record<string, string | undefined>;

const KNOWN_ENV_KEYS = [
  'TURNSTILE_SECRET_KEY',
  'CONTACT_RATE_LIMIT_MAX',
  'CONTACT_RATE_LIMIT_WINDOW_MINUTES',
];

/**
 * Builds a fresh app over the REAL contact router with a clean module registry
 * (jest.resetModules) so per-suite env vars (TURNSTILE_SECRET_KEY,
 * CONTACT_RATE_LIMIT_MAX/WINDOW) and the in-memory limiter store start fresh.
 *
 * IMPORTANT: after jest.resetModules() the @prisma/client mock factory is
 * re-executed, producing a NEW mock object. We therefore capture the prisma
 * instance from the SAME dynamic import pass as the router — assertions must
 * use that instance, not a statically-imported one.
 */
async function buildApp(
  env: Env,
): Promise<{ app: Express; prisma: PrismaClient }> {
  jest.resetModules();
  // Always reset the known env keys first so state cannot leak between suites.
  for (const key of KNOWN_ENV_KEYS) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
  const { default: contactRoutes } = await import('../routes/contact.routes');
  const { PrismaClient } = await import('@prisma/client');
  // Dynamic import: after resetModules the errorHandler must share the SAME
  // zod instance as the dynamically-imported router chain, otherwise
  // `err instanceof ZodError` fails (dual-instance hazard) → 500 instead of 400.
  const { errorHandler } = await import('../middleware/errorHandler.middleware');
  const prisma = new PrismaClient();

  const app = express();
  app.set('trust proxy', 1); // match app.ts so req.ip resolves via X-Forwarded-For
  app.use(express.json());
  app.use('/api/contact', contactRoutes);
  app.use(errorHandler);
  return { app, prisma };
}

async function startServer(app: Express): Promise<{ server: Server; baseUrl: string }> {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/contact`;
  return { server, baseUrl };
}

const clientPayload = {
  firstName: 'Ana',
  lastName: 'García',
  email: 'ana@example.com',
  whatsapp: '+573001112233',
  message: 'Hola, me interesa un desarrollo web.',
  source: 'service:Desarrollo Web',
};

const recruiterPayload = {
  firstName: 'Luis',
  email: 'luis@example.com',
  whatsapp: '+573001112233',
  message: 'Hola, tengo una oportunidad laboral.',
};

function postJson(baseUrl: string, path: string, body: unknown) {
  return realFetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contact — honeypot (contact-anti-spam)', () => {
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Turnstile disabled (no secret), limiter relaxed so legit requests pass.
    const built = await buildApp({
      TURNSTILE_SECRET_KEY: undefined,
      CONTACT_RATE_LIMIT_MAX: '1000',
      CONTACT_RATE_LIMIT_WINDOW_MINUTES: '10',
    });
    ({ server, baseUrl } = await startServer(built.app));
    prisma = built.prisma;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /client with a non-empty website returns 200 generic success and persists NOTHING', async () => {
    const res = await postJson(baseUrl, '/client', {
      ...clientPayload,
      website: 'http://spam.example.com',
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    // Same message shape as a real success — zero signal to the bot.
    expect(body.message).toBe('Contact form submitted successfully');
    expect(prisma.contactForm.create).not.toHaveBeenCalled();
  });

  it('POST /recruiter with a non-empty (trimmed) website also gets the fake 200', async () => {
    const res = await postJson(baseUrl, '/recruiter', {
      ...recruiterPayload,
      website: '   https://spam.example.com  ',
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Contact form submitted successfully');
    expect(prisma.contactForm.create).not.toHaveBeenCalled();
  });

  it('POST /client with an empty website passes the honeypot and persists (201)', async () => {
    (prisma.contactForm.create as jest.Mock).mockResolvedValue({
      id: 'c1',
      firstName: 'Ana',
      email: 'ana@example.com',
      originType: 'CLIENT',
    });

    const res = await postJson(baseUrl, '/client', { ...clientPayload, website: '' });

    expect(res.status).toBe(201);
    expect(prisma.contactForm.create).toHaveBeenCalledTimes(1);
  });

  it('POST /recruiter without a website field passes the honeypot and persists (201)', async () => {
    (prisma.contactForm.create as jest.Mock).mockResolvedValue({
      id: 'c2',
      firstName: 'Luis',
      email: 'luis@example.com',
      originType: 'RECRUITER',
    });

    const res = await postJson(baseUrl, '/recruiter', recruiterPayload);

    expect(res.status).toBe(201);
    expect(prisma.contactForm.create).toHaveBeenCalledTimes(1);
  });

  it('persists the row WITHOUT the transient website field (stripped before persist)', async () => {
    (prisma.contactForm.create as jest.Mock).mockResolvedValue({
      id: 'c3',
      firstName: 'Ana',
      email: 'ana@example.com',
    });

    await postJson(baseUrl, '/client', { ...clientPayload, website: '' });

    const [call] = (prisma.contactForm.create as jest.Mock).mock.calls;
    const data = call[0].data;
    expect(data).not.toHaveProperty('website');
    expect(data).not.toHaveProperty('turnstileToken');
  });
});

describe('POST /api/contact — dedicated rate limiter (contact-anti-spam)', () => {
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Defaults apply: CONTACT_RATE_LIMIT_MAX unset → 5, WINDOW unset → 10 min.
    const built = await buildApp({ TURNSTILE_SECRET_KEY: undefined });
    ({ server, baseUrl } = await startServer(built.app));
    prisma = built.prisma;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.contactForm.create as jest.Mock).mockResolvedValue({
      id: 'r1',
      firstName: 'Ana',
      email: 'ana@example.com',
      originType: 'CLIENT',
    });
  });

  it('allows the first 5 submissions from the same IP and rejects the 6th with 429 RATE_LIMITED', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      const res = await postJson(baseUrl, '/client', { ...clientPayload, website: '' });
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuses[5]).toBe(429);

    // The rejected 6th request must NOT create a row: only 5 persists happened.
    expect(prisma.contactForm.create).toHaveBeenCalledTimes(5);

    const lastRes = await postJson(baseUrl, '/client', { ...clientPayload, website: '' });
    const body = await lastRes.json();
    expect(body.code).toBe('RATE_LIMITED');
  });
});

describe('POST /api/contact — env-configurable limiter', () => {
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const built = await buildApp({
      TURNSTILE_SECRET_KEY: undefined,
      CONTACT_RATE_LIMIT_MAX: '2',
      CONTACT_RATE_LIMIT_WINDOW_MINUTES: '10',
    });
    ({ server, baseUrl } = await startServer(built.app));
    prisma = built.prisma;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.contactForm.create as jest.Mock).mockResolvedValue({
      id: 'r2',
      firstName: 'Ana',
      email: 'ana@example.com',
    });
  });

  it('applies CONTACT_RATE_LIMIT_MAX=2: 3rd request is 429', async () => {
    const first = await postJson(baseUrl, '/client', { ...clientPayload, website: '' });
    expect(first.status).toBe(201);
    const second = await postJson(baseUrl, '/client', { ...clientPayload, website: '' });
    expect(second.status).toBe(201);

    const third = await postJson(baseUrl, '/client', { ...clientPayload, website: '' });
    expect(third.status).toBe(429);
    const body = await third.json();
    expect(body.code).toBe('RATE_LIMITED');
  });
});

describe('POST /api/contact — Turnstile verification (contact-anti-spam)', () => {
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaClient;
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  beforeAll(async () => {
    global.fetch = fetchMock as unknown as typeof fetch;
    const built = await buildApp({
      TURNSTILE_SECRET_KEY: 'test-secret',
      CONTACT_RATE_LIMIT_MAX: '1000',
      CONTACT_RATE_LIMIT_WINDOW_MINUTES: '10',
    });
    ({ server, baseUrl } = await startServer(built.app));
    prisma = built.prisma;
  });

  afterAll(() => {
    server.close();
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.contactForm.create as jest.Mock).mockResolvedValue({
      id: 't1',
      firstName: 'Ana',
      email: 'ana@example.com',
      originType: 'CLIENT',
    });
  });

  it('persists (201) when siteverify returns success=true, sending secret/response/remoteip', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const res = await postJson(baseUrl, '/client', {
      ...clientPayload,
      website: '',
      turnstileToken: 'valid-token',
    });

    expect(res.status).toBe(201);
    expect(prisma.contactForm.create).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      SITEVERIFY_URL,
      expect.objectContaining({ method: 'POST' }),
    );
    const [, init] = fetchMock.mock.calls[0];
    const form = init.body as URLSearchParams;
    expect(form.get('secret')).toBe('test-secret');
    expect(form.get('response')).toBe('valid-token');
    // Node dual-stack sockets present the IPv4-mapped form (::ffff:127.0.0.1).
    expect(form.get('remoteip')).toMatch(/127\.0\.0\.1$/);
  });

  it('rejects with 400 TURNSTILE_FAILED when siteverify returns success=false and persists nothing', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const res = await postJson(baseUrl, '/client', {
      ...clientPayload,
      website: '',
      turnstileToken: 'bad-token',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('TURNSTILE_FAILED');
    expect(prisma.contactForm.create).not.toHaveBeenCalled();
  });

  it('rejects with 400 TURNSTILE_FAILED when siteverify itself throws', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const res = await postJson(baseUrl, '/recruiter', {
      ...recruiterPayload,
      website: '',
      turnstileToken: 'token',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('TURNSTILE_FAILED');
    expect(prisma.contactForm.create).not.toHaveBeenCalled();
  });

  it('rejects with 400 TURNSTILE_FAILED when the token is missing, without calling siteverify', async () => {
    const res = await postJson(baseUrl, '/client', { ...clientPayload, website: '' });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('TURNSTILE_FAILED');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(prisma.contactForm.create).not.toHaveBeenCalled();
  });

  it('rejects with 400 TURNSTILE_FAILED when the token is an empty string', async () => {
    const res = await postJson(baseUrl, '/client', {
      ...clientPayload,
      website: '',
      turnstileToken: '   ',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('TURNSTILE_FAILED');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/contact — Turnstile disabled (graceful fallback)', () => {
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const built = await buildApp({
      TURNSTILE_SECRET_KEY: undefined,
      CONTACT_RATE_LIMIT_MAX: '1000',
      CONTACT_RATE_LIMIT_WINDOW_MINUTES: '10',
    });
    ({ server, baseUrl } = await startServer(built.app));
    prisma = built.prisma;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.contactForm.create as jest.Mock).mockResolvedValue({
      id: 'f1',
      firstName: 'Luis',
      email: 'luis@example.com',
      originType: 'RECRUITER',
    });
  });

  it('skips Turnstile when TURNSTILE_SECRET_KEY is unset and persists without a token (201)', async () => {
    const res = await postJson(baseUrl, '/recruiter', recruiterPayload);

    expect(res.status).toBe(201);
    expect(prisma.contactForm.create).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/contact — findAll page/limit cap (dependency-and-config-hygiene)', () => {
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaClient;

  function authHeader(): Record<string, string> {
    const token = jwt.sign(
      { userId: 'admin-1', username: 'admin', role: 'ADMIN' },
      'test-secret',
      { expiresIn: '12h' },
    );
    return { Authorization: `Bearer ${token}` };
  }

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const built = await buildApp({ TURNSTILE_SECRET_KEY: undefined });
    ({ server, baseUrl } = await startServer(built.app));
    prisma = built.prisma;
  });

  afterAll(() => {
    server.close();
    delete process.env.JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.contactForm.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.contactForm.count as jest.Mock).mockResolvedValue(0);
  });

  it('rejects an oversized ?limit=500 (schema cap is 100) before any query', async () => {
    const res = await realFetch(`${baseUrl}/?limit=500`, { headers: authHeader() });

    expect(res.status).toBe(400);
    expect(prisma.contactForm.findMany).not.toHaveBeenCalled();
  });

  it('accepts the boundary ?limit=100 and forwards take=100 to the query', async () => {
    const res = await realFetch(`${baseUrl}/?limit=100`, { headers: authHeader() });

    expect(res.status).toBe(200);
    expect(prisma.contactForm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 100 }),
    );
  });

  it('applies schema defaults (page 1 / limit 20) when the query is empty', async () => {
    const res = await realFetch(`${baseUrl}/`, { headers: authHeader() });

    expect(res.status).toBe(200);
    expect(prisma.contactForm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it('preserves the tri-state isRead=false (unread) filter semantics', async () => {
    const res = await realFetch(`${baseUrl}/?isRead=false`, { headers: authHeader() });

    expect(res.status).toBe(200);
    // isRead=false must reach the service as false → where.readAt === null.
    expect(prisma.contactForm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ readAt: null }) }),
    );
  });

  it('maps isRead=true (read) to where.readAt = { not: null }', async () => {
    const res = await realFetch(`${baseUrl}/?isRead=true`, { headers: authHeader() });

    expect(res.status).toBe(200);
    expect(prisma.contactForm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ readAt: { not: null } }) }),
    );
  });
});