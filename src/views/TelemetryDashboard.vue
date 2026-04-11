<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useTelemetryStore } from '@/stores/telemetry';
import { useIotStore } from '@/stores/iotStore';
import { BarChart2, RefreshCw, Download, Droplets, Thermometer, Zap, Wind } from 'lucide-vue-next';
import TelemetryCard from '@/components/TelemetryCard.vue';
import TrendsChart from '@/components/TrendsChart.vue';
import SkeletonCard from '@/components/SkeletonCard.vue';
import SegmentedControl from '@/components/SegmentedControl.vue';
import AppSelect from '@/components/AppSelect.vue';
import AppSpinner from '@/components/AppSpinner.vue';

const telemetryStore = useTelemetryStore();
const iotStore = useIotStore();

const chartView = ref('Temperatura');
const chartOptions = ['Temperatura', 'Humedad', 'pH', 'EC', 'CO₂'];

onMounted(() => {
  telemetryStore.fetchLatest(iotStore.selectedZoneId);
  telemetryStore.fetchHistory(iotStore.selectedZoneId);
  iotStore.fetchZones();
});

watch(() => iotStore.selectedZoneId, () => {
  telemetryStore.fetchLatest(iotStore.selectedZoneId);
  telemetryStore.fetchHistory(iotStore.selectedZoneId);
});

const cards = computed(() => {
  const d = telemetryStore.latest;
  if (!d) return [];
  return [
    {
      label: 'Temperature', value: d.temperature ?? '--', unit: '°C',
      icon: Thermometer, color: 'red',
      progress: d.temperature ? Math.min((d.temperature / 40) * 100, 100) : 0
    },
    {
      label: 'Humidity', value: d.humidity ?? '--', unit: '%',
      icon: Droplets, color: 'blue',
      progress: d.humidity ?? 0
    },
    {
      label: 'pH Level', value: d.ph ?? '--', unit: 'pH',
      icon: BarChart2, color: 'purple',
      progress: d.ph ? (d.ph / 14) * 100 : 0
    },
    {
      label: 'Conductivity', value: d.ec ?? '--', unit: 'mS/cm',
      icon: Zap, color: 'yellow',
      progress: d.ec ? Math.min((d.ec / 4) * 100, 100) : 0
    },
    {
      label: 'CO₂', value: d.co2 ?? '--', unit: 'ppm',
      icon: Wind, color: 'primary',
      progress: d.co2 ? Math.min((d.co2 / 2000) * 100, 100) : 0
    },
  ];
});

const chartData = computed(() => {
  const h = telemetryStore.history;
  if (!h || h.length === 0) return [];
  const map: Record<string, keyof typeof h[0]> = {
    'Temperatura': 'temperature',
    'Humedad': 'humidity',
    'pH': 'ph',
    'EC': 'ec',
    'CO₂': 'co2',
  };
  const key = map[chartView.value] as string;
  return h.map((d: any) => ({ timestamp: d.timestamp, value: d[key] }));
});

const chartColorMap: Record<string, string> = {
  'Temperatura': '239, 68, 68',
  'Humedad': '59, 130, 246',
  'pH': '139, 92, 246',
  'EC': '245, 158, 11',
  'CO₂': '16, 185, 129',
};

const chartUnit: Record<string, string> = {
  'Temperatura': '°C', 'Humedad': '%', 'pH': 'pH',
  'EC': 'mS/cm', 'CO₂': 'ppm',
};

async function refreshData() {
  await Promise.all([
    telemetryStore.fetchLatest(iotStore.selectedZoneId),
    telemetryStore.fetchHistory(iotStore.selectedZoneId),
  ]);
}

async function exportHistory() {
  try {
    const { dashboardService } = await import('@/services/api');
    const response = await dashboardService.exportHistory();
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agronexus_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export failed', err);
  }
}
</script>

<template>
  <div class="page-scroll">
    <div class="ag-container py-6 md:py-10">

      <!-- Header -->
      <div class="page-header mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Live Telemetry</h1>
          <p class="text-muted mt-1 text-sm md:text-base">Real-time greenhouse sensor data</p>
        </div>
        <div class="ag-flex-row gap-3">
          <AppSelect
            v-model="iotStore.selectedZoneId"
            :options="[{ value: null, label: 'All Zones' }, ...iotStore.zones.map(z => ({ value: z.id, label: z.name }))]"
            placeholder="All Zones"
            class="zone-select"
          />
          <button id="refresh-data-btn" class="icon-btn" @click="refreshData" title="Refresh">
            <RefreshCw :size="18" :class="{ 'spin': telemetryStore.loading }" />
          </button>
          <button id="export-data-btn" class="icon-btn" @click="exportHistory" title="Export CSV">
            <Download :size="18" />
          </button>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="cards-loading" v-if="telemetryStore.loading && !telemetryStore.latest">
        <SkeletonCard v-for="i in 5" :key="i" />
      </div>

      <div v-else class="metrics-grid mb-10">
        <TelemetryCard
          v-for="card in cards"
          :key="card.label"
          :label="card.label"
          :value="card.value"
          :unit="card.unit"
          :icon="card.icon"
          :color="card.color"
          :progress="card.progress"
        />
      </div>

      <!-- Chart Section -->
      <div class="chart-section">
        <div class="ag-flex-between mb-6 flex-wrap gap-4">
          <div>
            <h2 class="font-bold text-lg">Trend Analysis</h2>
            <p class="text-xs text-muted mt-1">Historical data over time</p>
          </div>
          <SegmentedControl
            :options="chartOptions"
            v-model="chartView"
          />
        </div>

        <TrendsChart
          :data="chartData"
          :label="chartView"
          :color="chartColorMap[chartView]"
          :unit="chartUnit[chartView]"
          :loading="telemetryStore.loading && telemetryStore.history.length === 0"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.page-scroll {
  height: 100%;
  overflow-y: auto;
  background: var(--ag-bg);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.zone-select { min-width: 160px; }

.icon-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--ag-border);
  border-radius: 10px;
  color: var(--ag-text-muted);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-btn:hover { background: rgba(255,255,255,0.08); color: var(--ag-text); }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.cards-loading {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .metrics-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(5, 1fr); }
}

.chart-section { margin-bottom: 2rem; }
.flex-wrap { flex-wrap: wrap; }
</style>
