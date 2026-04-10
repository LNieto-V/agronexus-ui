# Blueprint de Sincronización Frontend: AgroNexus AI

> **Archivo**: `docs/FRONTEND_SYNC_PLAN.md`  
> **Versión**: 1.0 — 2026-04-08  
> **Stack**: Ionic + Vue 3 + Pinia | Backend: FastAPI DDD-Lite en Vercel

---

## 📋 Estado Actual del Código (Auditoría)

Antes de aplicar cambios, se identificaron los siguientes puntos críticos en el código existente:

| Archivo | Problema detectado | Prioridad |
| :--- | :--- | :---: |
| `stores/auth.ts` | Usa `supabase.auth.signInWithPassword()` directamente | ✅ Resuelto |
| `stores/auth.ts` | Inyecta JWT desde `supabase.auth.getSession()` | ✅ Resuelto |
| `services/api.ts` | Request interceptor depende del SDK de Supabase | ✅ Resuelto |
| `types/index.ts` | `ChatSendResponse` contrato incompleto | ✅ Resuelto |
| `stores/conversationsStore.ts` | `sendMessage()` no procesa `actions[]` | ✅ Resuelto |
| `services/api.ts` | No maneja el error `HTTP 429` | ✅ Resuelto |
| `services/api.ts` | SSE y Gestión de Zonas | ✅ Resuelto |
| `stores/telemetry.ts` | Paginación en logs | ✅ Resuelto |
| `stores/conversationsStore.ts` | Infinite Scroll Chat | ✅ Resuelto |

---

## 🏗️ 1. Cambio de Paradigma: Backend como Mediador Único

El frontend **deja de comunicarse directamente con Supabase SDK** para Auth o DB. Toda interacción pasa por el backend FastAPI para garantizar trazabilidad, auditoría y validación centralizada.

### Flujo de autenticación actual (❌ Legado)
```
Frontend → supabase.auth.signInWithPassword() → Supabase Auth SDK
Frontend → supabase.auth.getSession() → JWT para inyectar en Axios
```

### Flujo de autenticación nuevo (✅ DDD-Lite)
```
Frontend → POST /api/auth/login → Backend → Supabase (internamente)
Backend → { access_token } → Frontend → localStorage → Axios interceptor
```

---

## 🔑 2. Migración del AuthStore (`stores/auth.ts`)

### 2.1 — Nuevas interfaces de tipos requeridas

Agregar en `src/types/index.ts`:

```typescript
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
```

### 2.2 — Refactorización del store

**Archivo**: `src/stores/auth.ts`

**Cambios principales:**
- Eliminar imports de `@supabase/supabase-js` y `@/lib/supabase`.
- Reemplazar `session` (objeto Supabase) por `accessToken` (string simple en localStorage).
- Implementar `signIn()` contra `POST /api/auth/login`.
- Implementar `signUp()` contra `POST /api/auth/register` (si el backend lo expone).
- Mantener `userDisplayName` y `isAuthenticated` como computed reactivos.

```typescript
// src/stores/auth.ts — NUEVO
import { defineStore } from 'pinia';
import { shallowRef, computed } from 'vue';
import api from '@/services/api'; // Axios instance sin Supabase
import type { LoginCredentials, LoginResponse } from '@/types';

const TOKEN_KEY = 'agronexus_token';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = shallowRef<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  const userEmail = shallowRef<string | null>(null);
  const loading = shallowRef(false);
  const initialized = shallowRef(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  const userDisplayName = computed(() => {
    return userEmail.value?.split('@')[0] || 'Farmer';
  });

  function setToken(token: string | null) {
    accessToken.value = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // Llamado en main.ts — valida que el token almacenado sigue siendo válido
  async function initialize() {
    if (initialized.value) return;
    initialized.value = true;
    loading.value = false;
    // Opcional: llamar a GET /api/auth/me para verificar token
  }

  async function signIn(credentials: LoginCredentials) {
    loading.value = true;
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      setToken(response.data.access_token);
      userEmail.value = credentials.email;
      return response.data;
    } finally {
      loading.value = false;
    }
  }

  async function signUp(credentials: LoginCredentials) {
    loading.value = true;
    try {
      const response = await api.post<LoginResponse>('/auth/register', credentials);
      setToken(response.data.access_token);
      userEmail.value = credentials.email;
      return response.data;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    setToken(null);
    userEmail.value = null;
  }

  return {
    accessToken, userEmail, loading, initialized,
    isAuthenticated, userDisplayName,
    initialize, signIn, signUp, signOut, setToken
  };
});
```

> [!IMPORTANT]
> Las páginas `LoginPage.vue` y `RegisterPage.vue` deben actualizar sus llamadas de `authStore.signIn()` / `authStore.signUp()` para que sigan funcionando con el nuevo store (la firma de los métodos es compatible).

---

## 📡 3. Endpoints y Mapeo de Dominios

### 3.1 — Tabla completa de endpoints

| Dominio | Método | Endpoint | Funcionalidad | Store Pinia | Estado |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **Auth** | POST | `/api/auth/login` | Login de usuario | `authStore` | 🔴 Nuevo |
| **Auth** | POST | `/api/auth/register` | Registro de usuario | `authStore` | 🔴 Nuevo |
| **IoT** | GET | `/api/dashboard/latest` | Último estado de sensores | `telemetryStore` | ✅ Existe |
| **IoT** | GET | `/api/dashboard/history` | Gráficas de tendencias | `telemetryStore` | ✅ Existe |
| **IoT** | GET | `/api/iot/stream` | Telemetría SSE (Real-time) | `telemetryStore` | 🔴 Nuevo |
| **IoT** | GET | `/api/dashboard/actuator-log` | Logs de bombas/luces | `iotStore` (Paginado) | 🔴 Nuevo |
| **IoT** | GET | `/api/zones` | Zonas/invernaderos | `iotStore` | 🔴 Nuevo |
| **Chat** | POST | `/api/chat` | Orquestador de IA | `chatStore` | ✅ Existe |
| **Chat** | GET | `/api/chat/history` | Mensajes anteriores | `chatStore` (Paginado) | ✅ Existe |
| **Chat** | GET | `/api/conversations` | Listar sesiones | `chatStore` | ✅ Existe |
| **Chat** | POST | `/api/conversations` | Crear sesión | `chatStore` | ✅ Existe |
| **Chat** | PATCH | `/api/conversations/:id` | Renombrar sesión | `chatStore` | ✅ Existe |
| **Chat** | DELETE | `/api/conversations/:id` | Borrar sesión | `chatStore` | ✅ Existe |
| **System** | GET | `/api/dashboard/state` | Estado del modo AUTO/MANUAL | `systemStore` | ✅ Existe |
| **System** | POST | `/api/dashboard/mode` | Cambiar modo | `systemStore` | ✅ Existe |
| **System** | GET | `/api/health` | Health check | `systemStore` | ✅ Existe |
| **Auth** | POST | `/api/auth/keys` | Generar API Key | `systemStore` | ✅ Existe |

### 3.2 — Nueva estructura de servicios en `api.ts`

Agregar los siguientes métodos al servicio existente:

```typescript
// Agregar en src/services/api.ts

export const iotService = {
  getActuatorLog: (limit = 50, offset = 0): Promise<AxiosResponse<ActuatorLogResponse>> =>
    api.get(`/api/dashboard/actuator-log?limit=${limit}&offset=${offset}`),
  
  getZones: (): Promise<AxiosResponse<Zone[]>> =>
    api.get('/api/zones'),
  
  // SSE — No usa Axios, usa EventSource nativo
  createTelemetryStream: (token: string): EventSource => {
    return new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}/api/iot/stream?token=${token}`
    );
  }
};
```

---

## 🔢 4. Manejo de Paginación (Infinite Scroll)

### 4.1 — Patrón estándar de paginación

Todos los endpoints paginados reciben:
- `limit`: número de registros por página (default: `50`)
- `offset`: número de registros a saltar (`page * limit`)

### 4.2 — Implementación en `conversationsStore.ts` (Chat History)

```typescript
// Agregar en conversationsStore.ts

const chatPage = ref(0);
const chatHasMore = ref(true);
const CHAT_PAGE_SIZE = 50;

async function loadMoreMessages() {
  if (!chatHasMore.value || isLoading.value) return;
  isLoading.value = true;
  
  const offset = chatPage.value * CHAT_PAGE_SIZE;
  try {
    const response = await chatService.getHistory(
      activeSessionId.value,
      CHAT_PAGE_SIZE,
      offset
    );
    const items = response.data.history || [];
    
    if (items.length < CHAT_PAGE_SIZE) chatHasMore.value = false;
    
    // Prepend (mensajes más antiguos van al inicio)
    const mapped = items.map(mapHistoryItem);
    messages.value = [...mapped, ...messages.value];
    chatPage.value++;
  } finally {
    isLoading.value = false;
  }
}

// Reset al cambiar de sesión
function resetPagination() {
  chatPage.value = 0;
  chatHasMore.value = true;
}
```

### 4.3 — Nuevo store `iotStore.ts` para Actuator Log

```typescript
// src/stores/iotStore.ts — NUEVO
import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import { iotService } from '@/services/api';
import type { ActuatorLogEntry, Zone } from '@/types';

export const useIotStore = defineStore('iot', () => {
  const actuatorLogs = ref<ActuatorLogEntry[]>([]);
  const zones = ref<Zone[]>([]);
  const selectedZoneId = shallowRef<string | null>(null);
  const logPage = ref(0);
  const logHasMore = ref(true);
  const isLoadingLogs = ref(false);
  const LOG_PAGE_SIZE = 50;

  async function fetchZones() {
    const response = await iotService.getZones();
    zones.value = response.data;
  }

  async function fetchActuatorLogs(reset = false) {
    if (isLoadingLogs.value) return;
    if (reset) {
      actuatorLogs.value = [];
      logPage.value = 0;
      logHasMore.value = true;
    }
    if (!logHasMore.value) return;

    isLoadingLogs.value = true;
    const offset = logPage.value * LOG_PAGE_SIZE;
    try {
      const response = await iotService.getActuatorLog(LOG_PAGE_SIZE, offset);
      const items = response.data.logs || [];
      if (items.length < LOG_PAGE_SIZE) logHasMore.value = false;
      actuatorLogs.value = [...actuatorLogs.value, ...items];
      logPage.value++;
    } finally {
      isLoadingLogs.value = false;
    }
  }

  return {
    actuatorLogs, zones, selectedZoneId,
    logHasMore, isLoadingLogs,
    fetchZones, fetchActuatorLogs
  };
});
```

### 4.4 — Nuevos tipos requeridos en `types/index.ts`

```typescript
/** IoT domain types — New */
export interface Zone {
  id: string;
  name: string;
  description?: string;
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
```

> [!WARNING]
> La interfaz `ChatSendResponse` actual en `types/index.ts` **debe ser reemplazada** por `ChatResponse` para que el store procese correctamente las acciones de actuadores.

---

## 🛠️ 5. Refactorización del Cliente API (`services/api.ts`)

### 5.1 — Eliminar dependencia de Supabase SDK

**Cambio en Request Interceptor:**

```typescript
// ANTES (❌ Supabase SDK)
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// DESPUÉS (✅ localStorage nativo)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agronexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 5.2 — Agregar manejo de HTTP 429 (Quota Gemini)

```typescript
// Agregar en el Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {

    // --- 401 Unauthorized: sesión expirada ---
    if (error.response?.status === 401) {
      const toast = await toastController.create({
        message: 'Sesión expirada. Por favor inicia sesión nuevamente.',
        duration: 3000,
        color: 'warning',
        position: 'top',
        cssClass: 'premium-toast'
      });
      await toast.present();
      localStorage.removeItem('agronexus_token');
      router.push('/login');
    }

    // --- 429 Too Many Requests: Quota de Gemini agotada ---
    if (error.response?.status === 429) {
      const toast = await toastController.create({
        message: '🌿 La IA está descansando, reintenta en un minuto.',
        duration: 5000,
        color: 'tertiary',
        position: 'top',
        cssClass: 'premium-toast',
        icon: 'timer-outline'
      });
      await toast.present();
    }

    return Promise.reject(error);
  }
);
```

### 5.3 — Actualizar `chatService.sendMessage()` para reflejar `ChatResponse`

```typescript
// En src/services/api.ts
import type { ChatResponse } from '@/types';  // ← Nuevo tipo

export const chatService = {
  sendMessage: (
    message: string, 
    session_id?: string | null
  ): Promise<AxiosResponse<ChatResponse>> =>
    api.post('/chat', { message, session_id }),

  getHistory: (
    session_id?: string | null, 
    limit = 50, 
    offset = 0
  ): Promise<AxiosResponse<ChatHistoryResponse>> =>
    api.get(`/chat/history`, { 
      params: { session_id, limit, offset } 
    }),
};
```

---

## 💬 6. Procesamiento de Actions en `conversationsStore.ts`

### 6.1 — Lógica de procesamiento tras recibir respuesta de Chat

```typescript
// En conversationsStore.ts → sendMessage()
// Reemplazar el bloque de "Add AI response" por:

const chatResp = response.data as ChatResponse;

// Agregar respuesta de texto del AI
const aiMsg: ChatMessage = {
  id: (Date.now() + 1).toString(),
  role: 'ai',
  message: chatResp.response,
  created_at: new Date().toISOString(),
  session_id: activeSessionId.value,
};
messages.value = [...messages.value, aiMsg];

// Emitir evento global para que el Dashboard reaccione
if (chatResp.actions.length > 0) {
  chatResp.actions.forEach((action) => {
    // Logging en systemStore para el Activity Log
    useSystemStore().addLog(
      'AI', 
      `CMD: ${action.device} → ${action.action} | ${action.reason}`
    );
  });
  // Disparar evento para micro-animación en Dashboard
  emitActuatorActions(chatResp.actions);
}

// Mostrar Toast por cada alerta
if (chatResp.alerts.length > 0) {
  chatResp.alerts.forEach(async (alert) => {
    const toast = await toastController.create({
      message: `⚠️ ${alert}`,
      duration: 4000,
      color: 'warning',
      position: 'top',
    });
    await toast.present();
    useSystemStore().addLog('ALERT', alert);
  });
}
```

### 6.2 — Bus de eventos para micro-animaciones

Crear composable `src/composables/useActuatorBus.ts`:

```typescript
// src/composables/useActuatorBus.ts
import { ref } from 'vue';
import type { AiAction } from '@/types';

// Bus reactivo global (singleton por módulo)
const pendingActions = ref<AiAction[]>([]);

export function useActuatorBus() {
  function emitActuatorActions(actions: AiAction[]) {
    pendingActions.value = actions;
    // Limpiar tras animación (2s)
    setTimeout(() => { pendingActions.value = []; }, 2000);
  }

  return { pendingActions, emitActuatorActions };
}
```

---

## 🎨 7. Diseño y UX — Micro-interacciones

### 7.1 — Pulsos en el Dashboard al recibir acciones de IA

En `TelemetryDashboard.vue` o el componente de actuadores relevante:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useActuatorBus } from '@/composables/useActuatorBus';

const { pendingActions } = useActuatorBus();

// La bomba está siendo activada por la IA?
const isBombaActive = computed(() =>
  pendingActions.value.some(a => a.device === 'BOMBA' && a.action === 'ON')
);

const isVentiladorActive = computed(() =>
  pendingActions.value.some(a => a.device === 'VENTILADOR' && a.action === 'ON')
);
</script>

<template>
  <!-- Indicador de bomba con pulso verde (micro-animación) -->
  <div 
    class="actuator-indicator"
    :class="{ 'pulse-green': isBombaActive }"
  >
    💧 Bomba
  </div>
</template>

<style scoped>
@keyframes pulseGreen {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0.3); }
}

.pulse-green {
  animation: pulseGreen 1s ease-in-out 3;
  border-color: #22c55e !important;
  color: #22c55e !important;
}
</style>
```

### 7.2 — Filtro por Zona de Cultivo

```vue
<!-- En TelemetryDashboard.vue — Selector de zona -->
<script setup lang="ts">
import { useIotStore } from '@/stores/iotStore';
const iotStore = useIotStore();

onMounted(() => iotStore.fetchZones());
</script>

<template>
  <div class="zone-filter">
    <ion-select 
      v-model="iotStore.selectedZoneId" 
      placeholder="Todos los invernaderos"
      interface="popover"
    >
      <ion-select-option 
        v-for="zone in iotStore.zones" 
        :key="zone.id" 
        :value="zone.id"
      >
        {{ zone.name }}
      </ion-select-option>
    </ion-select>
  </div>
</template>
```

---

## 🌐 8. SSE — Telemetría en Tiempo Real (`/api/iot/stream`)

### 8.1 — Composable `useTelemetrySSE.ts`

```typescript
// src/composables/useTelemetrySSE.ts
import { onMounted, onUnmounted } from 'vue';
import { useTelemetryStore } from '@/stores/telemetry';
import { useAuthStore } from '@/stores/auth';

export function useTelemetrySSE() {
  const telemetryStore = useTelemetryStore();
  const authStore = useAuthStore();
  let eventSource: EventSource | null = null;

  function connect() {
    const token = authStore.accessToken;
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    eventSource = new EventSource(`${baseUrl}/api/iot/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        telemetryStore.updateLatest(data);
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      console.warn('[SSE] Connection lost. Reconnecting in 5s...');
      eventSource?.close();
      setTimeout(connect, 5000);
    };
  }

  onMounted(connect);
  onUnmounted(() => eventSource?.close());

  return { connect };
}
```

> [!TIP]
> Usar `useTelemetrySSE()` en `TabsPage.vue` o en el componente raíz del Dashboard para que la conexión SSE persista mientras el usuario navega entre tabs.

---

## 📋 9. Checklist de Implementación

Orden recomendado de ejecución para minimizar regresiones:

### Fase 1 — Fundación (Sin riesgo de regresión)
- [x] Agregar nuevos tipos en `src/types/index.ts` (`AiAction`, `ChatResponse`, `Zone`, `ActuatorLogEntry`, `LoginCredentials`, `LoginResponse`)
- [x] Crear `src/composables/useActuatorBus.ts`
- [x] Crear `src/composables/useTelemetrySSE.ts`
- [x] Crear `src/stores/iotStore.ts`

### Fase 2 — Migración Auth (Alto impacto, revisar bien)
- [x] Refactorizar `src/stores/auth.ts` (eliminar Supabase SDK)
- [x] Actualizar Request Interceptor en `src/services/api.ts` (eliminar `supabase.auth.getSession()`)
- [x] Agregar handler HTTP 429 en Response Interceptor
- [x] Verificar que `LoginPage.vue` y `RegisterPage.vue` sigan funcionando

### Fase 3 — Chat Actions (Funcionalidad nueva)
- [x] Actualizar `chatService.sendMessage()` → tipo `ChatResponse`
- [x] Refactorizar `sendMessage()` en `conversationsStore.ts` para procesar `actions[]` y `alerts[]`
- [x] Integrar `useActuatorBus` en el componente de dashboard

### Fase 4 — Paginación & SSE (Mejoras UX)
- [x] Agregar `loadMoreMessages()` con Infinite Scroll en `TabChat.vue`
- [x] Integrar `useIotStore.fetchActuatorLogs()` con Infinite Scroll en el componente de logs
- [x] Integrar `useTelemetrySSE()` en `TabsPage.vue`

### Fase 5 — Zonas & UX
- [x] Integrar `iotStore.fetchZones()` con selector en `TelemetryDashboard.vue`
- [x] Implementar micro-animación `pulse-green` en actuadores del dashboard
- [x] QA: Verificar flujo completo Login → Chat → Dashboard → SSE

---

## 🔗 Referencias del Código Base

| Archivo | Ruta |
| :--- | :--- |
| API Client | `src/services/api.ts` |
| Auth Store | `src/stores/auth.ts` |
| Chat Store | `src/stores/conversationsStore.ts` |
| Telemetry Store | `src/stores/telemetry.ts` |
| System Store | `src/stores/system.ts` |
| IoT Store (nuevo) | `src/stores/iotStore.ts` |
| Tipos globales | `src/types/index.ts` |
| Chat View | `src/views/TabChat.vue` |
| System View | `src/views/TabSystem.vue` |
| Dashboard View | `src/views/TelemetryDashboard.vue` |

---

> [!IMPORTANT]
> **Prompt para el Asistente:**
> "Refactoriza los stores de Pinia y los componentes de UI siguiendo estrictamente las definiciones en `docs/FRONTEND_SYNC_PLAN.md`. Prioriza la migración de Supabase SDK a llamadas API nativas y asegura que el sistema de Chat procese el array de 'actions' correctamente."
