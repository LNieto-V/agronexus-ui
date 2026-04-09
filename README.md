# 🌾 AgroNexus AI - Frontend AgTech Dashboard

AgroNexus AI es una plataforma **SaaS tipo AgTech (Tecnología Agrícola)** premium y moderna diseñada para el control total de infraestructuras de cultivo inteligente. Basada en una arquitectura de microservicios y diseño *glassmorphism*, ofrece una experiencia fluida tanto en web como en dispositivos móviles.

---

## 🚀 Características Principales

### 🌿 Gestión de Infraestructura por Zonas (NUEVO)
- **Control Granular**: Organiza tu invernadero por zonas (ej: Invernadero Beta, Zona Hidropónica 1).
- **CRUD Completo**: Crea, edita y elimina zonas de cultivo directamente desde el Dashboard.
- **Filtrado Inteligente**: Visualiza telemetría y logs de actuadores de forma global o filtrada por una zona específica.

### 🔴 Dashboard con Telemetría en Tiempo Real
- **Métricas Críticas**: Monitoreo de Temperatura, Humedad, pH, EC (Electroconductividad) e Intensidad Lumínica.
- **Gráficos de Tendencias**: Visualización histórica mediante Chart.js para análisis de ciclos de cultivo.
- **Integración SSE**: Telemetría en tiempo real mediante *Server-Sent Events* para una latencia mínima.

### 🤖 Asistente de IA (Brain Orchestrator)
- **Gestión de Sesiones**: Sistema multi-sesión para consultas técnicas agrícolas.
- **Control de Actuadores**: La IA puede sugerir o ejecutar comandos basados en anomalías detectadas.
- **Markdown Premium**: Soporte completo para tablas técnicas, alertas y bloques de código.

### 🛡️ Seguridad y Provisionamiento de Hardware
- **Modelos de Seguridad Per-Zona**: Las API Keys de escritura (`Write`) están estrictamente vinculadas a una zona para evitar riesgos de seguridad global.
- **Llaves de Lectura Global**: Posibilidad de generar llaves `Read-Only` generales para dashboards de monitoreo centralizado.
- **Cifrado SHA-256**: Todas las llaves se hashean en el backend y solo se muestran una vez al usuario.

---

## 🎨 Filosofía UI/UX: "AgTech Premium"

El frontend utiliza un sistema de diseño propio basado en **Ionic + Vue 3** con un enfoque en la legibilidad y la estética de alta tecnología:

- **Diseño Glassmorphism**: Uso de capas translúcidas, desenfoques y bordes neón sutiles.
- **Navegación Dinámica**: Sidebar retráctil que se convierte en panel lateral en móviles, optimizando el espacio de visualización de datos.
- **Reactividad de Sesión**: Redirección automática al `/login` y limpieza de estado en caso de expiración de sesión (401 Unauthorized).

---

## 🛠️ Stack Tecnológico

- **Core Framework:** [Vue 3](https://vuejs.org/) (Composition API).
- **UI Framework:** [Ionic Vue](https://ionicframework.com/docs/vue/overview) (Mobile-ready).
- **Backend Communication:** Axios (DDD-Lite Architecture).
- **Gestión de Estado:** [Pinia](https://pinia.vuejs.org/) (Persistencia asíncrona).
- **Visualización:** Chart.js + CSS Custom Properties para temas dinámicos.

---

## 🏗️ Estructura del Proyecto

```text
src/
├── components/   # UI components (ZoneManager, ApiSecurityPanel, TelemetryCard)
├── composables/  # Lógica reutilizable (useTelemetry, useActuatorBus)
├── services/     # Clientes de API (Axios singleton, Interceptores de Auth)
├── stores/       # Estado global (Auth, IoT, Telemetría, Chat)
├── theme/        # AG-Design Tokens y variables CSS
└── views/        # Dashboards, Control de Sistema, IA Assistant
```

---

## 🚀 Instalación y Configuración

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```
2. **Configurar Entorno (`.env`):**
   ```env
   # URL base de la API FastAPI (DDD-Lite)
   VITE_API_BASE_URL="http://127.0.0.1:8000/api"
   
   # Opcional: URL de Supabase para Auth directo (Legacy support)
   VITE_SUPABASE_URL="tu-url"
   VITE_SUPABASE_ANON_KEY="tu-key"
   ```
3. **Arrancar modo desarrollo:**
   ```bash
   npm run dev
   ```

---

## 💡 Flujo de Trabajo con Zonas y Hardware

1. **Crear Zona**: Ve a `Control de Sistema` -> `Infrastructure Manager` y añade tu primera zona.
2. **Generar Key**: Selecciona la zona en el selector superior y genera una `Write Key`.
3. **Hardware Config**: Configura tu ESP32 con la llave generada y el endpoint de telemetría.
4. **Validación**: El backend rechazará cualquier telemetría que no coincida con el `zone_id` de la llave.

---

> [!IMPORTANT]
> Este proyecto ha migrado de un modelo directo de base de datos a un modelo gobernado por API (FastAPI). No utilices el SDK de Supabase directamente en los componentes; usa siempre los servicios en `src/services/api.ts`.
