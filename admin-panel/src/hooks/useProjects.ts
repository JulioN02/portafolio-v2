import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.api';
import type {
  ProjectInput,
  ProjectUpdateInput,
  ProjectFilterInput,
  ProjectStatusInput,
} from '@jsoft/shared';

export function useProjects() {
  const queryClient = useQueryClient();

  const useGetAll = (filters?: ProjectFilterInput) =>
    useQuery({
      queryKey: ['projects', 'all', filters],
      queryFn: () => projectsApi.getAll(filters),
    });

  const useGetById = (id: string) =>
    useQuery({
      queryKey: ['projects', id],
      queryFn: () => projectsApi.getById(id),
      enabled: !!id,
    });

  const useGetTags = () =>
    useQuery({
      queryKey: ['projects', 'tags'],
      queryFn: () => projectsApi.getTags(),
    });

  const useCreate = () =>
    useMutation({
      mutationFn: (data: ProjectInput) => projectsApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ProjectUpdateInput> }) =>
        projectsApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });

  const useSoftDelete = () =>
    useMutation({
      mutationFn: (id: string) => projectsApi.softDelete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });

  const useRestore = () =>
    useMutation({
      mutationFn: (id: string) => projectsApi.restore(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });

  const useUpdateStatus = () =>
    useMutation({
      mutationFn: ({ id, status }: { id: string; status: ProjectStatusInput['status'] }) =>
        projectsApi.updateStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });

  const useReorder = () =>
    useMutation({
      mutationFn: ({ id, order }: { id: string; order: number }) => projectsApi.reorder(id, order),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });

  return {
    useGetAll,
    useGetById,
    useGetTags,
    useCreate,
    useUpdate,
    useSoftDelete,
    useRestore,
    useUpdateStatus,
    useReorder,
  };
}