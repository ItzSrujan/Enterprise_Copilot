import axios, { AxiosError } from 'axios';
import { getStoredToken, removeStoredToken } from '@/utils/helpers';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present and not on public auth endpoints
apiClient.interceptors.request.use(
  (config) => {
    const isAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register');

    if (!isAuthEndpoint) {
      const token = getStoredToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (config.headers) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle error statuses (400, 401, 403, 404, 422, 500, network errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let message = 'An unexpected error occurred.';

    if (!error.response) {
      // Network error (backend down or unreachable)
      message =
        'Network error: Unable to connect to backend server. Please verify the FastAPI service is running at ' +
        API_BASE_URL;
    } else if (data?.detail) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        // FastAPI 422 validation errors: array of { loc, msg, type }
        message = data.detail
          .map((item: any) => item.msg || JSON.stringify(item))
          .join(', ');
      } else {
        message = JSON.stringify(data.detail);
      }
    } else if (status === 403) {
      message = 'Access denied: You do not have permission to access this resource.';
    } else if (error.message) {
      message = error.message;
    }

    // 401 Unauthorized handling: expire session and redirect unless on login or register
    if (status === 401) {
      const isAuthUrl =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');

      if (!isAuthUrl) {
        removeStoredToken();
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')
        ) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;

