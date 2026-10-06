import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { resolveDefaultSectionOrder, type DefaultSection } from '@jsoft/shared';
import type { SiteSectionResponse } from '@jsoft/shared';

export function useSiteSections() {
  return useQuery({
    queryKey: ['site-sections'],
    queryFn: () => apiClient.get<SiteSectionResponse[]>('/site-sections'),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export type HomeSection = DefaultSection | SiteSectionResponse;

/**
 * Returns the visible sections sorted by `order`.
 *
 * Hardened so the homepage NEVER silently hides its dynamic sections:
 * - while loading, when the request errors, or when the API returns an empty
 *   list, the default section order (all visible) is returned.
 */
export function useVisibleSections(): {
  sections: HomeSection[];
  isLoading: boolean;
  isError: boolean;
  isUsingFallback: boolean;
} {
  const { data, isLoading, isError } = useSiteSections();
  const fallback =
    isLoading || isError || !data || data.length === 0 ||
    data.every((section) => !section.visible);

  const sections: HomeSection[] = fallback
    ? resolveDefaultSectionOrder()
    : data
        .filter((section) => section.visible)
        .sort((a, b) => a.order - b.order);

  return { sections, isLoading, isError, isUsingFallback: fallback };
}