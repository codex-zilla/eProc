import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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

      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await api.post('/auth/refresh');
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token expired or invalid)
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
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
