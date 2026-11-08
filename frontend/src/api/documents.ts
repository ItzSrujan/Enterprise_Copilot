import apiClient from './api';
import { DocumentItem, AdminStatsData } from '@/types';

export const documentsApi = {
  list: async (): Promise<DocumentItem[]> => {
    const response = await apiClient.get<DocumentItem[]>('/documents');
    return response.data;
  },

  getStats: async (): Promise<AdminStatsData> => {
    const response = await apiClient.get<AdminStatsData>('/documents/stats');
    return response.data;
  },

  upload: async (file: File, documentType: string): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await apiClient.post<DocumentItem>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/documents/${id}`);
    return response.data;
  },
};

