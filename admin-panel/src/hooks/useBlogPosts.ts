import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogPostsApi } from '../api/blogPosts.api';
import type { BlogPostInput, BlogPostUpdateInput, BlogPostFilterInput, BlogPostStatusInput } from '@jsoft/shared';

export function useBlogPosts() {
  const queryClient = useQueryClient();

  const useGetAll = (filters?: BlogPostFilterInput) =>
    useQuery({
      queryKey: ['blogPosts', 'all', filters],
      queryFn: () => blogPostsApi.getAll(filters),
    });

  const useGetById = (id: string) =>
    useQuery({
      queryKey: ['blogPosts', id],
      queryFn: () => blogPostsApi.getById(id),
      enabled: !!id,
    });

  const useCreate = () =>
    useMutation({
      mutationFn: (data: BlogPostInput) => blogPostsApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<BlogPostUpdateInput> }) =>
        blogPostsApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => blogPostsApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      },
    });

  const useUpdateStatus = () =>
    useMutation({
      mutationFn: ({ id, status }: { id: string; status: BlogPostStatusInput['status'] }) =>
        blogPostsApi.updateStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      },
    });

  const useRestore = () =>
    useMutation({
      mutationFn: (id: string) => blogPostsApi.restore(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      },
    });

  return {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
    useUpdateStatus,
    useRestore,
  };
}