import apiClient from './api';
import { ChatRequest, ChatResponse } from '@/types';

export const chatApi = {
  sendMessage: async (payload: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/chat', payload);
    return response.data;
  },
};

