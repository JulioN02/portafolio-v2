import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { BlogPostResponse, PaginatedResponse } from '@jsoft/shared';

export function useBlogPosts(
  page: number = 1,
  filters?: { category?: string; tag?: string; search?: string },
  limit: number = 9,
) {
  const params: Record<string, string | number | boolean> = {
    status: 'PUBLISHED',
    page,
    limit,
  };
  if (filters?.category) params.category = filters.category;
  if (filters?.tag) params.tag = filters.tag;
  if (filters?.search) params.search = filters.search;

  return useQuery({
    queryKey: ['blog-posts', 'published', page, filters, limit],
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

/** Distinct tags among PUBLISHED posts — powers the tag filter chips. */
export function useBlogTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => apiClient.get<string[]>('/blog-posts/tags'),
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