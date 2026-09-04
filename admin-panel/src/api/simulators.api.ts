import { apiClient } from './client';
import type { SimulatorResponse } from '@jsoft/shared';
import type { SimulatorPickerApi } from '@jsoft/shared';

export const SIMULATOR_MAX_SIZE = 1 * 1024 * 1024; // 1MB — matches the server limit

export const simulatorsApi = {
  /** GET /api/simulators — admin list (editor picker). */
  list: async (): Promise<SimulatorResponse[]> => {
    const { data } = await apiClient.get('/simulators');
    return data;
  },

  /** GET /api/simulators/:id — metadata for editor prefill. */
  getById: async (id: string): Promise<SimulatorResponse> => {
    const { data } = await apiClient.get(`/simulators/${id}`);
    return data;
  },

  /** POST /api/simulators/upload — multipart (file + title), .html ≤ 1MB. */
  upload: async (file: File, title: string): Promise<SimulatorResponse> => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    const { data } = await apiClient.post('/simulators/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** DELETE /api/simulators/:id — soft-delete (deletedAt). Returns 200 + { message }. */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/simulators/${id}`);
  },
};

/**
 * Adapter for the shared RichTextEditor simulator picker. The JWT is attached
 * automatically by the apiClient interceptor.
 */
export const simulatorPickerApi: SimulatorPickerApi = {
  list: async () => {
    const simulators = await simulatorsApi.list();
    return simulators.map((s) => ({ id: s.id, title: s.title, slug: s.slug, size: s.size }));
  },
  upload: async (file, title) => {
    const simulator = await simulatorsApi.upload(file, title);
    return { id: simulator.id, title: simulator.title, slug: simulator.slug, size: simulator.size };
  },
};