import axios from 'axios';
import { supabase } from '@/lib/supabase';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    // Redirect to login if token is invalid or expired
    router.push('/login');
  }
  return Promise.reject(error);
});

export const dashboardService = {
  getLatest: () => api.get('/dashboard/latest'),
  getHistory: () => api.get('/dashboard/history'),
  getState: () => api.get('/dashboard/state'),
  updateMode: (mode: 'AUTO' | 'MANUAL') => api.post('/dashboard/mode', { mode }),
  postTelemetry: (data: any) => api.post('/iot/telemetry', data),
};

export const chatService = {
  sendMessage: (message: string) => api.post('/chat', { message }),
  getHistory: () => api.get('/chat/history'),
};

export const systemService = {
  checkHealth: () => api.get('/health'),
  generateApiKey: (type: 'read' | 'write') => api.post(`/auth/keys?key_type=${type}`),
};

export default api;
