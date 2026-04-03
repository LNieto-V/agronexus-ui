# 📜 AgroNexus AI Frontend Development Rules

Este documento define los estándares de calidad y desarrollo para el frontend de AgroNexus AI.

## 🎨 Design & Aesthetics (Premium)
1. **Glassmorphism**: Todos los paneles y tarjetas deben usar fondos translúcidos (`backdrop-filter: blur()`) con bordes sutiles y sombras profundas.
2. **Color Palette**:
   - Primary: `#2ecc71` (Neon Green)
   - Secondary: Azul Cobalto profundo para fondos y acentos.
   - Dark Mode: Obligatorio por defecto.
3. **Typography**: Usar únicamente **Inter** u **Outfit**.
4. **Micro-interactions**: Todo cambio de estado (carga, éxito, error) debe tener una transición suave o una animación discreta. No usar placeholders estáticos; usar **Skeleton Screens**.

## 🔋 Technology Stack
- **Framework**: Ionic + Vue.js 3 (Composition API).
- **State Management**: Pinia.
- **Backend/DB**: Supabase (Realtime enabled).
- **Icons**: Ionicons (Outline style).
- **Charts**: Chart.js.

## 🛠️ Implementation Rules
1. **Supabase First**: Priorizar la suscripción a canales de tiempo real sobre las consultas HTTP periódicas.
2. **Mobile Native**: Todo componente interactivo de control IoT debe disparar el plugin `Haptics` de Capacitor (`impactLight` o `selectionChanged`).
3. **Markdown Rendering**: El chat debe usar una librería robusta para renderizar Markdown (tablas, código, negritas).
4. **Error Handling**: Implementar estados de "desconectado" visualmente atractivos que expliquen por qué no hay datos en tiempo real.

## 🚀 Performance
- Optimizar la renderización de gráficos para evitar saltos al recibir telemetría.
- Lazy load de vistas pesadas (Analytics).
