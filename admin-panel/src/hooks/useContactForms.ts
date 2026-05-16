import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactFormsApi } from '../api/contactForms.api';

interface ContactFormsFilterInput {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  originType?: string;
}

export function useContactForms() {
  const queryClient = useQueryClient();

  const useGetAll = (filters?: ContactFormsFilterInput) =>
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

  const useMarkAsRead = () =>
    useMutation({
      mutationFn: (id: string) => contactFormsApi.markAsRead(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contactForms'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => contactFormsApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contactForms'] });
      },
    });

  return {
    useGetAll,
    useGetById,
    useMarkAsRead,
    useDelete,
  };
}