<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="ag-neon-glow font-bold text-xl ion-hide-md-up">AgroNexus AI</ion-title>
        <ion-title class="font-bold text-lg ion-hide-md-down">Telemetry Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refreshOutline" :class="{ 'anim-spin': loading }" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="dashboard-container">
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 class="text-3xl font-black mb-1 tracking-tight">Dashboard</h2>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
              <p class="text-[10px] uppercase tracking-widest font-bold opacity-40">System Active • Real-time Monitoring</p>
            </div>
          </div>
          <SegmentedControl 
            v-model="timeRange" 
            :options="['1h', '5h', '24h']" 
          />
        </div>

        <!-- Telemetry Grid (Highlights) -->
        <div v-if="loading && history.length === 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <SkeletonCard v-for="i in 5" :key="i" />
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <TelemetryCard 
            label="Temperature"
            :value="latest?.temperature ?? '--'"
            unit="°C"
            :icon="thermometerOutline"
            color="red-400"
            :progress="calcProgress(latest?.temperature, 0, 40)"
          />
          <TelemetryCard 
            label="Humidity"
            :value="latest?.humidity ?? '--'"
            unit="%"
            :icon="waterOutline"
            color="accent"
            :progress="latest?.humidity ?? 0"
          />
          <TelemetryCard 
            label="pH Level"
            :value="latest?.ph ?? '--'"
            unit="pH"
            :icon="flaskOutline"
            color="purple-400"
            :progress="calcProgress(latest?.ph, 0, 14)"
          />
          <TelemetryCard 
            label="EC (Nutrients)"
            :value="latest?.ec ?? '--'"
            unit="mS/cm"
            :icon="leafOutline"
            color="neon-green"
            :progress="calcProgress(latest?.ec, 0, 5)"
          />
          <TelemetryCard 
            label="Light Intensity"
            :value="latest?.light ?? '--'"
            unit="lux"
            :icon="sunnyOutline"
            color="yellow-400"
            :progress="calcProgress(latest?.light, 0, 1000)"
          />
        </div>

        <!-- Trends Section (Detailed Charts) -->
        <div class="mb-6">
          <h3 class="text-sm font-bold uppercase tracking-widest opacity-40 mb-4 px-2">Historical Analytics</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            <!-- EC Trend -->
            <TrendsChart 
              :data="getChartHistory('ec')"
              label="EC Trend (Nutrients)"
              color="46, 204, 113"
              unit="mS/cm"
              :loading="loading && history.length === 0"
            />
            
            <!-- pH Trend -->
            <TrendsChart 
              :data="getChartHistory('ph')"
              label="Acidity Profile (pH)"
              color="162, 155, 254"
              unit="pH"
              :loading="loading && history.length === 0"
            />

            <!-- Temperature Trend -->
            <TrendsChart 
              :data="getChartHistory('temperature')"
              label="Atmospheric Temperature"
              color="255, 118, 117"
              unit="°C"
              :loading="loading && history.length === 0"
            />

            <!-- Humidity Trend -->
            <TrendsChart 
              :data="getChartHistory('humidity')"
              label="Relative Humidity"
              color="52, 152, 219"
              unit="%"
              :loading="loading && history.length === 0"
            />
          </div>
        </div>

        <!-- Alerts Section -->
        <div v-if="hasAlerts" class="ag-glass-card p-4 border-l-4 border-red-500 mb-8 animate-pulse">
          <div class="flex items-center gap-3">
            <ion-icon :icon="warningOutline" class="text-red-500 text-xl" />
            <div>
              <p class="font-bold text-sm">System Alert</p>
              <p class="text-xs opacity-70">Metric threshold exceeded. Checking AI Expert logs...</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonIcon, IonMenuButton 
} from '@ionic/vue';
import { 
  thermometerOutline, waterOutline, flaskOutline, leafOutline, 
  refreshOutline, warningOutline, sunnyOutline 
} from 'ionicons/icons';
import { onMounted, computed, ref } from 'vue';
import { useTelemetryStore } from '@/stores/telemetry';
import { useTelemetry } from '@/composables/useTelemetry';
import TelemetryCard from '@/components/TelemetryCard.vue';
import TrendsChart from '@/components/TrendsChart.vue';
import SkeletonCard from '@/components/SkeletonCard.vue';
import SegmentedControl from '@/components/SegmentedControl.vue';

const store = useTelemetryStore();
const { latest, loading, history } = useTelemetry();
const timeRange = ref('5h');

const getChartHistory = (key: string) => {
  return history.value.map(h => ({
    timestamp: h.timestamp,
    value: (h as any)[key]
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
  await Promise.all([
    store.fetchLatest(),
    store.fetchHistory()
  ]);
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.premium-toolbar {
  --background: #0f172a;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Custom Grid Utilities for Responsive Analytics */
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.pb-8 { padding-bottom: 2rem; }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}

.anim-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.border-l-4 { border-left-width: 4px; }
.border-red-500 { border-color: #ef4444; }
.text-red-500 { color: #ef4444; }

.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
