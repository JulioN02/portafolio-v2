import { createApiClient } from '@jsoft/shared';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = createApiClient({
  baseUrl: API_URL,
  onUnauthorized: () => {
    // Recruiter site is public
    console.warn('API returned 401');
  },
});
