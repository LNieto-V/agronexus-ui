# 🌾 AgroNexus AI - Frontend Dashboard

AgroNexus AI es una plataforma **SaaS tipo AgTech (Tecnología Agrícola)** premium y moderna. Su objetivo principal es ofrecer a granjeros e ingenieros agrícolas un control visual e interactivo de la telemetría, el estado del sistema y acceso a un Asistente Bot potenciado por Inteligencia Artificial, todo desde una interfaz unificada, fluida e intuitiva con un marcado diseño *glassmorphism*.

---

## 🚀 Características Principales

### 🔴 Dashboard en Tiempo Real
- Visualización de métricas críticas: **Temperatura, pH, EC (Electroconductividad)** y humedad.
- Sistema de salud centralizado con indicadores de estado de los nodos.

### 🤖 Asistente de IA Multi-Sesión
- **Gestión de Sesiones**: Crea, renombra y elimina múltiples conversaciones con persistencia en Supabase.
- **Interfaz Modal Responsiva**: Historial de chats accesible mediante un modal tipo "Sheet" moderno, eliminando el desorden de barras laterales secundarias.
- **Markdown Premium**: Soporte completo para renderizado de tablas, bloques de código y formato enriquecido con `marked` y `dompurify`.

### 🛡️ Seguridad y Hardware
- **Autenticación IoT**: Generación y gestión de API Keys (Read/Write) para microcontroladores (ESP32/Arduino).
- **Control de Modos**: Alterna entre modos *Eco*, *Intervencionista* y *Automático* con sincronización global.

---

## 🎨 Filosofía UI/UX: "AgTech Premium"

El frontend ha sido recientemente optimizado para una interacción más profesional y enfocada:

> [!TIP]
> **Navegación Simplificada**: Hemos eliminado la navegación inferior (tabs) y los menús dobles para centralizar todo en una **Sidebar Única**. En dispositivos móviles, esta barra se convierte en un panel lateral oculto dejando el 100% de la pantalla para el contenido.

- **Diseño Glassmorphism**: Uso extensivo de desenfoques, bordes sutiles y gradientes para una sensación de alta tecnología.
- **Single Source of Truth**: Acceso global al botón de "Cerrar Sesión" desde el sidebar y encabezados optimizados para respetar el *safe area* de los dispositivos móviles.

---

## 🛠️ Stack Tecnológico Core

- **Framework Web:** [Vue 3](https://vuejs.org/) (Composition API: `<script setup>`).
- **Framework UI / Mobile:** [Ionic Vue](https://ionicframework.com/docs/vue/overview).
- **Backend as a Service:** [Supabase](https://supabase.com/) (Auth, Real-time DB, Edge Functions).
- **Gestión de Estado:** [Pinia](https://pinia.vuejs.org/).
- **Visualización de Datos:** Chart.js.
- **Renderizado Markdown:** `marked` y `dompurify`.

---

## 🏗️ Arquitectura del Sistema

El frontend opera bajo un modelo **SPA (Single Page Application) State-Driven** estructurado en capas desacopladas:

### Capas y Patrones
1. **Capa de Servicios (`@/services`):** Aísla la lógica de red (Supabase/API). Facilita la migración de backend sin tocar la UI.
2. **Capa de Estado (`@/stores`):** Fuente única de verdad usando Pinia. Implementa persistencia automática y reactividad global.
3. **Composables Logic (`@/composables`):** Organiza la lógica de negocio reutilizable (Auth, System Controls, Telemetry Sync).
4. **Presentación Inteligente:** Distinción clara entre *Smart Components* (Views en `@/views`) y *Dumb Components* (UI reutilizable en `@/components`).

---

## 📂 Organización de Directorios

```text
src/
├── components/   # UI components reutilizables (Botones, Logs, Gráficos)
├── composables/  # Lógica extraída de las vistas (Estado de forms, watchers)
├── lib/          # Configuración de Supabase y utilidades puras
├── services/     # Llamadas a la API del Backend, LLM y Persistence Layer
├── stores/       # Estado global (Pinia). Autenticación, chat de la IA, Telemetría
├── theme/        # Sistema de diseño: variables CSS, AG-Design tokens
└── views/        # Páginas enrutables (Dashboard, Control, Chat, Home)
```

---

## 🚀 Instalación y Despliegue Local

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```
2. **Configurar Entorno (`.env`):**
   ```env
   VITE_SUPABASE_URL="tu-url"
   VITE_SUPABASE_ANON_KEY="tu-anon-key"
   ```
3. **Arrancar Desarrollo:**
   ```bash
   npm run dev
   ```

---

## 💡 Comandos Útiles
- `npm run build`: Genera el bundle de producción en `/dist`.
- `npx vue-tsc --noEmit`: Verificación estricta de tipos.
- `npx cap sync`: Sincroniza el código web con plataformas móviles nativas.

---

> [!IMPORTANT]
> Este proyecto sigue estándares de codificación estrictos de TypeScript y utiliza un sistema de **Design Tokens** personalizado definido en `/src/theme/variables.css`.
