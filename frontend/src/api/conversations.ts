import apiClient from './api';
import { Conversation, ConversationDetail } from '@/types';

export const conversationsApi = {
  list: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<Conversation[]>('/conversations');
    return response.data;
  },

  get: async (id: number): Promise<ConversationDetail> => {
    const response = await apiClient.get<ConversationDetail>(`/conversations/${id}`);
    return response.data;
  },

  create: async (title: string = 'New conversation'): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>('/conversations', { title });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/conversations/${id}`);
  },
};

