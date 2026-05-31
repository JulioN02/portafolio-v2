import { apiClient } from './client';
import type { ContactFormResponse, ContactFormFilterInput } from '@jsoft/shared';

interface PaginatedContactFormsResponse {
  data: ContactFormResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const contactFormsApi = {
  getAll: async (filters?: ContactFormFilterInput): Promise<PaginatedContactFormsResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isRead !== undefined) params.append('isRead', String(filters.isRead));
    if (filters?.isArchived !== undefined) params.append('isArchived', String(filters.isArchived));
    if (filters?.label) params.append('label', filters.label);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.originType) params.append('originType', filters.originType);

    const { data } = await apiClient.get(`/contact?${params}`);
    return data;
  },

  getById: async (id: string): Promise<ContactFormResponse> => {
    const { data } = await apiClient.get(`/contact/${id}`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/contact/${id}`);
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/contact/${id}/read`);
  },

  toggleArchive: async (id: string): Promise<void> => {
    await apiClient.patch(`/contact/${id}/archive`);
  },

  setLabels: async (id: string, labels: string[]): Promise<void> => {
    await apiClient.post(`/contact/${id}/labels`, { labels });
  },
};
