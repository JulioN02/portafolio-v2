import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { SiteSectionResponse } from '@jsoft/shared';

export function useSiteSections() {
  return useQuery({
    queryKey: ['site-sections'],
    queryFn: () => apiClient.get<SiteSectionResponse[]>('/site-sections'),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Returns the visible sections sorted by `order`, plus loading/error state.
 * The sections array is already sorted by the API (or we sort client-side as fallback).
 */
export function useVisibleSections(): {
  sections: SiteSectionResponse[];
  isLoading: boolean;
  error: unknown;
} {
  const { data, isLoading, error } = useSiteSections();
  const sorted = (data ?? [])
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);
  return { sections: sorted, isLoading, error };
}
