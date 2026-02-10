import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

interface FailedRequest {
  resolve: (token: any) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

import { toast } from 'sonner';

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network Errors
    if (error.code === 'ERR_NETWORK') {
      toast.error('Connection Error', {
        description: 'Unable to connect to the server. Please check your internet connection.',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Handle Server Errors (500+)
    if (error.response && error.response.status >= 500) {
      toast.error('Server Error', {
        description: 'Something went wrong on our end. Please try again later.',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Check if error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Prevent infinite loop: if the failed request IS the refresh request, logout immediately
      if (originalRequest.url?.includes('/auth/refresh')) {
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        await api.post('/auth/refresh');
        
        processQueue(null, true);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh failed (token expired or invalid)
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Debug logging
    if (error.response) {
      console.debug(`API Error: ${error.response.status} on ${error.config?.url}`, error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
