# 📱 Prompt Maestro: Integración de Historial de Chat (Memoria Conversacional)

Este prompt está diseñado para inyectarse en una IA de desarrollo (como Cursor, Claude o Antigravity) con el objetivo de actualizar el frontend de AgroNexus UI (Ionic + Vue.js) y conectarlo con la memoria conversacional almacenada en Supabase a través del backend FastAPI.

---

### 🚀 Análisis y Contexto

**Situación actual:** 
El backend expone un nuevo endpoint (`GET /chat/history`) que devuelve el registro de la conversación en Supabase con el siguiente formato de respuesta:
```json
{
  "history": [
    {
      "id": "uuid",
      "role": "user" | "ai",
      "message": "Mensaje...",
      "created_at": "datetime"
    }
  ]
}
```

**Desajuste (Mismatch):** 
El estado local en Pinia (`src/stores/chat.ts`) emplea un contrato distinto: 
- Espera `content` en lugar de `message`.
- Espera `timestamp` en lugar de `created_at`.
- Para el rol de sistema, espera `assistant` en lugar de `ai`.

Además, la vista `Tab2Page.vue` (el AI Assistant) actualmente no pre-carga el historial previo almacenado cuando la vista es montada.

---

### 🛠️ Instrucciones de Implementación Técnica

Por favor, realiza las siguientes modificaciones línea por línea asegurando un estilo limpio:

**1. Actualización de `src/services/api.ts`**
- Localiza el objeto `chatService`.
- Añade el endpoint para obtener el historial: `getHistory: () => api.get('/chat/history'),`

**2. Actualización de `src/stores/chat.ts`**
- Asegúrate de tener la función `fetchHistory()` en el bloque de `actions`.
- Esta debe establecer `this.loading = true`, llamar a `chatService.getHistory()`, y manejar posibles excepciones (poniendo el store en error si falla).
- **Mapeo de datos (CRÍTICO)**: Itera sobre `response.data.history` mapeando cada iteración y actualizando la colección `this.messages`:
  - Mapear iteración `message` a propiedad `content`.
  - Mapear iteración `created_at` a propiedad `timestamp`.
  - Mapear iteración `role`. (Si es `'ai'`, debe formatearse obligatoriamente como `'assistant'`).

**3. Actualización de `src/views/Tab2Page.vue`**
- Localiza las importaciones estáticas de Vue (`ref`, `computed`, etc.). Si `onMounted` u `onIonViewDidEnter` no se importan, añádelos.
- Ejecuta `chatStore.fetchHistory()` dentro de `onMounted(...)`.
- (Opcional pero recomendado) Si la respuesta cuenta con un array de mensajes, el código en la plantilla ocultará la tarjeta de *Welcome Message* puesto que `messages.length > 0`. Asegúrate de que el ref de scrollView (`contentRef`) haga autoscroll hacia abajo en cuanto se reciban los datos históricos.
