import axios, { type AxiosResponse } from 'axios';

export interface ApiResponse<T = unknown> {
  data: T
  success?: boolean
  message?: string
  timestamp?: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.data.retryAfterSeconds || 60;
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    }
    return Promise.reject(error);
  }
);

// Create apiClient wrapper with typed methods
export const apiClient = {
  get: <T = unknown>(url: string, config?: Parameters<typeof api.get>[1]): Promise<AxiosResponse<T>> => 
    api.get<T>(url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]): Promise<AxiosResponse<T>> => 
    api.post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: Parameters<typeof api.put>[2]): Promise<AxiosResponse<T>> => 
    api.put<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: Parameters<typeof api.delete>[1]): Promise<AxiosResponse<T>> => 
    api.delete<T>(url, config),
  patch: <T = unknown>(url: string, data?: unknown, config?: Parameters<typeof api.patch>[2]): Promise<AxiosResponse<T>> => 
    api.patch<T>(url, data, config),
}

export default api;