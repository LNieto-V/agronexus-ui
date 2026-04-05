import axios, { AxiosResponse } from 'axios';
import type { 
  DashboardLatestResponse, 
  DashboardStateResponse, 
  SystemMode, 
  TelemetryPayload,
  ChatSendResponse,
  ChatHistoryResponse,
  ApiKeyResponse,
  ApiKeyType,
  Conversation
} from '@/types';
import { supabase } from '@/lib/supabase';
import router from '@/router';
import { toastController } from '@ionic/vue';

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
}, async (error) => {
  if (error.response?.status === 401) {
    // Show a toast message to the user before redirecting
    const toast = await toastController.create({
      message: 'Session expired. Please log in again.',
      duration: 3000,
      color: 'warning',
      position: 'top',
      cssClass: 'premium-toast'
    });
    await toast.present();
    
    // Redirect to login if token is invalid or expired
    router.push('/login');
  }
  return Promise.reject(error);
});

export const dashboardService = {
  getLatest: (): Promise<AxiosResponse<DashboardLatestResponse>> => api.get('/dashboard/latest'),
  getHistory: (): Promise<AxiosResponse<DashboardLatestResponse[] | { history: DashboardLatestResponse[] }>> => api.get('/dashboard/history'),
  getState: (): Promise<AxiosResponse<DashboardStateResponse>> => api.get('/dashboard/state'),
  updateMode: (mode: SystemMode): Promise<AxiosResponse<unknown>> => api.post('/dashboard/mode', { mode }),
  postTelemetry: (data: TelemetryPayload): Promise<AxiosResponse<unknown>> => api.post('/iot/telemetry', data),
};

export const chatService = {
  sendMessage: (message: string, session_id?: string | null): Promise<AxiosResponse<ChatSendResponse>> => 
    api.post('/chat', { message, session_id }),
  getHistory: (session_id?: string | null): Promise<AxiosResponse<ChatHistoryResponse>> => 
    api.get(`/chat/history${session_id ? `?session_id=${session_id}` : ''}`),
};

export const conversationService = {
  getConversations: (): Promise<AxiosResponse<Conversation[]>> => api.get('/conversations'),
  createConversation: (title: string): Promise<AxiosResponse<Conversation>> => api.post('/conversations', { title }),
  renameConversation: (id: string, title: string): Promise<AxiosResponse<Conversation>> => api.patch(`/conversations/${id}`, { title }),
  deleteConversation: (id: string): Promise<AxiosResponse<unknown>> => api.delete(`/conversations/${id}`),
};

export const systemService = {
  checkHealth: (): Promise<AxiosResponse<unknown>> => api.get('/health'),
  generateApiKey: (type: ApiKeyType): Promise<AxiosResponse<ApiKeyResponse>> => api.post(`/auth/keys?key_type=${type}`),
};

export default api;
