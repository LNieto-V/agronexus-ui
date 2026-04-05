/** Telemetry domain types */
export interface TelemetryData {
  temperature: number;
  humidity: number;
  ph: number;
  ec: number;
  light: number;
  timestamp: string;
}

export type TelemetryKey = keyof Omit<TelemetryData, 'timestamp'>;

export interface TelemetryPayload {
  temperature: number;
  humidity: number;
  ph: number;
  ec: number;
  light: number;
}

/** Chat domain types */
export interface Conversation {
  id: string;           // UUID
  title: string;        // Nombre visible en sidebar
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp (usado para ordenar)
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  message: string;
  created_at: string;
  session_id: string | null;
}

export interface ChatHistoryItem {
  id: string;
  role: string;
  message: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string | null;
}

export interface ConversationCreate {
  title: string;
}

/** System domain types */
export type SystemMode = 'AUTO' | 'MANUAL';
export type ApiKeyType = 'read' | 'write';

/** API Response wrappers */
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ChatSendResponse {
  response: string;
  session_id?: string;
}

export interface ChatHistoryResponse {
  history: ChatHistoryItem[];
}

export interface DashboardStateResponse {
  mode: SystemMode;
}

export interface DashboardLatestResponse {
  sensor_data?: Record<string, number>;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ApiKeyResponse {
  api_key: string;
}
