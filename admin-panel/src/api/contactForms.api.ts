import { apiClient } from './client';
import type { ContactFormResponse } from '@jsoft/shared';

interface ContactFormsFilterInput {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  originType?: string;
}

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
  getAll: async (filters?: ContactFormsFilterInput): Promise<PaginatedContactFormsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.originType) params.append('originType', filters.originType);

    const { data } = await apiClient.get(`/contact-forms?${params}`);
    return data;
  },

  getById: async (id: string): Promise<ContactFormResponse> => {
    const { data } = await apiClient.get(`/contact-forms/${id}`);
    return data;
  },

  markAsRead: async (id: string): Promise<ContactFormResponse> => {
    const { data } = await apiClient.patch(`/contact-forms/${id}/read`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/contact-forms/${id}`);
  },
};