import { apiClient } from './client';
import type { ServiceInput, ServiceUpdateInput, ServiceFilterInput, ServiceResponse, PaginatedResponse } from '@jsoft/shared';

export const servicesApi = {
  getAll: async (filters?: ServiceFilterInput): Promise<PaginatedResponse<ServiceResponse>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.classification) params.append('classification', filters.classification);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));

    const { data } = await apiClient.get(`/services?${params}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<ServiceResponse> => {
    const { data } = await apiClient.get(`/services/${slug}`);
    return data;
  },

  getById: async (id: string): Promise<ServiceResponse> => {
    const { data } = await apiClient.get(`/services/by-id/${id}`);
    return data;
  },

  create: async (service: ServiceInput): Promise<ServiceResponse> => {
    const { data } = await apiClient.post('/services', service);
    return data;
  },

  update: async (id: string, service: Partial<ServiceUpdateInput>): Promise<ServiceResponse> => {
    const { data } = await apiClient.put(`/services/${id}`, service);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

  restore: async (id: string): Promise<ServiceResponse> => {
    const { data } = await apiClient.patch(`/services/${id}/restore`);
    return data;
  },

  reorder: async (id: string, order: number): Promise<ServiceResponse> => {
    const { data } = await apiClient.patch(`/services/${id}/reorder`, { order });
    return data;
  },

  toggleFeatured: async (id: string, featured: boolean): Promise<ServiceResponse> => {
    const { data } = await apiClient.patch(`/services/${id}/featured`, { featured });
    return data;
  },
};