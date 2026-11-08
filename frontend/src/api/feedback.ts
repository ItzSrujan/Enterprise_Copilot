import apiClient from './api';
import { FeedbackCreate, FeedbackResponse, AdminFeedbackRecord } from '@/types';

export const feedbackApi = {
  submit: async (payload: FeedbackCreate): Promise<FeedbackResponse> => {
    const response = await apiClient.post<FeedbackResponse>('/feedback', payload);
    return response.data;
  },

  list: async (rating?: string): Promise<AdminFeedbackRecord[]> => {
    const params = rating && rating !== 'all' ? { rating } : {};
    const response = await apiClient.get<AdminFeedbackRecord[]>('/feedback', { params });
    return response.data;
  },
};

