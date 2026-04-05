<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonIcon, IonButtons, IonMenuButton
} from '@ionic/vue';
import { 
  leafOutline, sparklesOutline, pulseOutline, 
  thermometerOutline, settingsOutline, checkmarkCircleOutline,
  timeOutline, arrowForwardOutline
} from 'ionicons/icons';
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTelemetryStore } from '@/stores/telemetry';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const telemetryStore = useTelemetryStore();
const router = useRouter();

onMounted(() => {
  telemetryStore.fetchLatest();
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

const navigateTo = (path: string) => {
  router.push(path);
};


</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4 py-2">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="font-bold text-lg">AgroNexus <span class="text-primary">Home</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="ag-container py-8">
        
        <!-- Welcome Header -->
        <div class="mb-10 animate-fade-in">
          <h2 class="text-muted text-sm font-bold uppercase tracking-widest mb-2">{{ greeting }}</h2>
          <h1 class="text-4xl font-black tracking-tight">
            Hola, <span class="ag-text-gradient">{{ authStore.userDisplayName }}</span>!
          </h1>
          <p class="text-muted mt-2 text-lg">Aquí está el resumen de tu sistema hoy.</p>
        </div>

        <!-- Status & Live Summary -->
        <div class="ag-grid md:ag-grid-2 gap-6 mb-12">
          <!-- Main System Health -->
          <div class="ag-card ag-glass p-6 overflow-hidden relative group cursor-pointer" @click="navigateTo('/tabs/control')">
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-6">
                <div class="ag-icon-box bg-primary-soft text-primary !w-12 !h-12">
                  <ion-icon :icon="checkmarkCircleOutline" />
                </div>
                <div>
                  <h3 class="font-bold text-xl">Sistema Saludable</h3>
                  <p class="text-xs text-muted">Todos los nodos funcionando</p>
                </div>
              </div>
              <div class="flex items-center gap-4 text-sm text-muted">
                <div class="flex items-center gap-1">
                  <ion-icon :icon="timeOutline" class="text-primary" />
                  <span>Última sincronización: {{ lastSyncLabel }}</span>
                </div>
              </div>
            </div>
            <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ion-icon :icon="pulseOutline" class="text-9xl" />
            </div>
          </div>

          <!-- Secondary Quick Stats -->
          <div class="ag-card ag-glass p-6 flex flex-col justify-between cursor-pointer" @click="navigateTo('/tabs/dashboard')">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg">Resumen de Sensores</h3>
              <ion-icon :icon="arrowForwardOutline" class="text-muted" />
            </div>
            <div class="flex gap-6">
              <div class="text-center">
                <p v-if="telemetryStore.loading && !telemetryStore.latest" class="text-2xl font-black">
                  <ion-skeleton-text animated style="width: 40px; height: 28px; margin: 0 auto;" />
                </p>
                <p v-else class="text-2xl font-black">{{ telemetryStore.latest?.temperature ?? '--' }}°C</p>
                <p class="text-[10px] text-muted uppercase font-bold tracking-tighter">TEMP</p>
              </div>
              <div class="w-[1px] h-8 bg-white/5 self-center"></div>
              <div class="text-center">
                <p v-if="telemetryStore.loading && !telemetryStore.latest" class="text-2xl font-black">
                  <ion-skeleton-text animated style="width: 30px; height: 28px; margin: 0 auto;" />
                </p>
                <p v-else class="text-2xl font-black">{{ telemetryStore.latest?.ph ?? '--' }}</p>
                <p class="text-[10px] text-muted uppercase font-bold tracking-tighter">pH</p>
              </div>
              <div class="w-[1px] h-8 bg-white/5 self-center"></div>
              <div class="text-center">
                <p v-if="telemetryStore.loading && !telemetryStore.latest" class="text-2xl font-black">
                  <ion-skeleton-text animated style="width: 35px; height: 28px; margin: 0 auto;" />
                </p>
                <p v-else class="text-2xl font-black">{{ telemetryStore.latest?.ec ?? '--' }}</p>
                <p class="text-[10px] text-muted uppercase font-bold tracking-tighter">EC</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Title: Quick Actions -->
        <h3 class="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-6">Acciones Rápidas</h3>
        
        <div class="ag-grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <button @click="navigateTo('/tabs/assistant')" class="action-btn group">
            <div class="action-icon bg-primary-soft text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <ion-icon :icon="sparklesOutline" />
            </div>
            <span class="text-sm font-bold">Consultar IA</span>
          </button>
          
          <button @click="navigateTo('/tabs/dashboard')" class="action-btn group">
            <div class="action-icon bg-blue-soft text-blue group-hover:bg-blue group-hover:text-white transition-all">
              <ion-icon :icon="thermometerOutline" />
            </div>
            <span class="text-sm font-bold">Ver Datos</span>
          </button>

          <button @click="navigateTo('/tabs/control')" class="action-btn group">
            <div class="action-icon bg-purple-soft text-purple group-hover:bg-purple group-hover:text-white transition-all">
              <ion-icon :icon="settingsOutline" />
            </div>
            <span class="text-sm font-bold">Ajustes</span>
          </button>

          <button @click="navigateTo('/tabs/home')" class="action-btn group">
            <div class="action-icon bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-all">
              <ion-icon :icon="leafOutline" />
            </div>
            <span class="text-sm font-bold">Mi Cultivo</span>
          </button>
        </div>

        <!-- Section: AI Capabilities (Skills) -->
        <div class="ag-card ag-glass p-1 pb-6 overflow-hidden">
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">Habilidades de AgroNexus <span class="text-primary">AI</span></h3>
            <p class="text-sm text-muted mb-8">Nuestra inteligencia artificial está diseñada para optimizar cada etapa de tu cultivo.</p>
            
            <div class="ag-grid md:ag-grid-3 gap-6">
              <div class="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div class="text-primary text-2xl pt-1">
                  <ion-icon :icon="sparklesOutline" />
                </div>
                <div>
                  <p class="font-bold text-sm">Análisis de Nutrientes</p>
                  <p class="text-xs text-muted mt-1">Ajuste automático de EC y pH basado en la etapa de crecimiento.</p>
                </div>
              </div>

              <div class="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div class="text-blue text-2xl pt-1">
                  <ion-icon :icon="pulseOutline" />
                </div>
                <div>
                  <p class="font-bold text-sm">Detección Atmosférica</p>
                  <p class="text-xs text-muted mt-1">Predicción de estrés hídrico según humedad relativa y VPD.</p>
                </div>
              </div>

              <div class="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div class="text-purple text-2xl pt-1">
                  <ion-icon :icon="leafOutline" />
                </div>
                <div>
                  <p class="font-bold text-sm">Ciclos Lumínicos</p>
                  <p class="text-xs text-muted mt-1">Optimización de espectro para maximizar la fotosíntesis.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-20 text-center p-8 border-t border-white/5">
          <p class="text-[10px] text-muted uppercase tracking-[0.3em]">AgroNexus Operating System &bull; v2.5.0-stable</p>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: transparent;
  padding: 0;
  border: none;
  cursor: pointer;
}

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .ag-grid.grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
