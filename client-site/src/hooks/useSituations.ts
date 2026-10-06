import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ServiceResponse } from '@jsoft/shared';

export interface PublicSituation {
  id: string;
  title: string;
  description: string;
  order: number;
  services: ServiceResponse[];
}

/**
 * Public homepage situations. Only situations with at least one published
 * service are returned by the API, each with up to 3 ordered services.
 */
export function useSituations() {
  return useQuery({
    queryKey: ['situations', 'public'],
    queryFn: () =>
      apiClient
        .get<{ data: PublicSituation[] }>('/situations')
        .then((response) => response.data),
    staleTime: 5 * 60 * 1000,
  });
}
