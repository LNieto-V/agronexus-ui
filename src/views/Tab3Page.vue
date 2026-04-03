<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4 py-2">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="font-bold text-lg">System Controls</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="checkSystem" shape="round">
            <ion-icon 
              :icon="shieldCheckmarkOutline" 
              :class="isOnline ? 'text-primary' : 'text-red'" 
              class="text-xl" 
            />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="ag-container py-6">
        
        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight mb-2">Command Center</h2>
          <p class="text-sm text-muted">Manage automation protocols, environment controls, and system health.</p>
        </div>

        <div class="ag-card p-6 mb-8" :style="mode === 'AUTO' ? 'border-color: var(--ag-primary);' : ''">
          <div class="ag-flex-between">
            <div class="ag-flex-row gap-4">
              <div class="ag-icon-box" :class="mode === 'AUTO' ? 'bg-primary-soft text-primary' : 'bg-card border text-muted'">
                <ion-icon :icon="mode === 'AUTO' ? hardwareChipOutline : constructOutline" class="text-2xl" />
              </div>
              <div>
                <h3 class="text-xl font-bold">AI Automation</h3>
                <p class="text-sm text-muted mt-1">
                  Status: <span class="font-semibold" :class="mode === 'AUTO' ? 'text-primary' : ''">{{ mode }}</span>
                </p>
              </div>
            </div>
            <ion-toggle :checked="mode === 'AUTO'" @ionChange="handleModeToggle" color="primary" class="custom-toggle" />
          </div>
        </div>

        <div class="ag-grid sm:ag-grid-2 mb-8">
          
          <div>
            <h3 class="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Environment controls</h3>
            <div class="ag-flex-col gap-4">
              
              <div class="ag-card p-4 ag-flex-between hover-active">
                <div class="ag-flex-row gap-4">
                  <div class="ag-icon-box text-xl" :class="controls.fan ? 'bg-blue-soft text-blue' : 'bg-card border text-muted'">
                    <ion-icon :icon="snowOutline" />
                  </div>
                  <div>
                    <h4 class="font-bold text-base">Ventilation Fans</h4>
                    <p class="text-xs text-muted mt-1">Air circulation & temp control</p>
                  </div>
                </div>
                <ion-toggle :checked="controls.fan" @ionChange="e => controls.fan = e.detail.checked" :disabled="mode === 'AUTO'" />
              </div>

              <div class="ag-card p-4 ag-flex-between hover-active">
                <div class="ag-flex-row gap-4">
                  <div class="ag-icon-box text-xl" :class="controls.light ? 'bg-yellow-soft text-yellow' : 'bg-card border text-muted'">
                    <ion-icon :icon="sunnyOutline" />
                  </div>
                  <div>
                    <h4 class="font-bold text-base">Growth Lighting</h4>
                    <p class="text-xs text-muted mt-1">LED array scheduling</p>
                  </div>
                </div>
                <ion-toggle :checked="controls.light" @ionChange="e => controls.light = e.detail.checked" :disabled="mode === 'AUTO'" />
              </div>
              
              <div class="ag-card p-4 ag-flex-between hover-active">
                <div class="ag-flex-row gap-4">
                  <div class="ag-icon-box text-xl" :class="controls.water ? 'bg-primary-soft text-primary' : 'bg-card border text-muted'">
                    <ion-icon :icon="waterOutline" />
                  </div>
                  <div>
                    <h4 class="font-bold text-base">Irrigation Pump</h4>
                    <p class="text-xs text-muted mt-1">Nutrient delivery system</p>
                  </div>
                </div>
                <ion-toggle :checked="controls.water" @ionChange="e => controls.water = e.detail.checked" :disabled="mode === 'AUTO'" />
              </div>

            </div>

             <h3 class="text-sm font-semibold text-muted uppercase tracking-wide mb-4 mt-12">Security & API Access</h3>
            <div class="ag-flex-col gap-6">
              <div class="ag-card overflow-hidden">
                <!-- Section Header -->
                <div class="p-6 md:p-10 border-b border-white/5 bg-white/2">
                  <div class="ag-flex-row gap-6">
                    <div class="ag-icon-box bg-primary-soft text-primary p-5 rounded-2xl w-14 h-14">
                      <ion-icon :icon="shieldCheckmarkOutline" class="text-3xl" />
                    </div>
                    <div>
                      <h4 class="font-bold text-2xl tracking-tight">Developer Gateway</h4>
                      <p class="text-sm text-muted mt-2 leading-relaxed max-w-md">Provision secure access for external AgTech integrations & professional IoT protocols.</p>
                    </div>
                  </div>
                </div>

                <!-- Key Types Grid -->
                <div class="p-6 md:p-10 ag-grid sm:ag-grid-2 gap-6 md:gap-8">
                  <!-- Read Only Key -->
                  <div class="p-6 md:p-8 rounded-[24px] bg-white/3 border border-white/5 hover:bg-white/5 transition-all">
                    <div class="ag-flex-row gap-4 mb-6">
                      <div class="w-12 h-12 rounded-2xl bg-blue-soft text-blue flex items-center justify-center">
                        <ion-icon :icon="eyeOutline" class="text-xl" />
                      </div>
                      <span class="font-bold text-lg">Telemetry Access</span>
                    </div>
                    <p class="text-sm text-muted leading-relaxed mb-8">
                      Grants read-only access to sensor data and historical telemetry. 
                      <span class="text-blue/80 font-medium block mt-1">Safe for dashboards and public monitoring.</span>
                    </p>
                    <ion-button @click="generateKey('read')" fill="clear" class="premium-text-btn font-bold px-0" size="default">
                      GENERATE READ KEY
                      <ion-icon :icon="chevronForwardOutline" slot="end" class="ml-2" />
                    </ion-button>
                  </div>

                  <!-- Write Key -->
                  <div class="p-6 md:p-8 rounded-[24px] bg-white/3 border border-white/5 hover:bg-white/5 transition-all">
                    <div class="ag-flex-row gap-4 mb-6">
                      <div class="w-12 h-12 rounded-2xl bg-orange-soft text-orange flex items-center justify-center">
                        <ion-icon :icon="flashOutline" class="text-xl" />
                      </div>
                      <span class="font-bold text-lg">Full Control</span>
                    </div>
                    <p class="text-sm text-muted leading-relaxed mb-8">
                      Grants full access to system actuators and configuration settings.
                      <span class="text-orange/80 font-medium block mt-1">Elevated security requirements.</span>
                    </p>
                    <ion-button @click="generateKey('write')" fill="clear" class="premium-text-btn orange font-bold px-0" size="default">
                      GENERATE WRITE KEY
                      <ion-icon :icon="chevronForwardOutline" slot="end" class="ml-2" />
                    </ion-button>
                  </div>
                </div>

                <!-- Security Note -->
                <div class="px-10 py-6 bg-black/40 flex items-center gap-4">
                  <div class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_var(--ag-primary)]"></div>
                  <span class="text-[11px] uppercase font-bold text-muted tracking-[0.2em]">Advanced Encryption: SHA-256 HMAC Protocols Active</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Diagnostics & Testing</h3>
            
            <div class="ag-flex-col gap-4">
              <div class="ag-card p-5 ag-flex-between">
                <div class="ag-flex-row gap-3">
                  <ion-icon :icon="flaskOutline" class="text-2xl text-muted" />
                  <div>
                    <h4 class="font-bold text-base">Simulator Sandbox</h4>
                    <p class="text-xs text-muted mt-1">Generate test telemetry</p>
                  </div>
                </div>
                <ion-button @click="sendMock" color="tertiary" shape="round">
                  RUN TEST
                </ion-button>
              </div>

              <div class="ag-card overflow-hidden">
                <div class="bg-card px-4 py-3 ag-flex-between" style="border-bottom: 1px solid var(--ag-border);">
                  <span class="text-xs font-semibold text-muted uppercase">Live Activity Log</span>
                  <div class="ag-flex-row gap-1.5">
                    <div class="w-2 h-2 rounded-full bg-red"></div>
                    <div class="w-2 h-2 rounded-full bg-yellow"></div>
                    <div class="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                </div>
                <div class="p-4 font-mono text-xs" style="max-height: 220px; overflow-y: auto;">
                  <div v-for="(log, i) in logs" :key="i" class="ag-flex-row gap-3 mb-3">
                    <span class="text-muted" style="flex-shrink: 0;">[{{ log.time }}]</span>
                    <span class="font-semibold" :class="log.tag === 'AI' ? 'text-primary' : 'text-blue'">{{ log.tag }}</span>
                    <span class="text-muted">{{ log.message }}</span>
                  </div>
                </div>
              </div>

              <ion-button @click="handleLogout" fill="clear" color="danger" class="mt-4">
                <ion-icon :icon="logOutOutline" slot="start" />
                Sign Out from AgroNexus
              </ion-button>
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
  IonIcon, IonButtons, IonButton, IonMenuButton, IonToggle,
  modalController, toastController 
} from '@ionic/vue';
import { 
  shieldCheckmarkOutline, waterOutline, sunnyOutline, snowOutline,
  hardwareChipOutline, constructOutline, flaskOutline,
  logOutOutline, eyeOutline, chevronForwardOutline, flashOutline
} from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useSystemStore } from '@/stores/system';
import { useTelemetryStore } from '@/stores/telemetry';
import { useAuthStore } from '@/stores/auth';
import { systemService } from '@/services/api';
import ApiKeyModal from '@/components/ApiKeyModal.vue';
import { useRouter } from 'vue-router';

const systemStore = useSystemStore();
const telemetryStore = useTelemetryStore();
const authStore = useAuthStore();
const router = useRouter();

const mode = computed(() => systemStore.mode || 'AUTO');
const isOnline = computed(() => systemStore.isOnline);

const controls = ref({ fan: false, light: true, water: false });

const logs = ref([
  { time: '12:30:15', tag: 'SYS', message: 'EC levels stabilized at 2.1 mS/cm.' },
  { time: '11:15:02', tag: 'AI', message: 'Nutrient delivery schedule optimized.' },
  { time: '09:00:00', tag: 'PWR', message: 'Growth lighting initialized.' }
]);

const handleModeToggle = async (ev: any) => {
  const newMode = ev.detail.checked ? 'AUTO' : 'MANUAL';
  await systemStore.updateMode(newMode);
};

const checkSystem = async () => {
  await systemStore.checkHealth();
};

const sendMock = async () => {
  await telemetryStore.sendMockTelemetry();
};

const generateKey = async (type: 'read' | 'write') => {
  try {
    const response = await systemService.generateApiKey(type);
    const key = response.data.api_key;

    const modal = await modalController.create({
      component: ApiKeyModal,
      componentProps: {
        apiKey: key
      },
      cssClass: 'premium-modal'
    });
    await modal.present();
  } catch (error: any) {
    const toast = await toastController.create({
      message: 'Failed to generate API Key',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }
};

const handleLogout = async () => {
  try {
    await authStore.signOut();
    router.replace('/login');
  } catch (err) {
    console.error('Logout error', err);
  }
};

onMounted(() => {
  systemStore.fetchState();
});
</script>

<style scoped>
.custom-toggle {
  --handle-background-checked: white;
  --track-background-checked: var(--ag-primary);
}
.border { border: 1px solid var(--ag-border); }
.hover-active { transition: all 0.2s ease; }
.hover-active:hover { border-color: rgba(60, 60, 60, 0.5); }
.text-xs { font-size: 0.75rem; }
.mb-3 { margin-bottom: 0.75rem; }
.bg-red { background-color: var(--ag-red); }
.bg-yellow { background-color: var(--ag-yellow); }
</style>
