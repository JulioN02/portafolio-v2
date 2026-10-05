import { describe, it, expect, vi, afterEach } from 'vitest';
import { createApiClient } from '../client';
import {
  situationsApi,
  featuredApi,
} from '../situations';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function okResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('situationsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists public situations via GET /api/situations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    const result = await situationsApi.listPublic(client);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/situations');
    expect(init.method).toBe('GET');
    expect(init.headers).toEqual(JSON_HEADERS);
    expect(result).toEqual({ data: [] });
  });

  it('creates a situation via POST /api/situations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 'sit-1' }, 201));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    const input = { title: 'Título', description: 'Descripción', serviceIds: ['svc-1'] };
    await situationsApi.create(client, input);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/situations');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual(input);
  });

  it('updates a situation via PUT /api/situations/:id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 'sit-1' }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await situationsApi.update(client, 'sit-1', { title: 'Nuevo', description: 'Otra' });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/situations/sit-1');
    expect(init.method).toBe('PUT');
  });

  it('patches a situation via PATCH /api/situations/:id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 'sit-1' }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await situationsApi.patch(client, 'sit-1', { order: 2 });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/situations/sit-1');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toEqual({ order: 2 });
  });

  it('deletes a situation via DELETE /api/situations/:id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ message: 'deleted' }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await situationsApi.remove(client, 'sit-1');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/situations/sit-1');
    expect(init.method).toBe('DELETE');
  });

  it('lists all situations for the admin via GET /api/admin/situations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await situationsApi.listAdmin(client);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('http://api.test/api/admin/situations');
  });
});

describe('featuredApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists featured services with a bounded limit query param', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await featuredApi.listFeaturedServices(client, 3);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('http://api.test/api/services/featured?limit=3');
  });

  it('lists featured success cases', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await featuredApi.listFeaturedSuccessCases(client);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('http://api.test/api/success-cases/featured?limit=3');
  });

  it('lists featured blog posts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await featuredApi.listFeaturedBlogPosts(client, 6);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('http://api.test/api/blog-posts/featured?limit=6');
  });

  it('patches a service featured flag via PATCH /api/services/:id/featured', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 'svc-1', featured: true }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await featuredApi.patchServiceFeatured(client, 'svc-1', true);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/services/svc-1/featured');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toEqual({ featured: true });
  });

  it('patches a success case featured flag', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 'sc-1' }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await featuredApi.patchSuccessCaseFeatured(client, 'sc-1', false);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/success-cases/sc-1/featured');
    expect(JSON.parse(String(init.body))).toEqual({ featured: false });
  });

  it('patches a blog post featured flag', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 'bp-1' }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://api.test' });
    await featuredApi.patchBlogPostFeatured(client, 'bp-1', true);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/blog-posts/bp-1/featured');
    expect(JSON.parse(String(init.body))).toEqual({ featured: true });
  });
});
