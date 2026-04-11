import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ProductResponse, PaginatedResponse, ProductFilterInput } from '@jsoft/shared';

interface UseProductsOptions {
  filter?: ProductFilterInput;
  enabled?: boolean;
}

export function useProducts({ filter, enabled = true }: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: () => apiClient.get<PaginatedResponse<ProductResponse>>('/products', {
      params: filter as Record<string, string | number | boolean>,
    }),
    enabled,
  });
}

export function useFeaturedProducts(limit = 5) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => apiClient.get<ProductResponse[]>(`/products/featured?limit=${limit}`),
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['products', 'slug', slug],
    queryFn: () => apiClient.get<ProductResponse>(`/products/${slug}`),
    enabled: !!slug,
  });
}

export function useClassifications() {
  return useQuery({
    queryKey: ['products', 'classifications'],
    queryFn: () => apiClient.get<string[]>('/products/classifications'),
  });
}
