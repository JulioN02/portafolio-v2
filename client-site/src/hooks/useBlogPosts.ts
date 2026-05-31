import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { BlogPostResponse, PaginatedResponse } from '@jsoft/shared';

export function useBlogPosts(page: number = 1, filters?: { category?: string; search?: string }) {
  const params: Record<string, string | number | boolean> = {
    status: 'PUBLISHED',
    page,
    limit: 9,
  };
  if (filters?.category) params.category = filters.category;
  if (filters?.search) params.search = filters.search;

  return useQuery({
    queryKey: ['blog-posts', 'published', page, filters],
    queryFn: () =>
      apiClient.get<PaginatedResponse<BlogPostResponse>>('/blog-posts', { params }),
    placeholderData: (prev) => prev,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => apiClient.get<string[]>('/blog-posts/categories'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog-posts', 'slug', slug],
    queryFn: () => apiClient.get<BlogPostResponse>(`/blog-posts/${slug}`),
    enabled: Boolean(slug),
    retry: 1,
  });
}
