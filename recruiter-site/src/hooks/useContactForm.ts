import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { RecruiterContactInput } from '@jsoft/shared';

/**
 * Form data collected from the RecruiterContactForm.
 * Richer than the API's RecruiterContactInput — we map it on submit.
 */
export interface RecruiterContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  budget: string;
  message: string;
  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP';
}

/** Clean response shape the component consumes */
interface SubmitContactResult {
  success: boolean;
  message: string;
}

/**
 * Maps the rich form data to the API's RecruiterContactInput shape.
 * - name       → firstName
 * - phone      → whatsapp
 * - Extra      → encoded into message body
 */
function mapFormToApiInput(data: RecruiterContactFormData): RecruiterContactInput {
  const extras = [
    `Compañía: ${data.company}`,
    `Cargo: ${data.position}`,
    `Presupuesto: ${data.budget}`,
    `Contacto preferido: ${data.preferredContact === 'EMAIL' ? 'Email' : data.preferredContact === 'PHONE' ? 'Teléfono' : 'WhatsApp'}`,
  ].join('\n');

  return {
    firstName: data.name,
    email: data.email,
    whatsapp: data.phone || undefined,
    message: `${data.message}\n\n---\n${extras}`,
  };
}

/**
 * useSubmitContact
 *
 * Mutation hook that POSTs the recruiter contact form to the API.
 *
 * Usage:
 * ```ts
 * const { mutate, isPending, isSuccess, isError, error, data } = useSubmitContact();
 * ```
 *
 * Returns:
 * - mutate(formData)   – trigger the submission
 * - isPending          – true while request is in flight
 * - isSuccess          – true after a successful response
 * - isError            – true if the request failed
 * - error              – Error object with details
 * - data               – SubmitContactResult on success (null otherwise)
 */
export function useSubmitContact() {
  return useMutation<SubmitContactResult, Error, RecruiterContactFormData>({
    mutationFn: async (formData): Promise<SubmitContactResult> => {
      const payload = mapFormToApiInput(formData);

      const response = await apiClient.post<{
        message: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any;
      }>('/contact/recruiter', payload);

      return {
        success: true,
        message: response.message ?? 'Formulario enviado correctamente',
      };
    },
  });
}
