import axios from 'axios';
import { authService } from './auth-backend';

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending credentials
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const session = authService.getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
      // Add X-User-Session header with properly serialized user data
      if (session.user) {
        const { id, _id, ...userData } = session.user;
        config.headers['X-User-Session'] = JSON.stringify({
          ...userData,
          id: id || _id,
          _id: _id || id,
        });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await authService.refreshToken();
        
        // Get new token and update request
        const session = authService.getSession();
        if (session?.token) {
          originalRequest.headers.Authorization = `Bearer ${session.token}`;
          // Update X-User-Session header with new token
          if (session.user) {
            const { id, _id, ...userData } = session.user;
            originalRequest.headers['X-User-Session'] = JSON.stringify({
              ...userData,
              id: id || _id,
              _id: _id || id,
            });
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear session and reject
        authService.clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
