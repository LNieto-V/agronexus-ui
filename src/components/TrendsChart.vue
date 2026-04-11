<script setup lang="ts">
import { computed } from 'vue';
import { BarChart2 } from 'lucide-vue-next';
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement,
  LinearScale, PointElement, CategoryScale, Filler, type ScriptableContext
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler);

const props = defineProps<{
  data: any[];
  label: string;
  color: string;
  unit: string;
  loading?: boolean;
}>();

const latestValue = computed(() => {
  if (!props.data || props.data.length === 0) return null;
  return props.data[props.data.length - 1].value;
});

const chartData = computed(() => ({
  labels: props.data.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
  datasets: [{
    label: props.label,
    data: props.data.map(d => d.value),
    borderColor: `rgb(${props.color})`,
    borderWidth: 2,
    pointRadius: 0,
    tension: 0.4,
    fill: true,
    backgroundColor: (context: ScriptableContext<'line'>) => {
      const bg = context.chart.ctx.createLinearGradient(0, 0, 0, 150);
      bg.addColorStop(0, `rgba(${props.color}, 0.15)`);
      bg.addColorStop(1, `rgba(${props.color}, 0)`);
      return bg;
    },
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#a1a1aa', font: { size: 10 } } },
    y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 10 } } }
  }
};
</script>

<template>
  <div class="ag-card p-4 chart-container hover-lift">
    <div class="ag-flex-between mb-4">
      <div class="ag-flex-col">
        <span class="text-xs font-semibold text-muted uppercase tracking-wide">{{ label }}</span>
        <div class="ag-flex-row items-baseline gap-1 mt-1">
          <span class="text-2xl font-bold" :style="{ color: `rgb(${color})` }">
            {{ latestValue ?? '--' }}
          </span>
          <span class="text-xs font-medium text-muted uppercase">{{ unit }}</span>
        </div>
      </div>
      <div class="ag-icon-box bg-card border">
        <BarChart2 :size="16" class="text-muted" />
      </div>
    </div>

    <div v-if="loading" class="chart-area chart-skeleton">
      <div class="skeleton-fill" />
    </div>
    <div v-else class="chart-area">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  height: 320px;
  display: flex;
  flex-direction: column;
}

.chart-area {
  flex-grow: 1;
  position: relative;
  width: 100%;
}

.chart-skeleton {
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 25%,
    rgba(255,255,255,0.07) 50%,
    rgba(255,255,255,0.03) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--ag-shadow-md);
}

.items-baseline { align-items: baseline; }
.border { border: 1px solid var(--ag-border); }
</style>
