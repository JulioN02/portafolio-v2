import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { PaginatedResponse } from '@jsoft/shared';
import type { ProjectSummary } from '../types';

/**
 * Fetch paginated projects with optional filters.
 * Used on the Projects page for listing/filtering.
 */
export function useProjects(filters?: {
  type?: string;
  classification?: string;
  page?: number;
  limit?: number;
}) {
  const params: Record<string, string | number | boolean> = {};

  if (filters?.type) params.type = filters.type;
  if (filters?.classification) params.classification = filters.classification;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;

  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProjectSummary>>('/projects', {
        params: Object.keys(params).length > 0 ? params : undefined,
      }),
  });
}

/**
 * Fetch the 3 most recent projects for the Home page carousel.
 */
export function useRecentProjects() {
  return useQuery({
    queryKey: ['projects', 'recent'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProjectSummary>>('/projects/recent'),
  });
}

/**
 * Map of project types to their detail API endpoints.
 */
const detailEndpointMap: Record<string, string> = {
  SERVICE: '/services',
  PRODUCT: '/products',
  TOOL: '/tools',
  SUCCESS_CASE: '/success-cases',
};

/**
 * Fetch a single project detail by type and slug.
 * Used when the user clicks a project card in the modal.
 * The correct endpoint is mapped from the project type.
 */
export function useProjectDetail(type: string, slug: string) {
  const basePath = detailEndpointMap[type];
  const endpoint = basePath ? `${basePath}/${slug}` : `/projects/${slug}`;

  return useQuery({
    queryKey: ['project-detail', type, slug],
    queryFn: () => apiClient.get<Record<string, unknown>>(endpoint),
    enabled: Boolean(type && slug),
    retry: 1,
  });
}

/**
 * Fetch all unique classifications across all project types.
 * Used for the classification filter on the Projects page.
 */
export function useProjectClassifications() {
  return useQuery({
    queryKey: ['projects', 'classifications'],
    queryFn: () => apiClient.get<string[]>('/projects/classifications'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes — classifications rarely change
  });
}
