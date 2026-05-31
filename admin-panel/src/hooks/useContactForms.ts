import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactFormsApi } from '@/api/contactForms.api';
import type { ContactFormFilterInput } from '@jsoft/shared';

export function useContactForms() {
  const queryClient = useQueryClient();

  const useGetAll = (filters?: ContactFormFilterInput) =>
    useQuery({
      queryKey: ['contactForms', 'all', filters],
      queryFn: () => contactFormsApi.getAll(filters),
    });

  const useGetById = (id: string) =>
    useQuery({
      queryKey: ['contactForms', id],
      queryFn: () => contactFormsApi.getById(id),
      enabled: !!id,
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => contactFormsApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contactForms'] });
      },
    });

  const useMarkRead = () =>
    useMutation({
      mutationFn: (id: string) => contactFormsApi.markRead(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contactForms'] });
      },
    });

  const useToggleArchive = () =>
    useMutation({
      mutationFn: (id: string) => contactFormsApi.toggleArchive(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contactForms'] });
      },
    });

  const useSetLabels = () =>
    useMutation({
      mutationFn: ({ id, labels }: { id: string; labels: string[] }) =>
        contactFormsApi.setLabels(id, labels),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contactForms'] });
      },
    });

  return {
    useGetAll,
    useGetById,
    useDelete,
    useMarkRead,
    useToggleArchive,
    useSetLabels,
  };
}