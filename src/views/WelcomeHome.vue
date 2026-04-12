<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useIotStore } from '@/stores/iotStore';
import { useAuthStore } from '@/stores/auth';
import { useTelemetryStore } from '@/stores/telemetry';
import { useRouter } from 'vue-router';
import {
  CheckCircle, Clock, ArrowRight, Sparkles,
  Thermometer, Settings, Leaf, Activity, Sun
} from 'lucide-vue-next';
import AppSpinner from '@/components/AppSpinner.vue';

const authStore = useAuthStore();
const telemetryStore = useTelemetryStore();
const iotStore = useIotStore();
const router = useRouter();

onMounted(() => {
  telemetryStore.fetchLatest();
  iotStore.fetchZones();
});

const lastSyncLabel = computed(() => {
  if (!telemetryStore.latest?.timestamp) return 'Sin datos';
  const diff = Date.now() - new Date(telemetryStore.latest.timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Justo ahora';
  if (mins < 60) return `Hace ${mins}m`;
  return `Hace ${Math.floor(mins / 60)}h`;
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
});

const navigateTo = (path: string) => router.push(path);
</script>

<template>
  <div class="page-scroll">
    <div class="ag-container py-8">

      <!-- Welcome Header -->
      <div class="mb-10 animate-fade-in">
        <h2 class="text-muted text-xs font-bold uppercase tracking-widest mb-2 font-display">{{ greeting }}</h2>
        <h1 class="text-4xl font-black tracking-tight font-display">
          Hola, <span class="ag-text-gradient">{{ authStore.userDisplayName }}</span>!
        </h1>
        <p class="text-muted mt-2 text-lg">Aquí está el resumen de tu sistema hoy.</p>
      </div>

      <!-- Status Cards -->
      <div class="ag-grid md:ag-grid-2 gap-6 mb-12">
        <!-- System Health -->
        <div class="ag-card ag-glass p-6 overflow-hidden relative group cursor-pointer" @click="navigateTo('/tabs/control')">
          <div class="relative">
            <div class="ag-flex-row gap-3 mb-6">
              <div class="ag-icon-box bg-primary-soft text-primary" style="width:48px;height:48px;border-radius:14px">
                <CheckCircle :size="22" />
              </div>
              <div>
                <h3 class="font-bold text-xl">Sistema Saludable</h3>
                <p class="text-xs text-muted">Todos los nodos funcionando</p>
              </div>
            </div>
            <div class="ag-flex-row gap-1 text-sm text-muted">
              <Clock :size="14" class="text-primary" />
              <span>Última sincronización: {{ lastSyncLabel }}</span>
            </div>
          </div>
          <div class="abs-bg-icon">
            <Activity :size="120" />
          </div>
        </div>

        <!-- Sensor Summary -->
        <div class="ag-card ag-glass p-6 cursor-pointer flex flex-col justify-between" @click="navigateTo('/tabs/dashboard')">
          <div class="ag-flex-between mb-4">
            <h3 class="font-bold text-lg">Resumen de Sensores</h3>
            <ArrowRight :size="18" class="text-muted" />
          </div>

          <div v-if="telemetryStore.loading && !telemetryStore.latest" class="ag-flex-center py-4">
            <AppSpinner size="sm" />
          </div>
          <div v-else class="sensor-stats">
            <div class="stat-item">
              <p class="text-2xl font-black">{{ telemetryStore.latest?.temperature ?? '--' }}°C</p>
              <p class="stat-label">TEMP</p>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <p class="text-2xl font-black">{{ telemetryStore.latest?.ph ?? '--' }}</p>
              <p class="stat-label">pH</p>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <p class="text-2xl font-black">{{ telemetryStore.latest?.ec ?? '--' }}</p>
              <p class="stat-label">EC</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <h3 class="text-muted text-xs font-black uppercase tracking-widest mb-6">Acciones Rápidas</h3>

      <div class="quick-actions mb-12">
        <button id="go-assistant" @click="navigateTo('/tabs/assistant')" class="action-btn group">
          <div class="action-icon bg-primary-soft text-primary">
            <Sparkles :size="24" />
          </div>
          <span class="text-sm font-bold">Consultar IA</span>
        </button>

        <button id="go-dashboard" @click="navigateTo('/tabs/dashboard')" class="action-btn group">
          <div class="action-icon bg-blue-soft text-blue">
            <Thermometer :size="24" />
          </div>
          <span class="text-sm font-bold">Ver Datos</span>
        </button>

        <button id="go-control" @click="navigateTo('/tabs/control')" class="action-btn group">
          <div class="action-icon bg-purple-soft text-purple">
            <Settings :size="24" />
          </div>
          <span class="text-sm font-bold">Ajustes</span>
        </button>

        <button id="stay-home" @click="navigateTo('/tabs/home')" class="action-btn group">
          <div class="action-icon" style="background:rgba(255,255,255,0.05);color:var(--ag-text-muted)">
            <Leaf :size="24" />
          </div>
          <span class="text-sm font-bold">Mi Cultivo</span>
        </button>
      </div>

      <!-- AI Capabilities -->
      <div class="ag-card ag-glass overflow-hidden">
        <div class="p-6">
          <h2 class="text-xl font-bold mb-2">Habilidades de AgroNexus <span class="text-primary">AI</span></h2>
          <p class="text-sm text-muted mb-8">Nuestra inteligencia artificial está diseñada para optimizar cada etapa de tu cultivo.</p>

          <div class="ag-grid md:ag-grid-3 gap-6">
            <div class="capability-card">
              <div class="text-primary"><Sparkles :size="22" /></div>
              <div>
                <p class="font-bold text-sm">Análisis de Nutrientes</p>
                <p class="text-xs text-muted mt-1">Ajuste automático de EC y pH basado en la etapa de crecimiento.</p>
              </div>
            </div>

            <div class="capability-card">
              <div class="text-blue"><Activity :size="22" /></div>
              <div>
                <p class="font-bold text-sm">Detección Atmosférica</p>
                <p class="text-xs text-muted mt-1">Predicción de estrés hídrico según humedad relativa y VPD.</p>
              </div>
            </div>

            <div class="capability-card">
              <div class="text-purple"><Sun :size="22" /></div>
              <div>
                <p class="font-bold text-sm">Ciclos Lumínicos</p>
                <p class="text-xs text-muted mt-1">Optimización de espectro para maximizar la fotosíntesis.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-20 text-center p-8 border-t border-white-5">
        <p class="text-xs text-muted uppercase tracking-widest">AgroNexus Operating System · v2.5.0-stable</p>
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

.flex { display: flex; }
.flex-col { flex-direction: column; }
.justify-between { justify-content: space-between; }

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.abs-bg-icon {
  position: absolute;
  right: -1rem;
  bottom: -1rem;
  opacity: 0.05;
  color: var(--ag-primary);
  transition: opacity 0.3s;
}

.group:hover .abs-bg-icon { opacity: 0.1; }

.sensor-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-item { text-align: center; }

.stat-label {
  font-size: 10px;
  color: var(--ag-text-muted);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin: 0;
}

.stat-divider {
  width: 1px;
  height: 2rem;
  background: rgba(255,255,255,0.05);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .quick-actions { grid-template-columns: repeat(4, 1fr); }
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  padding: 0;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-btn:hover { transform: translateY(-2px); }

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

.action-btn:hover .action-icon {
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}

.capability-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.05);
}
</style>
