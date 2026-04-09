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

/** IoT domain types — New */
export interface Zone {
  id: string;
  name: string;
  description?: string;
  crop_type?: string;
}

export interface ActuatorLogEntry {
  id: string;
  device: string;      // "BOMBA", "VENTILADOR", "LUZ"
  action: string;      // "ON", "OFF"
  reason: string;
  created_at: string;
}

export interface ActuatorLogResponse {
  logs: ActuatorLogEntry[];
  total: number;
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

/** Auth domain types — New */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;       // "bearer"
  user?: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
}

export interface SignUpCredentials {
  email: string;
  password: string;
  data?: Record<string, unknown>;
}

/** System domain types */
export type SystemMode = 'AUTO' | 'MANUAL';
export type ApiKeyType = 'read' | 'write';

/** API Response wrappers */
export interface ApiResponse<T> {
  data: T;
  status: number;
}

/** Updated Chat response — New */
export interface AiAction {
  device: string;      // "BOMBA", "VENTILADOR"
  action: string;      // "ON", "OFF"
  reason: string;
}

export interface ChatResponse {
  response: string;    // Texto del agrónomo IA
  actions: AiAction[]; // Comandos para actuadores
  alerts: string[];    // Mensajes de advertencia
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
