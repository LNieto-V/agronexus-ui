# 🛠️ Skill: AgTech Frontend Expert

Esta habilidad permite al asistente generar componentes de alta calidad visual y funcional para el proyecto AgroNexus AI.

## 🧬 Component Generation Patterns

### 1. Glassmorphism Card
Siempre usar la siguiente base para tarjetas del Dashboard:
```vue
<template>
  <ion-card class="glass-card">
    <ion-card-header>
      <ion-icon :icon="icon" color="primary"></ion-icon>
      <ion-card-title>{{ title }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <div class="value">{{ value }} units</div>
      <div :class="['status', statusColor]">{{ statusText }}</div>
    </ion-card-content>
  </ion-card>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
</style>
```

### 2. Supabase Realtime Hook
Patrón de composable para telemetría:
```javascript
import { supabase } from '../supabase';
import { ref, onMounted, onUnmounted } from 'vue';

export function useTelemetry() {
  const latestData = ref(null);

  const channel = supabase
    .channel('telemetry_changes')
    .on('postgres_changes', { event: 'INSERT', table: 'telemetry' }, payload => {
      latestData.value = payload.new;
    })
    .subscribe();

  onUnmounted(() => supabase.removeChannel(channel));

  return { latestData };
}
```

### 3. Haptic Integration
```javascript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const triggerHaptic = async () => {
  await Haptics.impact({ style: ImpactStyle.Light });
};
```
