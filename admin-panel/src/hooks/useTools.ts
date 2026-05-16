import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toolsApi } from '../api/tools.api';
import type { ToolInput, ToolUpdateInput, ToolFilterInput } from '@jsoft/shared';

export function useTools() {
  const queryClient = useQueryClient();

  const useGetAll = (filters?: ToolFilterInput) =>
    useQuery({
      queryKey: ['tools', 'all', filters],
      queryFn: () => toolsApi.getAll(filters),
    });

  const useGetById = (id: string) =>
    useQuery({
      queryKey: ['tools', id],
      queryFn: () => toolsApi.getById(id),
      enabled: !!id,
    });

  const useCreate = () =>
    useMutation({
      mutationFn: (data: ToolInput) => toolsApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ToolUpdateInput> }) =>
        toolsApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => toolsApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
      },
    });

  const useToggleFeatured = () =>
    useMutation({
      mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
        toolsApi.toggleFeatured(id, featured),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
      },
    });

  const useReorder = () =>
    useMutation({
      mutationFn: ({ id, order }: { id: string; order: number }) =>
        toolsApi.reorder(id, order),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
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