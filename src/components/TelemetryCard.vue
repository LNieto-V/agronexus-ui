<template>
  <div class="ag-card interactive p-4 d-flex flex-col">
    <div class="ag-flex-between mb-4">
      <div class="ag-flex-row gap-3">
        <div class="ag-icon-box" :class="`bg-${color}-soft text-${color}`">
          <ion-icon :icon="icon" />
        </div>
        <span class="text-xs font-semibold text-muted uppercase tracking-wide">{{ label }}</span>
      </div>
    </div>
    
    <div class="ag-flex-row items-baseline gap-1 mb-4 flex-grow">
      <span class="text-3xl font-bold">{{ value }}</span>
      <span class="text-sm font-medium text-muted uppercase">{{ unit }}</span>
    </div>
    
    <div class="progress-track" :class="`border-${color}`">
      <div 
        class="progress-fill transition-all"
        :class="`bg-${color}`"
        :style="{ width: `${progress}%` }"
      ></div>
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
.interactive {
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.items-baseline { align-items: baseline; }
.flex-grow { flex-grow: 1; }

.progress-track {
  height: 6px;
  width: 100%;
  background-color: var(--ag-bg);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--ag-border);
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 1s ease-out;
}

.transition-all { transition: all 0.3s ease; }
</style>
