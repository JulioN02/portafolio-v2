import { apiClient } from './client';
import type { BlogPostInput, BlogPostResponse, BlogPostFilterInput, PaginatedResponse } from '@jsoft/shared';

export const blogPostsApi = {
  getAll: async (filter?: BlogPostFilterInput): Promise<PaginatedResponse<BlogPostResponse>> => {
    const params = new URLSearchParams();
    if (filter?.page) params.append('page', String(filter.page));
    if (filter?.limit) params.append('limit', String(filter.limit));
    if (filter?.status) params.append('status', filter.status);
    if (filter?.category) params.append('category', filter.category);

    const { data } = await apiClient.get(`/blog-posts?${params}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<BlogPostResponse> => {
    const { data } = await apiClient.get(`/blog-posts/${slug}`);
    return data;
  },

  getById: async (id: string): Promise<BlogPostResponse> => {
    const { data } = await apiClient.get(`/blog-posts/by-id/${id}`);
    return data;
  },

  create: async (post: BlogPostInput): Promise<BlogPostResponse> => {
    const { data } = await apiClient.post('/blog-posts', post);
    return data;
  },

  update: async (id: string, post: Partial<BlogPostInput>): Promise<BlogPostResponse> => {
    const { data } = await apiClient.put(`/blog-posts/${id}`, post);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/blog-posts/${id}`);
  },

  restore: async (id: string): Promise<BlogPostResponse> => {
    const { data } = await apiClient.patch(`/blog-posts/${id}/restore`);
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<BlogPostResponse> => {
    const { data } = await apiClient.patch(`/blog-posts/${id}/status`, { status });
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await apiClient.get('/blog-posts/categories');
    return data;
  },
};