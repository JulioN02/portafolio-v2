import type { ApiClient } from './client.js';
import type { SituationInput, SituationUpdateInput, SituationPatchInput } from '../schemas/situation.schema.js';

/**
 * Situations API — public selector list + admin CRUD.
 */
export const situationsApi = {
  listPublic<T>(client: ApiClient): Promise<T> {
    return client.get<T>('/api/situations');
  },

  listAdmin<T>(client: ApiClient): Promise<T> {
    return client.get<T>('/api/admin/situations');
  },

  create<T>(client: ApiClient, input: SituationInput): Promise<T> {
    return client.post<T>('/api/situations', input);
  },

  update<T>(client: ApiClient, id: string, input: SituationUpdateInput): Promise<T> {
    return client.put<T>(`/api/situations/${id}`, input);
  },

  patch<T>(client: ApiClient, id: string, input: SituationPatchInput): Promise<T> {
    return client.patch<T>(`/api/situations/${id}`, input);
  },

  remove<T>(client: ApiClient, id: string): Promise<T> {
    return client.delete<T>(`/api/situations/${id}`);
  },
};

/**
 * Featured endpoints for services, success cases and blog posts.
 */
export const featuredApi = {
  listFeaturedServices<T>(client: ApiClient, limit = 3): Promise<T> {
    return client.get<T>('/api/services/featured', { params: { limit } });
  },

  listFeaturedSuccessCases<T>(client: ApiClient, limit = 3): Promise<T> {
    return client.get<T>('/api/success-cases/featured', { params: { limit } });
  },

  listFeaturedBlogPosts<T>(client: ApiClient, limit = 3): Promise<T> {
    return client.get<T>('/api/blog-posts/featured', { params: { limit } });
  },

  patchServiceFeatured<T>(client: ApiClient, id: string, featured: boolean): Promise<T> {
    return client.patch<T>(`/api/services/${id}/featured`, { featured });
  },

  patchSuccessCaseFeatured<T>(client: ApiClient, id: string, featured: boolean): Promise<T> {
    return client.patch<T>(`/api/success-cases/${id}/featured`, { featured });
  },

  patchBlogPostFeatured<T>(client: ApiClient, id: string, featured: boolean): Promise<T> {
    return client.patch<T>(`/api/blog-posts/${id}/featured`, { featured });
  },
};
