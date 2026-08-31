import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ProjectResponse, PaginatedResponse, ProjectFilterInput } from '@jsoft/shared';

interface UseProjectsOptions {
  filter?: ProjectFilterInput;
  enabled?: boolean;
}

export function useProjects({ filter, enabled = true }: UseProjectsOptions = {}) {
  return useQuery({
    queryKey: ['projects', 'published', filter],
    queryFn: () => apiClient.get<PaginatedResponse<ProjectResponse>>('/projects', {
      params: { status: 'PUBLISHED', ...(filter as Record<string, string | number | boolean>) },
    }),
    enabled,
  });
}

/** Distinct tags among PUBLISHED projects — powers the tag filter chips. */
export function useProjectTags() {
  return useQuery({
    queryKey: ['projects', 'tags'],
    queryFn: () => apiClient.get<string[]>('/projects/tags'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: ['projects', 'slug', slug],
    queryFn: () => apiClient.get<ProjectResponse>(`/projects/${slug}`),
    enabled: Boolean(slug),
    retry: 1,
  });
}