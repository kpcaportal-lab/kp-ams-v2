import axios from 'axios';
import { useLoadingStore } from '@/store/loadingStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  useLoadingStore.getState().startLoading();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  useLoadingStore.getState().stopLoading();
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (res) => {
    useLoadingStore.getState().stopLoading();
    return res;
  },
  (error) => {
    useLoadingStore.getState().stopLoading();
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kp_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
