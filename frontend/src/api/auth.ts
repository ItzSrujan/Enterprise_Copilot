import apiClient from './api';
import { LoginCredentials, RegisterData, TokenResponse, User } from '@/types';
import { removeStoredToken } from '@/utils/helpers';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    removeStoredToken();
    const response = await apiClient.post<TokenResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  getMe: async (token?: string): Promise<User> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<User>('/auth/me', { headers });
    return response.data;
  },

  listUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/auth/users');
    return response.data;
  },
};

