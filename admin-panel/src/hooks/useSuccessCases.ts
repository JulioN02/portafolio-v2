import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { successCasesApi } from '../api/successCases.api';
import type { SuccessCaseInput, SuccessCaseUpdateInput, SuccessCaseFilterInput } from '@jsoft/shared';

export function useSuccessCases() {
  const queryClient = useQueryClient();

  const useGetAll = (filters?: SuccessCaseFilterInput) =>
    useQuery({
      queryKey: ['successCases', 'all', filters],
      queryFn: () => successCasesApi.getAll(filters),
    });

  const useGetById = (id: string) =>
    useQuery({
      queryKey: ['successCases', id],
      queryFn: () => successCasesApi.getById(id),
      enabled: !!id,
    });

  const useCreate = () =>
    useMutation({
      mutationFn: (data: SuccessCaseInput) => successCasesApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['successCases'] });
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<SuccessCaseUpdateInput> }) =>
        successCasesApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['successCases'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => successCasesApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['successCases'] });
      },
    });

  const useReorder = () =>
    useMutation({
      mutationFn: ({ id, order }: { id: string; order: number }) =>
        successCasesApi.reorder(id, order),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['successCases'] });
      },
    });

  const useToggleFeatured = () =>
    useMutation({
      mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
        successCasesApi.toggleFeatured(id, featured),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['successCases'] });
      },
    });

  return {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
    useReorder,
    useToggleFeatured,
  };
}