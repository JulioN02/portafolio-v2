import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { situationsApi } from '../api/situations.api';
import type { SituationInput, SituationUpdateInput, SituationPatchInput } from '@jsoft/shared';

export function useSituations() {
  const queryClient = useQueryClient();

  const useGetAll = () =>
    useQuery({
      queryKey: ['situations'],
      queryFn: () => situationsApi.getAll(),
    });

  const useGetById = (id: string) =>
    useQuery({
      queryKey: ['situations', id],
      queryFn: () => situationsApi.getById(id),
      enabled: !!id,
    });

  const useCreate = () =>
    useMutation({
      mutationFn: (data: SituationInput) => situationsApi.create(data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['situations'] }),
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: SituationUpdateInput }) =>
        situationsApi.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['situations'] }),
    });

  const usePatch = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: SituationPatchInput }) =>
        situationsApi.patch(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['situations'] }),
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => situationsApi.remove(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['situations'] }),
    });

  return { useGetAll, useGetById, useCreate, useUpdate, usePatch, useDelete };
}
