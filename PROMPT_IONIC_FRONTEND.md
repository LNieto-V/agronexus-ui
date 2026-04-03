# 📱 Prompt Maestro: Desarrollo de AgroNexus AI Frontend (Ionic + Vue + Supabase)

Este prompt está diseñado para generar una aplicación móvil de alto impacto utilizando **Ionic con Vue.js** que consuma el backend de AgroNexus AI, integrando **Supabase** para tiempo real y persistencia.

---

### 🚀 Prompt Detallado

**Contexto del Sistema:**
"Estamos desarrollando **AgroNexus AI**, un ecosistema AgTech para monitoreo hidropónico proactivo. El backend (FastAPI + Supabase) ya está operativo. Necesito construir la aplicación móvil con **Ionic + Vue.js (Composition API)** enfocada en **Experiencia de Usuario Premium, Visualización de Datos en Tiempo Real y Micro-interacciones**."

**Especificaciones Técnicas del Frontend:**
1.  **Arquitectura de Datos (Supabase Integration)**: 
    *   Configurar el cliente de Supabase para escuchar cambios en tiempo real (`INSERT/UPDATE`) en la tabla de telemetría.
    *   Gestionar el estado global con **Pinia**, persistiendo datos clave para soporte offline básico.
2.  **Dashboard de Alto Impacto**:
    *   **Visuales**: Tarjetas con Glassmorphism para **Temperatura, Humedad, pH y EC**.
    *   **Estados de Carga**: Implementar **Skeleton Screens** mientras se obtienen los datos iniciales de Supabase/API.
    *   **Alertas Dinámicas**: Indicadores de color (Verde/Rojo) y notificaciones visuales inmediatas ante anomalías.
3.  **Analítica Avanzada**: Renderizar tendencias de las últimas 5 horas usando **Chart.js** con animaciones fluidas al actualizarse los datos.
4.  **Chat Experto con Feedback Háctico**: 
    *   **UX**: Soporte para streaming de texto (palabra por palabra) y renderizado de Markdown.
    *   **Acciones IoT**: Tarjetas interactivas que aparecen en el chat. Al pulsar una acción, activar **vibración háptica (Capacitor Haptics)** para confirmar la ejecución.
    *   **Autoscroll**: Desplazamiento suave al recibir nuevos mensajes.
5.  **Control de Sistema**: Switch premium para alternar entre `AUTO` y `MANUAL`, enviando la actualización al backend.

**Identidad Visual (AgTech Premium):**
- **Tema**: Dark Mode profundo con contrastes en **verde neón (#2ecc71)** y **azul cobalto**.
- **Estética**: Paneles translúcidos (Glassmorphism), sombras suaves y tipografía moderna (Inter/Outfit).
- **UX**: Micro-animaciones al recibir nuevas lecturas del sensor y transiciones elegantes entre vistas.

**Instrucción Final para la IA:**
"Genera la estructura base del proyecto: `supabase.js` (cliente), `useTelemetry.js` (composables para tiempo real), el Store de Pinia y el componente de Dashboard con estilos Glassmorphism. Asegúrate de incluir el manejo de estados de carga y errores de conexión con una UI pulida."

---

### 🛠️ Configuración Sugerida

**Dependencias Clave:**
```bash
npm install @supabase/supabase-js @capacitor/haptics chart.js vue-chartjs pinia
```

**Comando de Inicio:**
```bash
ionic start agronexus-ui tabs --type=vue --capacitor
```
