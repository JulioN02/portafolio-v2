import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet, mockPost, mockPut, mockPatch, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn().mockResolvedValue({ data: [] }),
  mockPost: vi.fn().mockResolvedValue({ data: {} }),
  mockPut: vi.fn().mockResolvedValue({ data: {} }),
  mockPatch: vi.fn().mockResolvedValue({ data: {} }),
  mockDelete: vi.fn().mockResolvedValue({ data: {} }),
}));

vi.mock('./client', () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete,
  },
}));

import { situationsApi } from './situations.api';

describe('situationsApi admin routes', () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockPost.mockClear();
    mockPut.mockClear();
    mockPatch.mockClear();
    mockDelete.mockClear();
  });

  it('lists admin situations via /admin/situations', async () => {
    mockGet.mockResolvedValue({ data: { data: [] } });

    await situationsApi.getAll();

    expect(mockGet).toHaveBeenCalledWith('/admin/situations');
  });

  it('gets one situation via /admin/situations/:id', async () => {
    await situationsApi.getById('sit-1');

    expect(mockGet).toHaveBeenCalledWith('/admin/situations/sit-1');
  });

  it('creates via POST /admin/situations', async () => {
    const input = { title: 'Título', description: 'Descripción', serviceIds: [] };

    await situationsApi.create(input);

    expect(mockPost).toHaveBeenCalledWith('/admin/situations', input);
  });

  it('updates via PUT /admin/situations/:id', async () => {
    const input = { title: 'Nuevo', description: 'Otra' };

    await situationsApi.update('sit-1', input);

    expect(mockPut).toHaveBeenCalledWith('/admin/situations/sit-1', input);
  });

  it('patches via PATCH /admin/situations/:id', async () => {
    await situationsApi.patch('sit-1', { order: 2 });

    expect(mockPatch).toHaveBeenCalledWith('/admin/situations/sit-1', { order: 2 });
  });

  it('deletes via DELETE /admin/situations/:id', async () => {
    await situationsApi.remove('sit-1');

    expect(mockDelete).toHaveBeenCalledWith('/admin/situations/sit-1');
  });
});
