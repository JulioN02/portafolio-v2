import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn().mockResolvedValue({ data: { data: [], pagination: {} } }),
}));

vi.mock('./client', () => ({
  apiClient: {
    get: mockGet,
  },
}));

import { servicesApi } from './services.api';
import { productsApi } from './products.api';
import { toolsApi } from './tools.api';
import { projectsApi } from './projects.api';
import { successCasesApi } from './successCases.api';
import { blogPostsApi } from './blogPosts.api';

describe('admin content list clients', () => {
  beforeEach(() => {
    mockGet.mockClear();
  });

  it.each([
    ['services', () => servicesApi.getAll({ page: 1, limit: 10, status: 'ALL' })],
    ['products', () => productsApi.getAll({ page: 1, limit: 10, status: 'ALL' })],
    ['tools', () => toolsApi.getAll({ page: 1, limit: 10, status: 'ALL' })],
    ['projects', () => projectsApi.getAll({ page: 1, limit: 10, status: 'ALL' })],
    ['success-cases', () => successCasesApi.getAll({ page: 1, limit: 10, status: 'ALL' })],
    ['blog-posts', () => blogPostsApi.getAll({ page: 1, limit: 10, status: 'ALL' })],
  ])('requests the protected admin route for %s status queries', async (resource, request) => {
    await request();

    expect(mockGet).toHaveBeenCalledWith(`/admin/${resource}?page=1&limit=10&status=ALL`);
  });
});
