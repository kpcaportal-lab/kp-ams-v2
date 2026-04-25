import axios from 'axios';
import { useLoadingStore } from '@/store/loadingStore';
import { toast } from 'react-hot-toast';

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    // If not on localhost, assume the API is on the same domain (common for monolithic/proxied deploys)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  
  return 'http://localhost:4000';
};

const baseURL = getBaseURL();
if (typeof window !== 'undefined') {
  console.log('📡 API Base URL initialized:', baseURL);
}

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
let isRedirecting = false;

api.interceptors.response.use(
  (res) => {
    useLoadingStore.getState().stopLoading();
    return res;
  },
  (error) => {
    useLoadingStore.getState().stopLoading();
    
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem('kp_token');
        document.cookie = 'kp_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        toast.error('Session expired. Please login again.', { id: 'auth-error' });
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
