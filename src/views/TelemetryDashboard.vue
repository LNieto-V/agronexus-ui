<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonIcon, IonMenuButton 
} from '@ionic/vue';
import { 
  thermometerOutline, waterOutline, flaskOutline, leafOutline, 
  refreshOutline, warningOutline, sunnyOutline 
} from 'ionicons/icons';
import { onMounted, computed, shallowRef } from 'vue';
import { useTelemetryStore } from '@/stores/telemetry';
import { useTelemetry } from '@/composables/useTelemetry';
import TelemetryCard from '@/components/TelemetryCard.vue';
import TrendsChart from '@/components/TrendsChart.vue';
import SkeletonCard from '@/components/SkeletonCard.vue';
import SegmentedControl from '@/components/SegmentedControl.vue';
import type { TelemetryKey } from '@/types';

const store = useTelemetryStore();
const { latest, loading, history } = useTelemetry();
const timeRange = shallowRef('5h');

const getChartHistory = (key: TelemetryKey) => {
  return history.value.map(h => ({
    timestamp: h.timestamp,
    value: h[key] as number
  }));
};

const hasAlerts = computed(() => {
  const ph = latest.value?.ph ?? 0;
  const temp = latest.value?.temperature ?? 0;
  return ph > 7.5 || ph < 5.5 || temp > 28;
});

const calcProgress = (val: number | undefined, min: number, max: number) => {
  if (val === undefined) return 0;
  return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
};

const refreshData = async () => {
  await Promise.all([store.fetchLatest(), store.fetchHistory()]);
};

onMounted(() => refreshData());
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4 py-2">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="font-bold text-lg">Telemetry Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData" shape="round">
            <ion-icon :icon="refreshOutline" :class="{ 'anim-spin': loading }" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="ag-container py-6">
        <!-- Header Section -->
        <div class="ag-flex-col md:ag-flex-row md:ag-flex-between gap-4 mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold tracking-tight mb-1">Overview</h2>
            <div class="ag-flex-row gap-2">
              <span class="status-dot bg-primary"></span>
              <p class="text-sm font-medium text-muted">System Online &bull; Live Sensors</p>
            </div>
          </div>
          <SegmentedControl v-model="timeRange" :options="['1h', '5h', '24h']" />
        </div>

        <!-- Telemetry Grid -->
        <div v-if="loading && history.length === 0" class="ag-grid sm:ag-grid-2 md:ag-grid-3 lg:ag-desktop-grid-5 mb-8">
          <SkeletonCard v-for="i in 5" :key="i" />
        </div>
        <div v-else class="ag-grid sm:ag-grid-2 md:ag-grid-3 lg:ag-desktop-grid-5 mb-8">
          <TelemetryCard label="Temperature" :value="latest?.temperature ?? '--'" unit="°C" :icon="thermometerOutline" color="red" :progress="calcProgress(latest?.temperature, 0, 40)" />
          <TelemetryCard label="Humidity" :value="latest?.humidity ?? '--'" unit="%" :icon="waterOutline" color="blue" :progress="latest?.humidity ?? 0" />
          <TelemetryCard label="pH Level" :value="latest?.ph ?? '--'" unit="pH" :icon="flaskOutline" color="purple" :progress="calcProgress(latest?.ph, 0, 14)" />
          <TelemetryCard label="EC (Nutrients)" :value="latest?.ec ?? '--'" unit="mS/cm" :icon="leafOutline" color="primary" :progress="calcProgress(latest?.ec, 0, 5)" />
          <TelemetryCard label="Light Intensity" :value="latest?.light ?? '--'" unit="lux" :icon="sunnyOutline" color="yellow" :progress="calcProgress(latest?.light, 0, 1000)" />
        </div>

        <!-- Trends Section -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold mb-4">Historical Analytics</h3>
          <div class="ag-grid ag-grid-1 md:ag-grid-2">
            <TrendsChart :data="getChartHistory('ec')" label="EC Trend" color="16, 185, 129" unit="mS/cm" :loading="loading && history.length === 0" />
            <TrendsChart :data="getChartHistory('ph')" label="Acidity Profile" color="139, 92, 246" unit="pH" :loading="loading && history.length === 0" />
            <TrendsChart :data="getChartHistory('temperature')" label="Temperature" color="239, 68, 68" unit="°C" :loading="loading && history.length === 0" />
            <TrendsChart :data="getChartHistory('humidity')" label="Humidity" color="59, 130, 246" unit="%" :loading="loading && history.length === 0" />
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="hasAlerts" class="ag-card ag-glass alert-card p-4 ag-flex-row gap-4">
          <div class="ag-icon-box bg-red-soft text-red">
            <ion-icon :icon="warningOutline" class="text-xl" />
          </div>
          <div>
            <p class="font-bold text-base">System Alert</p>
            <p class="text-sm text-muted mt-1">A metric threshold has been exceeded. Please review the AI Assistant logs for recommendations.</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.anim-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.alert-card {
  border-left: 4px solid var(--ag-red);
}
</style>
