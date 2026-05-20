import { createApiClient } from '@jsoft/shared';

export const apiClient = createApiClient({
  baseUrl: '/api',
  onUnauthorized: () => {
    // Recruiter site is public, no special handling needed
    console.warn('API returned 401');
  },
});
