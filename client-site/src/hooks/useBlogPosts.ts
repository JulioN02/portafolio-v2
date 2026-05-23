import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { BlogPostResponse, PaginatedResponse } from '@jsoft/shared';

export function useBlogPosts(page: number = 1) {
  return useQuery({
    queryKey: ['blog-posts', 'published', page],
    queryFn: () =>
      apiClient.get<PaginatedResponse<BlogPostResponse>>('/blog-posts', {
        params: { status: 'PUBLISHED', page, limit: 9 },
      }),
    placeholderData: (prev) => prev,
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
