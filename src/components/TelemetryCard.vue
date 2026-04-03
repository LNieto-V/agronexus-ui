<template>
  <div class="ag-glass-card telemetry-card p-4 overflow-hidden relative">
    <!-- Tech Grid Background Pattern -->
    <div class="tech-grid"></div>
    
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div :class="`icon-container bg-${color}-10 border border-${color}`">
            <ion-icon :icon="icon" :class="`text-xl text-${color}`" />
          </div>
          <span class="text-[10px] uppercase tracking-widest font-bold opacity-60">{{ label }}</span>
        </div>
        <div :class="`status-indicator bg-${color}`"></div>
      </div>
      
      <div class="flex items-baseline gap-1 mt-4">
        <span class="text-4xl font-black ag-neon-glow tracking-tighter" :style="`text-shadow: 0 0 20px rgba(var(--ag-${color}-rgb, var(--ag-neon-green-rgb)), 0.4)`">{{ value }}</span>
        <span class="text-xs font-bold opacity-40 uppercase">{{ unit }}</span>
      </div>
      
      <div class="mt-5">
        <div class="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-1000 ease-out"
            :class="`bg-${color}`"
            :style="{ width: `${progress}%`, boxShadow: `0 0 10px var(--ag-${color}, var(--ag-neon-green))` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';

defineProps<{
  label: string;
  value: string | number;
  unit: string;
  icon: string;
  color: string;
  progress: number;
}>();
</script>

<style scoped>
.telemetry-card {
  min-width: 140px;
  flex: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
}

.telemetry-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
}

.icon-container {
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.tech-grid {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  opacity: 0.5;
}

/* Color Overrides for dynamic shadows */
.text-neon-green { color: var(--ag-neon-green); }
.bg-neon-green { background-color: var(--ag-neon-green); }
.border-neon-green { border-color: rgba(var(--ag-neon-green-rgb), 0.3); }
.bg-neon-green-10 { background-color: rgba(var(--ag-neon-green-rgb), 0.1); }

.text-accent { color: var(--ag-accent); }
.bg-accent { background-color: var(--ag-accent); }
/* Add more as needed or use global utility mapping */
</style>

