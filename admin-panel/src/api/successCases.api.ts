import { apiClient } from './client';
import type { SuccessCaseInput, SuccessCaseUpdateInput, SuccessCaseFilterInput, SuccessCaseResponse, PaginatedResponse } from '@jsoft/shared';

export const successCasesApi = {
  getAll: async (filters?: SuccessCaseFilterInput): Promise<PaginatedResponse<SuccessCaseResponse>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const { data } = await apiClient.get(`/success-cases?${params}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<SuccessCaseResponse> => {
    const { data } = await apiClient.get(`/success-cases/${slug}`);
    return data;
  },

  getById: async (id: string): Promise<SuccessCaseResponse> => {
    const { data } = await apiClient.get(`/success-cases/by-id/${id}`);
    return data;
  },

  create: async (successCase: SuccessCaseInput): Promise<SuccessCaseResponse> => {
    const { data } = await apiClient.post('/success-cases', successCase);
    return data;
  },

  update: async (id: string, successCase: Partial<SuccessCaseUpdateInput>): Promise<SuccessCaseResponse> => {
    const { data } = await apiClient.put(`/success-cases/${id}`, successCase);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/success-cases/${id}`);
  },

  restore: async (id: string): Promise<SuccessCaseResponse> => {
    const { data } = await apiClient.patch(`/success-cases/${id}/restore`);
    return data;
  },

  reorder: async (id: string, order: number): Promise<SuccessCaseResponse> => {
    const { data } = await apiClient.patch(`/success-cases/${id}/reorder`, { order });
    return data;
  },

  toggleFeatured: async (id: string, featured: boolean): Promise<SuccessCaseResponse> => {
    const { data } = await apiClient.patch(`/success-cases/${id}/featured`, { featured });
    return data;
  },
};