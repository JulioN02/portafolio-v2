import { createApiClient } from '@jsoft/shared';

export const apiClient = createApiClient({
  baseUrl: '/api',
  onUnauthorized: () => {
    // Client site is public, no special handling needed
    console.warn('API returned 401');
  },
});
