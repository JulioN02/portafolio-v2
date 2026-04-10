import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ClientContactInput } from '@jsoft/shared';

interface SubmitContactOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSubmitContact({ onSuccess, onError }: SubmitContactOptions = {}) {
  return useMutation({
    mutationFn: (data: ClientContactInput & { source?: string }) =>
      apiClient.post('/contact/client', data),
    onSuccess,
    onError,
  });
}
