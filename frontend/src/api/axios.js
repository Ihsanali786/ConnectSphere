import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/register') &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await api.post('/auth/refresh');
          isRefreshing = false;
          return api(original);
        } catch {
          isRefreshing = false;
          if (!window.location.pathname.match(/^\/(login|register|forgot-password|reset-password|verify-email|$)/)) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
