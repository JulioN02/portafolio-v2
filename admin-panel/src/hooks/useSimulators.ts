import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { simulatorsApi } from '../api/simulators.api';

export function useSimulators() {
  const queryClient = useQueryClient();

  const useGetAll = () =>
    useQuery({
      queryKey: ['simulators', 'all'],
      queryFn: () => simulatorsApi.list(),
    });

  const useUpload = () =>
    useMutation({
      mutationFn: ({ file, title }: { file: File; title: string }) =>
        simulatorsApi.upload(file, title),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['simulators'] });
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => simulatorsApi.remove(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['simulators'] });
      },
    });

  return { useGetAll, useUpload, useDelete };
}