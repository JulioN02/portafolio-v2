import { apiClient } from './client';
import type { ProductInput, ProductUpdateInput, ProductFilterInput, ProductResponse, PaginatedResponse } from '@jsoft/shared';

export const productsApi = {
  getAll: async (filters?: ProductFilterInput): Promise<PaginatedResponse<ProductResponse>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.classification) params.append('classification', filters.classification);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
    if (filters?.status) params.append('status', filters.status);

    const { data } = await apiClient.get(`/products?${params}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<ProductResponse> => {
    const { data } = await apiClient.get(`/products/${slug}`);
    return data;
  },

  getById: async (id: string): Promise<ProductResponse> => {
    const { data } = await apiClient.get(`/products/by-id/${id}`);
    return data;
  },

  create: async (product: ProductInput): Promise<ProductResponse> => {
    const { data } = await apiClient.post('/products', product);
    return data;
  },

  update: async (id: string, product: Partial<ProductUpdateInput>): Promise<ProductResponse> => {
    const { data } = await apiClient.put(`/products/${id}`, product);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  restore: async (id: string): Promise<ProductResponse> => {
    const { data } = await apiClient.patch(`/products/${id}/restore`);
    return data;
  },

  toggleFeatured: async (id: string, featured: boolean): Promise<ProductResponse> => {
    const { data } = await apiClient.patch(`/products/${id}/featured`, { featured });
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<ProductResponse> => {
    const { data } = await apiClient.patch(`/products/${id}/status`, { status });
    return data;
  },
};
