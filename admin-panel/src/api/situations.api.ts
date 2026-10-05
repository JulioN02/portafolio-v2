import { apiClient } from './client';
import type { SituationInput, SituationUpdateInput, SituationPatchInput } from '@jsoft/shared';

export interface SituationServiceRef {
  id: string;
  title: string;
  classification: string;
  status: string;
}

export interface SituationAdmin {
  id: string;
  title: string;
  description: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  services: SituationServiceRef[];
}

export const situationsApi = {
  getAll: async (): Promise<SituationAdmin[]> => {
    const { data } = await apiClient.get<{ data: SituationAdmin[] }>('/admin/situations');
    return data.data;
  },

  getById: async (id: string): Promise<SituationAdmin> => {
    const { data } = await apiClient.get<SituationAdmin>(`/admin/situations/${id}`);
    return data;
  },

  create: async (input: SituationInput): Promise<SituationAdmin> => {
    const { data } = await apiClient.post<SituationAdmin>('/situations', input);
    return data;
  },

  update: async (id: string, input: SituationUpdateInput): Promise<SituationAdmin> => {
    const { data } = await apiClient.put<SituationAdmin>(`/situations/${id}`, input);
    return data;
  },

  patch: async (id: string, input: SituationPatchInput): Promise<SituationAdmin> => {
    const { data } = await apiClient.patch<SituationAdmin>(`/situations/${id}`, input);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/situations/${id}`);
  },
};
