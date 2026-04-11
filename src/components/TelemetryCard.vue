<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  label: string;
  value: string | number;
  unit: string;
  icon: Component;
  color: string;
  progress: number;
}>();
</script>

<template>
  <div class="ag-card interactive p-4 flex flex-col">
    <div class="ag-flex-between mb-4">
      <div class="ag-flex-row gap-3">
        <div class="ag-icon-box" :class="`bg-${color}-soft text-${color}`">
          <component :is="icon" :size="18" />
        </div>
        <span class="text-xs font-semibold text-muted uppercase tracking-wide">{{ label }}</span>
      </div>
    </div>

    <div class="ag-flex-row items-baseline gap-1 mb-4 flex-grow">
      <span class="text-3xl font-bold">{{ value }}</span>
      <span class="text-sm font-medium text-muted uppercase">{{ unit }}</span>
    </div>

    <div class="progress-track">
      <div
        class="progress-fill"
        :class="`bg-${color}`"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.interactive { cursor: pointer; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-baseline { align-items: baseline; }
.flex-grow { flex-grow: 1; }

.progress-track {
  height: 6px;
  width: 100%;
  background-color: rgba(255,255,255,0.05);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--ag-border);
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 1s ease-out;
}

/* Color classes using CSS vars */
.bg-red { background-color: var(--ag-red); }
.bg-red-soft { background-color: rgba(239,68,68,0.1); }
.text-red { color: var(--ag-red); }

.bg-blue { background-color: var(--ag-blue); }
.bg-blue-soft { background-color: rgba(59,130,246,0.1); }
.text-blue { color: var(--ag-blue); }

.bg-purple { background-color: var(--ag-purple); }
.bg-purple-soft { background-color: rgba(139,92,246,0.1); }
.text-purple { color: var(--ag-purple); }

.bg-yellow { background-color: var(--ag-yellow); }
.bg-yellow-soft { background-color: rgba(245,158,11,0.1); }
.text-yellow { color: var(--ag-yellow); }

.bg-primary { background-color: var(--ag-primary); }
.bg-primary-soft { background-color: rgba(var(--ag-primary-rgb),0.1); }
.text-primary { color: var(--ag-primary); }
</style>
