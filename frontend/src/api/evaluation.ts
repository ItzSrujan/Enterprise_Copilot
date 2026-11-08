import apiClient from './api';
import { EvaluationCreate, EvaluationItem, EvaluationResponse } from '@/types';

export const evaluationApi = {
  run: async (payload: EvaluationCreate): Promise<EvaluationResponse> => {
    const response = await apiClient.post<EvaluationResponse>('/evaluation/run', payload);
    return response.data;
  },

  list: async (skip = 0, limit = 20): Promise<EvaluationItem[]> => {
    const response = await apiClient.get<EvaluationItem[]>(
      `/evaluation?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  get: async (id: number): Promise<EvaluationItem> => {
    const response = await apiClient.get<EvaluationItem>(`/evaluation/${id}`);
    return response.data;
  },
};

