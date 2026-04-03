---
description: Inicializar el frontend de AgroNexus AI
---

// turbo
1. Instalar Ionic CLI (si no existe):
   ```bash
   npm install -g @ionic/cli
   ```

2. Crear proyecto con una plantilla de pestañas (tabs) y Capacitor:
   ```bash
   ionic start agronexus-ui tabs --type=vue --capacitor
   ```

3. Instalar dependencias necesarias:
   ```bash
   npm install @supabase/supabase-js @capacitor/haptics chart.js vue-chartjs pinia
   ```

4. Configurar el cliente de Supabase (crear `src/supabase.js`).

5. Abrir el servidor de desarrollo:
   ```bash
   ionic serve
   ```
