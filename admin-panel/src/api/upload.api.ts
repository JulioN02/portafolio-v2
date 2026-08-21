import { apiClient } from './client';

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface UploadApiResponse {
  message: string;
  data: UploadResult;
}

export type UploadBucket =
  | 'servicios'
  | 'productos'
  | 'herramientas'
  | 'blog'
  | 'casos-exito'
  | 'general';

export const uploadApi = {
  /**
   * POST /api/upload — Upload a single image via multipart FormData.
   * Must override the global JSON content-type, otherwise axios turns the
   * FormData into JSON and multer never receives a file.
   */
  uploadImage: async (
    file: File,
    bucket?: string,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (bucket) formData.append('bucket', bucket);

    const { data } = await apiClient.post<UploadApiResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (!onProgress || !progressEvent.total) return;
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress(Math.min(percent, 100));
      },
    });

    return data.data;
  },

  /**
   * DELETE /api/upload/:filename — Remove an uploaded file.
   */
  deleteImage: async (filename: string, bucket?: string): Promise<void> => {
    const params = bucket ? `?bucket=${encodeURIComponent(bucket)}` : '';
    await apiClient.delete(`/upload/${encodeURIComponent(filename)}${params}`);
  },
};