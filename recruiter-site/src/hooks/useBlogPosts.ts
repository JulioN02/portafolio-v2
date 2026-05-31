import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { BlogPostResponse, PaginatedResponse } from '@jsoft/shared';

/**
 * Fetch paginated published blog posts.
 * Always filters by ?status=PUBLISHED and returns 9 items per page.
 * Accepts optional category and search filters.
 */
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

/**
 * Fetch available blog post categories.
 */
export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => apiClient.get<string[]>('/blog-posts/categories'),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single blog post by its slug.
 * Returns 404-style null when the post is not found.
 */
export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog-posts', 'slug', slug],
    queryFn: () => apiClient.get<BlogPostResponse>(`/blog-posts/${slug}`),
    enabled: Boolean(slug),
    retry: 1,
  });
}
