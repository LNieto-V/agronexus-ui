<template>
  <div class="ag-glass-card p-4 h-72 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--ag-neon-green-rgb),0.05)]">
    <div class="flex items-center justify-between mb-4 px-2">
      <div class="flex flex-col">
        <span class="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">{{ label }}</span>
        <div class="flex items-baseline gap-1">
          <span class="text-xl font-bold ag-neon-glow" :style="{ color: `rgb(${color})` }">
            {{ latestValue ?? '--' }}
          </span>
          <span class="text-[9px] opacity-30 font-medium">{{ unit }}</span>
        </div>
      </div>
      <div class="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
        <ion-icon :icon="statsChartOutline" class="text-sm" />
      </div>
    </div>

    <div v-if="loading" class="absolute inset-0 flex items-center justify-center p-8 mt-12">
      <ion-skeleton-text animated style="width: 100%; height: 100%; border-radius: 12px;"></ion-skeleton-text>
    </div>
    <div v-else class="h-44 w-full">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonSkeletonText, IonIcon } from '@ionic/vue';
import { statsChartOutline } from 'ionicons/icons';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler,
  ScriptableContext
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler
);

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
  datasets: [
    {
      label: props.label,
      data: props.data.map(d => d.value),
      borderColor: `rgb(${props.color})`,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: `rgb(${props.color})`,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      tension: 0.45,
      fill: true,
      backgroundColor: (context: ScriptableContext<'line'>) => {
        const bg = context.chart.ctx.createLinearGradient(0, 0, 0, 200);
        bg.addColorStop(0, `rgba(${props.color}, 0.25)`);
        bg.addColorStop(1, `rgba(${props.color}, 0)`);
        return bg;
      },
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: 'rgba(255, 255, 255, 0.6)',
      titleFont: { size: 10, weight: 'bold' as const },
      bodyColor: '#fff',
      bodyFont: { size: 12, weight: 'bold' as const },
      padding: 12,
      cornerRadius: 12,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        label: (context: any) => ` ${context.parsed.y} ${props.unit}`
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: { display: false },
      ticks: { 
        color: 'rgba(255, 255, 255, 0.2)', 
        font: { size: 9 },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 5
      }
    },
    y: {
      display: true,
      grid: { color: 'rgba(255, 255, 255, 0.03)', drawTicks: false },
      border: { display: false },
      ticks: { 
        color: 'rgba(255, 255, 255, 0.2)', 
        font: { size: 9 },
        padding: 10
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  animation: {
    duration: 1200,
    easing: 'easeOutQuart' as const
  }
};
</script>

<style scoped>
.h-72 { height: 18rem; }
.h-44 { height: 11rem; }
.p-4 { padding: 1rem; }
.p-8 { padding: 2rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-12 { margin-top: 3rem; }
.z-10 { z-index: 10; }
</style>
