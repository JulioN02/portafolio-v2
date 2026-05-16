import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import type { ProductInput, ProductUpdateInput, ProductFilterInput } from '@jsoft/shared';

export function useProducts() {
  const queryClient = useQueryClient();

  const useGetAll = (filters?: ProductFilterInput) =>
    useQuery({
      queryKey: ['products', 'all', filters],
      queryFn: () => productsApi.getAll(filters),
    });

  const useGetById = (id: string) =>
    useQuery({
      queryKey: ['products', id],
      queryFn: () => productsApi.getById(id),
      enabled: !!id,
    });

  const useCreate = () =>
    useMutation({
      mutationFn: (data: ProductInput) => productsApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ProductUpdateInput> }) =>
        productsApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => productsApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    });

  const useToggleFeatured = () =>
    useMutation({
      mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
        productsApi.toggleFeatured(id, featured),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    });

  const useReorder = () =>
    useMutation({
      mutationFn: ({ id, order }: { id: string; order: number }) =>
        productsApi.reorder(id, order),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    });

  return {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
    useToggleFeatured,
    useReorder,
  };
}