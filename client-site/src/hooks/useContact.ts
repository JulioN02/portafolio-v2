import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { normalizePhone } from '@jsoft/shared';
import type { ClientContactInput } from '@jsoft/shared';

interface SubmitContactOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSubmitContact({ onSuccess, onError }: SubmitContactOptions = {}) {
  return useMutation({
    mutationFn: (data: ClientContactInput & { source?: string; turnstileToken?: string }) =>
      apiClient.post('/contact/client', {
        ...data,
        whatsapp: data.whatsapp ? normalizePhone(data.whatsapp) : undefined,
      }),
    onSuccess,
    onError,
  });
}
