import { apiClient } from './client';
import type { ToolInput, ToolUpdateInput, ToolFilterInput, ToolResponse, PaginatedResponse } from '@jsoft/shared';

export const toolsApi = {
  getAll: async (filters?: ToolFilterInput): Promise<PaginatedResponse<ToolResponse>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.classification) params.append('classification', filters.classification);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));

    const { data } = await apiClient.get(`/tools?${params}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<ToolResponse> => {
    const { data } = await apiClient.get(`/tools/${slug}`);
    return data;
  },

  getById: async (id: string): Promise<ToolResponse> => {
    const { data } = await apiClient.get(`/tools/by-id/${id}`);
    return data;
  },

  create: async (tool: ToolInput): Promise<ToolResponse> => {
    const { data } = await apiClient.post('/tools', tool);
    return data;
  },

  update: async (id: string, tool: Partial<ToolUpdateInput>): Promise<ToolResponse> => {
    const { data } = await apiClient.put(`/tools/${id}`, tool);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tools/${id}`);
  },

  restore: async (id: string): Promise<ToolResponse> => {
    const { data } = await apiClient.patch(`/tools/${id}/restore`);
    return data;
  },

  reorder: async (id: string, order: number): Promise<ToolResponse> => {
    const { data } = await apiClient.patch(`/tools/${id}/order`, { order });
    return data;
  },

  toggleFeatured: async (id: string, featured: boolean): Promise<ToolResponse> => {
    const { data } = await apiClient.patch(`/tools/${id}/featured`, { featured });
    return data;
  },
};