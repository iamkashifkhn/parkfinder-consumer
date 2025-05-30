import { AxiosInstance } from 'axios';
import { authService } from '../services/authService';

export const setupAxiosInterceptors = (api: AxiosInstance) => {
  // Add request interceptor to add token
  api.interceptors.request.use((config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor to handle 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Get current user before logging out to check role
        const currentUser = authService.getCurrentUser();
        const isConsumer = currentUser?.role === 'consumer';
        
        // Call logout when we get a 401
        await authService.logout();
        
        // Navigate based on user role
        window.location.href = isConsumer ? '/' : '/login';
      }
      return Promise.reject(error);
    }
  );
}; 