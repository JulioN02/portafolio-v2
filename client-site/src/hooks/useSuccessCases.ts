import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { SuccessCaseResponse, PaginatedResponse, SuccessCaseFilterInput } from '@jsoft/shared';

interface UseSuccessCasesOptions {
  filter?: SuccessCaseFilterInput;
  enabled?: boolean;
}

export function useSuccessCases({ filter, enabled = true }: UseSuccessCasesOptions = {}) {
  return useQuery({
    queryKey: ['successCases', filter],
    queryFn: () => apiClient.get<PaginatedResponse<SuccessCaseResponse>>('/success-cases', {
      params: filter as Record<string, string | number | boolean>,
    }),
    enabled,
  });
}

export function useRecentSuccessCases(limit = 3) {
  return useQuery({
    queryKey: ['successCases', 'recent', limit],
    queryFn: () => apiClient.get<SuccessCaseResponse[]>(`/success-cases/recent?limit=${limit}`),
  });
}

export function useSuccessCaseBySlug(slug: string) {
  return useQuery({
    queryKey: ['successCases', 'slug', slug],
    queryFn: () => apiClient.get<SuccessCaseResponse>(`/success-cases/${slug}`),
    enabled: !!slug,
  });
}
