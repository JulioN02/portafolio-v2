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
 * Returns only the visible sections as a Set of keys for easy lookup
 */
export function useVisibleSections(): {
  visible: Set<string>;
  isLoading: boolean;
  error: unknown;
} {
  const { data, isLoading, error } = useSiteSections();
  const visible = new Set(
    (data ?? [])
      .filter((s) => s.visible)
      .map((s) => s.key),
  );
  return { visible, isLoading, error };
}
