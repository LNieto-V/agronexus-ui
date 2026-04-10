import axios, { AxiosResponse } from 'axios';
import type { 
  DashboardLatestResponse, 
  DashboardStateResponse, 
  SystemMode, 
  TelemetryPayload,
  ChatResponse,
  ChatHistoryResponse,
  ApiKeyResponse,
  ApiKeyType,
  Conversation,
  Zone,
  ActuatorLogResponse
} from '@/types';
import router from '@/router';
import { toastController } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const finalBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

const api = axios.create({
  baseURL: finalBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agronexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  // --- 401 Unauthorized: session expired ---
  if (error.response?.status === 401) {
    const authStore = useAuthStore();
    
    const toast = await toastController.create({
      message: 'Session expired. Please log in again.',
      duration: 3000,
      color: 'warning',
      position: 'top',
      cssClass: 'premium-toast'
    });
    await toast.present();
    
    authStore.signOut();
    router.push('/login');
  }

  return Promise.reject(error);
});

export const dashboardService = {
  getLatest: (zone_id?: string | null): Promise<AxiosResponse<DashboardLatestResponse>> => 
    api.get('dashboard/latest', { params: { zone_id } }),
  getHistory: (zone_id?: string | null): Promise<AxiosResponse<DashboardLatestResponse[] | { history: DashboardLatestResponse[] }>> => 
    api.get('dashboard/history', { params: { zone_id } }),
  getState: (): Promise<AxiosResponse<DashboardStateResponse>> => api.get('dashboard/state'),
  updateMode: (mode: SystemMode): Promise<AxiosResponse<unknown>> => api.post('dashboard/mode', { mode }),
  postTelemetry: (data: TelemetryPayload): Promise<AxiosResponse<unknown>> => api.post('iot/telemetry', data),
  exportHistory: (period = 30): Promise<AxiosResponse<Blob>> => 
    api.get('dashboard/export', { 
      params: { period },
      responseType: 'blob'
    }),
};

export const chatService = {
  sendMessage: (message: string, session_id?: string | null): Promise<AxiosResponse<ChatResponse>> => 
    api.post('chat', { message, session_id }),
  getHistory: (session_id?: string | null, limit = 50, offset = 0): Promise<AxiosResponse<ChatHistoryResponse>> => 
    api.get('chat/history', { params: { session_id, limit, offset } }),
  generateReport: (data: { zone_id?: string | null, hours: number, focus: string, session_id?: string | null }): Promise<AxiosResponse<ChatResponse>> =>
    api.post('chat/report', data),
};

export const iotService = {
  getActuatorLog: (limit = 50, offset = 0, zone_id?: string | null): Promise<AxiosResponse<ActuatorLogResponse>> =>
    api.get('dashboard/actuator-log', { params: { limit, offset, zone_id } }),
  
  getZones: (): Promise<AxiosResponse<Zone[]>> =>
    api.get('zones/'),
  
  createZone: (name: string, crop_type?: string): Promise<AxiosResponse<Zone>> =>
    api.post('zones/', { name, crop_type }),

  updateZone: (id: string, name: string, crop_type?: string): Promise<AxiosResponse<Zone>> =>
    api.patch(`zones/${id}/`, { name, crop_type }),

  deleteZone: (id: string): Promise<AxiosResponse<unknown>> =>
    api.delete(`zones/${id}/`),
  
  createTelemetryStream: (token: string): EventSource => {
    const baseUrl = api.defaults.baseURL?.replace(/\/$/, '') || 'http://localhost:8000';
    return new EventSource(`${baseUrl}/iot/stream?token=${token}`);
  }
};

export const conversationService = {
  getConversations: (): Promise<AxiosResponse<Conversation[]>> => api.get('conversations'),
  createConversation: (title: string): Promise<AxiosResponse<Conversation>> => api.post('conversations', { title }),
  renameConversation: (id: string, title: string): Promise<AxiosResponse<Conversation>> => api.patch(`conversations/${id}`, { title }),
  deleteConversation: (id: string): Promise<AxiosResponse<unknown>> => api.delete(`conversations/${id}`),
};

export const systemService = {
  checkHealth: (): Promise<AxiosResponse<unknown>> => api.get('health'),
  generateApiKey: (type: ApiKeyType, zone_id?: string | null): Promise<AxiosResponse<ApiKeyResponse>> => 
    api.post(`auth/keys`, null, { params: { key_type: type, zone_id } }),
};

export const userService = {
  updateProfile: (metadata: Record<string, unknown>): Promise<AxiosResponse<unknown>> => 
    api.patch('auth/profile', { metadata }),
};

export default api;
