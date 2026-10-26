import axios from 'axios';

import { config } from '@/constants/config';
import { STORAGE_KEYS } from '@/constants/storage';
import { secureStorage } from '@/services/secureStorage';
import { useAuthStore } from '@/store/useAuthStore';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl || undefined,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (request) => {
  const accessToken = await secureStorage.get(STORAGE_KEYS.ACCESS_TOKEN);

  if (accessToken) {
    request.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { isAuthenticated, clearSession } = useAuthStore.getState();

      if (isAuthenticated) {
        try {
          await clearSession();
        } catch (clearError) {
          console.error('Failed to clear session after 401 response.', clearError);
        }
      }
    }

    return Promise.reject(error);
  },
);
