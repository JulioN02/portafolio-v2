import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ServiceResponse, PaginatedResponse, ServiceFilterInput } from '@jsoft/shared';

interface UseServicesOptions {
  filter?: ServiceFilterInput;
  enabled?: boolean;
}

export function useServices({ filter, enabled = true }: UseServicesOptions = {}) {
  return useQuery({
    queryKey: ['services', filter],
    queryFn: () => apiClient.get<PaginatedResponse<ServiceResponse>>('/services', {
      params: filter as Record<string, string | number | boolean>,
    }),
    enabled,
  });
}

export function useFeaturedServices(limit = 3) {
  return useQuery({
    queryKey: ['services', 'featured', limit],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<ServiceResponse>>('/services', {
          params: { limit, status: 'PUBLISHED' } as Record<string, string | number | boolean>,
        })
        .then((res) => res.data),
  });
}

export function useServiceBySlug(slug: string) {
  return useQuery({
    queryKey: ['services', 'slug', slug],
    queryFn: () => apiClient.get<ServiceResponse>(`/services/${slug}`),
    enabled: !!slug,
  });
}
