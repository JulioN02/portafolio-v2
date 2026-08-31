import { apiClient } from './client';
import type {
  ProjectInput,
  ProjectUpdateInput,
  ProjectFilterInput,
  ProjectResponse,
  PaginatedResponse,
} from '@jsoft/shared';

export const projectsApi = {
  getAll: async (filters?: ProjectFilterInput): Promise<PaginatedResponse<ProjectResponse>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.search) params.append('search', filters.search);
    params.append('status', filters?.status || 'ALL');

    const { data } = await apiClient.get(`/projects?${params}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<ProjectResponse> => {
    const { data } = await apiClient.get(`/projects/${slug}`);
    return data;
  },

  getById: async (id: string): Promise<ProjectResponse> => {
    const { data } = await apiClient.get(`/projects/by-id/${id}`);
    return data;
  },

  create: async (project: ProjectInput): Promise<ProjectResponse> => {
    const { data } = await apiClient.post('/projects', project);
    return data;
  },

  update: async (id: string, project: Partial<ProjectUpdateInput>): Promise<ProjectResponse> => {
    const { data } = await apiClient.put(`/projects/${id}`, project);
    return data;
  },

  softDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  restore: async (id: string): Promise<ProjectResponse> => {
    const { data } = await apiClient.patch(`/projects/${id}/restore`);
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<ProjectResponse> => {
    const { data } = await apiClient.patch(`/projects/${id}/status`, { status });
    return data;
  },

  reorder: async (id: string, order: number): Promise<ProjectResponse> => {
    const { data } = await apiClient.patch(`/projects/${id}/reorder`, { order });
    return data;
  },

  getTags: async (): Promise<string[]> => {
    const { data } = await apiClient.get('/projects/tags');
    return data;
  },
};