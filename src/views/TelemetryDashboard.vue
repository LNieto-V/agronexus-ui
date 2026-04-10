<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonMenuButton,
  IonSelect, IonSelectOption, IonModal, IonList,
  IonItem, IonLabel, IonRadioGroup, IonRadio, IonFooter
} from '@ionic/vue';
import { 
  thermometerOutline, waterOutline, flaskOutline, leafOutline, 
  refreshOutline, warningOutline, sunnyOutline, downloadOutline,
  sparklesOutline, documentTextOutline, closeOutline, checkmarkOutline
} from 'ionicons/icons';
import { onMounted, computed, shallowRef, watch } from 'vue';
import { useTelemetryStore } from '@/stores/telemetry';
import { useTelemetry } from '@/composables/useTelemetry';
import TelemetryCard from '@/components/TelemetryCard.vue';
import TrendsChart from '@/components/TrendsChart.vue';
import SkeletonCard from '@/components/SkeletonCard.vue';
import SegmentedControl from '@/components/SegmentedControl.vue';
import { useIotStore } from '@/stores/iotStore';
import { useConversationsStore } from '@/stores/conversationsStore';
import { useRouter } from 'vue-router';
import { dashboardService } from '@/services/api';
import { toastController } from '@ionic/vue';
import { useActuatorBus } from '@/composables/useActuatorBus';
import type { TelemetryKey } from '@/types';

const store = useTelemetryStore();
const iotStore = useIotStore();
const chatStore = useConversationsStore();
const router = useRouter();
const { latest, loading, history } = useTelemetry();
const { pendingActions } = useActuatorBus();
const timeRange = shallowRef('5h');
const isExporting = shallowRef(false);
const isGeneratingReport = shallowRef(false);
const isReportModalOpen = shallowRef(false);

const reportOptions = shallowRef({
  timeRange: '24',
  focus: 'general'
});

const isBombaActive = computed(() =>
  pendingActions.value.some(a => (a.device === 'BOMBA' || a.device === 'WATER') && a.action === 'ON')
);

const isVentiladorActive = computed(() =>
  pendingActions.value.some(a => (a.device === 'VENTILADOR' || a.device === 'FAN') && a.action === 'ON')
);

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
  await Promise.all([
    store.fetchLatest(iotStore.selectedZoneId), 
    store.fetchHistory(iotStore.selectedZoneId)
  ]);
};

async function handleExport() {
  isExporting.value = true;
  try {
    const response = await dashboardService.exportHistory();
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agronexus_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const toast = await toastController.create({
      message: 'Download started successfully',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (error) {
    const toast = await toastController.create({
      message: 'Export failed. Please try again.',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    isExporting.value = false;
  }
}

async function generateAIReport() {
  isGeneratingReport.value = true;
  isReportModalOpen.value = false;
  
  try {
    const response = await dashboardService.getAiReportPdf(
      iotStore.selectedZoneId,
      parseInt(reportOptions.value.timeRange),
      reportOptions.value.focus
    );
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `informe_salud_${new Date().toISOString().slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const toast = await toastController.create({
      message: 'Informe PDF generado con éxito',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (error) {
    console.error('Error generating AI PDF:', error);
    const toast = await toastController.create({
      message: 'Error al generar el PDF. Verifica tu conexión.',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    isGeneratingReport.value = false;
  }
}

watch(() => iotStore.selectedZoneId, () => {
  refreshData();
});

onMounted(() => {
  refreshData();
  iotStore.fetchZones();
});
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
            <div class="actuators-status ag-flex-row gap-3 mt-3">
              <div class="actuator-badge" :class="{ 'pulse-green': isBombaActive }">
                <ion-icon :icon="waterOutline" />
                <span>Pump</span>
              </div>
              <div class="actuator-badge" :class="{ 'pulse-green': isVentiladorActive }">
                <ion-icon :icon="leafOutline" />
                <span>Fan</span>
              </div>
            </div>
          </div>
          <div class="ag-flex-row gap-4">
            <div class="zone-selector-wrapper">
              <ion-select 
                v-model="iotStore.selectedZoneId" 
                placeholder="All Greenhouse Zones"
                interface="popover"
                class="premium-select"
              >
                <ion-select-option :value="null">All Greenhouse Zones</ion-select-option>
                <ion-select-option 
                  v-for="zone in iotStore.zones" 
                  :key="zone.id" 
                  :value="zone.id"
                >
                  {{ zone.name }}
                </ion-select-option>
              </ion-select>
            </div>
            <SegmentedControl v-model="timeRange" :options="['1h', '5h', '24h']" />
          </div>
        </div>

        <!-- Environmental Section -->
        <div class="section-container mb-8">
          <h3 class="section-title text-sm font-bold uppercase tracking-wider text-muted mb-4 ag-flex-row gap-2">
            <ion-icon :icon="leafOutline" class="text-primary" />
            Environmental Clima
          </h3>
          <div v-if="loading && !latest" class="ag-grid sm:ag-grid-2 md:ag-grid-4 lg:ag-desktop-grid-6">
            <SkeletonCard v-for="i in 4" :key="i" />
          </div>
          <div v-else class="ag-grid sm:ag-grid-2 md:ag-grid-4 lg:ag-desktop-grid-6" :class="{ 'refreshing': loading }">
            <TelemetryCard label="Air Temp" :value="latest?.temperature ?? '--'" unit="°C" :icon="thermometerOutline" color="red" :progress="calcProgress(latest?.temperature, 0, 40)" />
            <TelemetryCard label="Air Humidity" :value="latest?.humidity ?? '--'" unit="%" :icon="waterOutline" color="blue" :progress="latest?.humidity ?? 0" />
            <TelemetryCard v-if="latest?.vpd !== undefined" label="VPD (Health)" :value="latest?.vpd" unit="kPa" :icon="flaskOutline" :color="latest?.vpd > 1.2 ? 'red' : (latest?.vpd > 0.8 ? 'yellow' : 'primary')" :progress="calcProgress(latest?.vpd, 0, 2)" />
            <TelemetryCard v-if="latest?.co2 !== undefined" label="CO2 Level" :value="latest?.co2" unit="ppm" :icon="leafOutline" color="primary" :progress="calcProgress(latest?.co2, 400, 1500)" />
            <TelemetryCard label="Light" :value="latest?.light ?? '--'" unit="lux" :icon="sunnyOutline" color="yellow" :progress="calcProgress(latest?.light, 0, 1000)" />
          </div>
        </div>

        <!-- Substrate Section -->
        <div v-if="latest?.soil_temperature !== undefined || latest?.soil_moisture !== undefined || latest?.ph || latest?.ec" class="section-container mb-8">
          <h3 class="section-title text-sm font-bold uppercase tracking-wider text-muted mb-4 ag-flex-row gap-2">
            <ion-icon :icon="thermometerOutline" class="text-primary" />
            Soil & Substrate
          </h3>
          <div class="ag-grid sm:ag-grid-2 md:ag-grid-4" :class="{ 'refreshing': loading }">
            <TelemetryCard v-if="latest?.soil_temperature !== undefined" label="Soil Temp" :value="latest?.soil_temperature" unit="°C" :icon="thermometerOutline" color="orange" :progress="calcProgress(latest?.soil_temperature, 0, 40)" />
            <TelemetryCard v-if="latest?.soil_moisture !== undefined" label="Soil Moisture" :value="latest?.soil_moisture" unit="%" :icon="waterOutline" color="blue" :progress="latest?.soil_moisture" />
            <TelemetryCard label="pH Level" :value="latest?.ph ?? '--'" unit="pH" :icon="flaskOutline" color="purple" :progress="calcProgress(latest?.ph, 0, 14)" />
            <TelemetryCard label="EC Nutrients" :value="latest?.ec ?? '--'" unit="mS/cm" :icon="leafOutline" color="primary" :progress="calcProgress(latest?.ec, 0, 5)" />
          </div>
        </div>

        <!-- Resources Section -->
        <div v-if="latest?.tank_level !== undefined" class="section-container mb-8">
          <h3 class="section-title text-sm font-bold uppercase tracking-wider text-muted mb-4 ag-flex-row gap-2">
            <ion-icon :icon="waterOutline" class="text-primary" />
            Infrastructure Resources
          </h3>
          <div class="ag-grid sm:ag-grid-2 md:ag-grid-4" :class="{ 'refreshing': loading }">
            <TelemetryCard v-if="latest?.tank_level !== undefined" label="Tank Level" :value="latest?.tank_level" unit="%" :icon="waterOutline" :color="latest?.tank_level < 20 ? 'red' : 'blue'" :progress="latest?.tank_level" />
          </div>
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

        <!-- Reports & Analytics Section -->
        <div class="section-container mb-12">
          <h3 class="section-title text-sm font-bold uppercase tracking-wider text-muted mb-4 ag-flex-row gap-2">
            <ion-icon :icon="documentTextOutline" class="text-primary" />
            Reportes & Análisis
          </h3>
          <div class="ag-grid ag-grid-1 md:ag-grid-2 gap-4">
            <!-- CSV Export Card -->
            <div class="ag-card ag-glass p-6 ag-flex-row ag-flex-between items-center group hover:border-primary/30 transition-all cursor-pointer" @click="handleExport">
              <div class="ag-flex-row gap-4">
                <div class="ag-icon-box bg-blue-soft text-blue">
                  <ion-icon :icon="downloadOutline" />
                </div>
                <div>
                  <p class="font-bold text-lg">Descargar Historial</p>
                  <p class="text-sm text-muted">Obtén toda la telemetría en formato CSV</p>
                </div>
              </div>
              <ion-spinner v-if="isExporting" name="crescent" color="primary" />
            </div>

            <!-- AI Health Report Card -->
            <div class="ag-card ag-glass p-6 ag-flex-row ag-flex-between items-center group hover:border-primary/50 transition-all cursor-pointer" @click="isReportModalOpen = true">
              <div class="ag-flex-row gap-4">
                <div class="ag-icon-box bg-primary-soft text-primary">
                  <ion-icon :icon="sparklesOutline" />
                </div>
                <div>
                  <p class="font-bold text-lg">Diagnóstico de Salud IA</p>
                  <p v-if="isGeneratingReport" class="text-sm text-primary animate-pulse">Analizando tendencias y generando PDF...</p>
                  <p v-else class="text-sm text-muted">Informe agronómico avanzado con gráficos (PDF)</p>
                </div>
              </div>
              <ion-spinner v-if="isGeneratingReport" name="crescent" color="primary" />
              <ion-icon v-else :icon="sparklesOutline" class="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        <!-- Report Configuration Modal -->
        <ion-modal :is-open="isReportModalOpen" @didDismiss="isReportModalOpen = false" class="premium-modal">
          <ion-header class="ion-no-border">
            <ion-toolbar class="px-2">
              <ion-title>Configurar Informe IA</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="isReportModalOpen = false">
                  <ion-icon :icon="closeOutline" />
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="mb-6">
              <h4 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">Enfoque del Informe</h4>
              <ion-list class="ag-glass rounded-2xl overflow-hidden border border-white/5 mb-6">
                <ion-radio-group v-model="reportOptions.focus">
                  <ion-item lines="full" class="ag-item-clear">
                    <ion-label>General / Salud Global</ion-label>
                    <ion-radio slot="end" value="general"></ion-radio>
                  </ion-item>
                  <ion-item lines="full" class="ag-item-clear">
                    <ion-label>Plagas y Enfermedades</ion-label>
                    <ion-radio slot="end" value="pests"></ion-radio>
                  </ion-item>
                  <ion-item lines="none" class="ag-item-clear">
                    <ion-label>Optimización de Nutrientes</ion-label>
                    <ion-radio slot="end" value="nutrition"></ion-radio>
                  </ion-item>
                </ion-radio-group>
              </ion-list>

              <h4 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">Rango de Datos</h4>
              <ion-list class="ag-glass rounded-2xl overflow-hidden border border-white/5">
                <ion-radio-group v-model="reportOptions.timeRange">
                  <ion-item lines="full" class="ag-item-clear">
                    <ion-label>Últimas 24 horas</ion-label>
                    <ion-radio slot="end" value="24"></ion-radio>
                  </ion-item>
                  <ion-item lines="full" class="ag-item-clear">
                    <ion-label>Últimas 48 horas</ion-label>
                    <ion-radio slot="end" value="48"></ion-radio>
                  </ion-item>
                  <ion-item lines="none" class="ag-item-clear">
                    <ion-label>Última semana</ion-label>
                    <ion-radio slot="end" value="168"></ion-radio>
                  </ion-item>
                </ion-radio-group>
              </ion-list>
            </div>

            <div class="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex gap-4">
              <div class="text-primary text-xl"><ion-icon :icon="sparklesOutline" /></div>
              <p class="text-xs text-muted leading-relaxed">
                Nuestra IA analizará automáticamente las tendencias de temperatura, VPD y salud del suelo para redactar un informe profesional descargable.
              </p>
            </div>
          </ion-content>
          <ion-footer class="ion-no-border ion-padding">
            <ion-button expand="block" shape="round" class="premium-btn" @click="generateAIReport">
              <ion-icon :icon="checkmarkOutline" slot="start" />
              Generar Informe PDF
            </ion-button>
          </ion-footer>
        </ion-modal>

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

.refreshing {
  opacity: 0.5;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.actuator-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ag-text-muted);
  transition: all 0.3s ease;
}

.actuator-badge ion-icon {
  font-size: 0.9rem;
}

@keyframes pulseGreen {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0.3); }
}

.pulse-green {
  animation: pulseGreen 1s ease-in-out infinite;
  border-color: #22c55e !important;
  color: #22c55e !important;
  background: rgba(34, 197, 94, 0.1) !important;
}
</style>
