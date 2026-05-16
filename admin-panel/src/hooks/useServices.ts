import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../api/services.api';
import type { ServiceInput, ServiceUpdateInput, ServiceFilterInput } from '@jsoft/shared';

export function useServices() {
  const queryClient = useQueryClient();

  const useGetAll = (filters?: ServiceFilterInput) =>
    useQuery({
      queryKey: ['services', 'all', filters],
      queryFn: () => servicesApi.getAll(filters),
    });

  const useGetById = (id: string) =>
    useQuery({
      queryKey: ['services', id],
      queryFn: () => servicesApi.getById(id),
      enabled: !!id,
    });

  const useCreate = () =>
    useMutation({
      mutationFn: (data: ServiceInput) => servicesApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ServiceUpdateInput> }) =>
        servicesApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => servicesApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
      },
    });

  const useToggleFeatured = () =>
    useMutation({
      mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
        servicesApi.toggleFeatured(id, featured),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
      },
    });

  const useReorder = () =>
    useMutation({
      mutationFn: ({ id, order }: { id: string; order: number }) =>
        servicesApi.reorder(id, order),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
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