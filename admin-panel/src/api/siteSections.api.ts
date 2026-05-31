import { apiClient } from './client';
import type { SiteSectionResponse, SiteSectionUpdateInput, SiteSectionReorderInput } from '@jsoft/shared';

export const siteSectionsApi = {
  getAll: async (): Promise<SiteSectionResponse[]> => {
    const { data } = await apiClient.get<SiteSectionResponse[]>('/site-sections');
    return data;
  },
  getById: async (id: string): Promise<SiteSectionResponse> => {
    const { data } = await apiClient.get<SiteSectionResponse>(`/site-sections/${id}`);
    return data;
  },
  reorder: async (sections: SiteSectionReorderInput['sections']): Promise<{ data: SiteSectionResponse[] }> => {
    const { data } = await apiClient.put<{ data: SiteSectionResponse[] }>('/site-sections/reorder', { sections });
    return data;
  },
  update: async (id: string, updateData: SiteSectionUpdateInput): Promise<SiteSectionResponse> => {
    const { data } = await apiClient.patch<SiteSectionResponse>(`/site-sections/${id}`, updateData);
    return data;
  },
};
