import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
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
};

export const systemService = {
  checkHealth: () => api.get('/health'),
};

export default api;
