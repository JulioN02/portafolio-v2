import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ToolResponse, PaginatedResponse, ToolFilterInput } from '@jsoft/shared';

interface UseToolsOptions {
  filter?: ToolFilterInput;
  enabled?: boolean;
}

export function useTools({ filter, enabled = true }: UseToolsOptions = {}) {
  return useQuery({
    queryKey: ['tools', filter],
    queryFn: () => apiClient.get<PaginatedResponse<ToolResponse>>('/tools', {
      params: filter as Record<string, string | number | boolean>,
    }),
    enabled,
  });
}

export function useFeaturedTools(limit = 3) {
  return useQuery({
    queryKey: ['tools', 'featured', limit],
    queryFn: () => apiClient.get<ToolResponse[]>(`/tools/featured?limit=${limit}`),
  });
}

export function useToolBySlug(slug: string) {
  return useQuery({
    queryKey: ['tools', 'slug', slug],
    queryFn: () => apiClient.get<ToolResponse>(`/tools/${slug}`),
    enabled: !!slug,
  });
}

export function useClassifications() {
  return useQuery({
    queryKey: ['tools', 'classifications'],
    queryFn: () => apiClient.get<string[]>('/tools/classifications'),
  });
}
