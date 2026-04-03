<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="ag-neon-glow font-bold text-xl ion-hide-md-up">Control System</ion-title>
        <ion-title class="font-bold text-lg ion-hide-md-down">System Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="checkSystem">
            <div :class="{ 'pulse-container': isOnline }">
              <ion-icon 
                :icon="shieldCheckmarkOutline" 
                :class="isOnline ? 'text-neon-green' : 'text-red-500'" 
                class="text-xl"
              />
            </div>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="control-container">
        <!-- Automation Section -->
        <div class="ag-glass-card p-6 mb-6 tech-cut-corner relative overflow-hidden" :class="{ 'active-mode': mode === 'AUTO' }">
          <div class="tech-grid-bg absolute inset-0 opacity-10"></div>
          <div class="flex items-center justify-between relative z-10">
            <div class="flex items-center gap-4">
              <div class="mode-icon border border-white/5" :class="mode === 'AUTO' ? 'bg-neon-green/20 text-neon-green shadow-neon' : 'bg-white/5 text-white/40'">
                <ion-icon :icon="mode === 'AUTO' ? hardwareChipOutline : constructOutline" />
              </div>
              <div>
                <h2 class="text-2xl font-black tracking-tight">Automation</h2>
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full" :class="mode === 'AUTO' ? 'bg-neon-green animate-pulse' : 'bg-white/20'"></div>
                  <p class="text-[9px] uppercase tracking-[0.2em] opacity-40 font-black">
                    {{ mode === 'AUTO' ? 'AI-Core Active' : 'Manual Override' }}
                  </p>
                </div>
              </div>
            </div>
            <ion-toggle 
              :checked="mode === 'AUTO'" 
              @ionChange="toggleMode"
              class="custom-toggle"
            ></ion-toggle>
          </div>
        </div>

        <!-- Simulation Section (Testing) -->
        <div class="ag-glass-card p-5 mb-8 border border-dashed border-white/10 hover:border-white/30 transition-all group tech-cut-corner">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <ion-icon :icon="flaskOutline" class="text-xl opacity-30 group-hover:opacity-100 group-hover:text-tertiary transition-all" />
              <div>
                <h2 class="text-sm font-bold tracking-tight">Data Simulator</h2>
                <p class="text-[10px] opacity-40">Generate telemetry benchmarks</p>
              </div>
            </div>
            <ion-button @click="sendMock" color="tertiary" fill="clear" class="simulate-btn font-black text-[10px] uppercase tracking-widest">
              Execute
              <ion-icon slot="end" :icon="playOutline" />
            </ion-button>
          </div>
        </div>

        <!-- Device Registry -->
        <div class="flex items-center justify-between mb-4 px-2">
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-accent rounded-full"></div>
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Internal Registry</h3>
          </div>
          <span class="text-[9px] bg-white/5 border border-white/5 px-3 py-1 tech-cut-corner opacity-40 font-bold">NODE_0x42</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div class="ag-glass-card p-4 flex items-center justify-between hover:bg-white/[0.03] transition-all group relative overflow-hidden">
            <div class="tech-grid-bg absolute inset-0 opacity-5"></div>
            <div class="flex items-center gap-4 relative z-10">
              <div class="icon-stat bg-neon-green/10 text-neon-green border border-neon-green/20 group-hover:scale-110 transition-transform">
                <ion-icon :icon="waterOutline" />
              </div>
              <div>
                <p class="font-black text-xs tracking-tight">H2O Pump_01</p>
                <div class="flex items-center gap-2 mt-1">
                  <div class="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-neon-green w-[45%]"></div>
                  </div>
                  <p class="text-[8px] opacity-30 font-bold">45% CAP</p>
                </div>
              </div>
            </div>
            <div class="status-badge active">
              <div class="w-1 h-1 rounded-full bg-neon-green mr-2 shadow-[0_0_5px_var(--ag-neon-green)] animate-pulse"></div>
              ONLINE
            </div>
          </div>

          <div class="ag-glass-card p-4 flex items-center justify-between hover:bg-white/[0.03] transition-all group relative overflow-hidden">
            <div class="tech-grid-bg absolute inset-0 opacity-5"></div>
            <div class="flex items-center gap-4 relative z-10">
              <div class="icon-stat bg-accent/10 text-accent border border-accent/20 group-hover:scale-110 transition-transform">
                <ion-icon :icon="sunnyOutline" />
              </div>
              <div>
                <p class="font-black text-xs tracking-tight">LED_Array_Alpha</p>
                <div class="flex items-center gap-2 mt-1">
                  <div class="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-accent w-full"></div>
                  </div>
                  <p class="text-[8px] opacity-30 font-bold">PWM FULL</p>
                </div>
              </div>
            </div>
            <div class="status-badge active color-accent">
              <div class="w-1 h-1 rounded-full bg-accent mr-2 shadow-[0_0_5px_var(--ag-accent)] animate-pulse"></div>
              ONLINE
            </div>
          </div>
        </div>

        <!-- System Logs / Terminal -->
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-1 h-3 bg-red-400 rounded-full"></div>
          <h3 class="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Terminal Stream</h3>
        </div>
        
        <div class="ag-glass-card p-0 overflow-hidden border border-white/5 bg-black/20">
          <div class="terminal-header flex items-center px-4 py-2 bg-white/5 border-b border-white/5">
            <div class="flex gap-1.5">
              <div class="w-2 h-2 rounded-full bg-red-500/50"></div>
              <div class="w-2 h-2 rounded-full bg-yellow-500/50"></div>
              <div class="w-2 h-2 rounded-full bg-green-500/50"></div>
            </div>
            <span class="text-[9px] font-mono opacity-30 ml-4 font-bold">STDOUT - SESSION_ACTIVE</span>
          </div>
          
          <div class="log-container font-mono text-[10px] p-2 max-h-[300px] overflow-y-auto">
            <div v-for="(log, i) in logs" :key="i" class="log-entry flex gap-3 p-2 hover:bg-white/5 transition-colors border-l-2" :class="log.type === 'info' ? 'border-neon-green' : 'border-accent'">
              <span class="opacity-20 flex-shrink-0">[{{ log.time }}]</span>
              <span :class="log.type === 'info' ? 'text-neon-green/80' : 'text-accent/80'" class="font-bold flex-shrink-0">> {{ log.tag }}</span>
              <span class="opacity-60">{{ log.message }}</span>
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
  IonButtons, IonButton, IonIcon, IonToggle, IonMenuButton 
} from '@ionic/vue';
import { 
  shieldCheckmarkOutline, waterOutline, sunnyOutline, 
  hardwareChipOutline, constructOutline,
  flaskOutline, playOutline 
} from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useSystemStore } from '@/stores/system';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const systemStore = useSystemStore();
const mode = computed(() => systemStore.mode);
const isOnline = computed(() => systemStore.isOnline);

const logs = ref([
  { time: '12:30:45', tag: 'SYS', type: 'info', message: 'EC levels stabilized after automated injection cycle #402.' },
  { time: '11:15:20', tag: 'AI', type: 'info', message: 'Nutrient optimization strategy updated by AgExpert.' },
  { time: '09:00:10', tag: 'PWR', type: 'accent', message: 'Lighting transition initiated (18/6 schedule).' },
  { time: '08:45:00', tag: 'H2O', type: 'info', message: 'Pump flow nominal: 4.2 L/min.' }
]);

const toggleMode = async (event: any) => {
  const newMode = event.detail.checked ? 'AUTO' : 'MANUAL';
  if (newMode !== mode.value) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) { console.warn('Haptics not available'); }
    await systemStore.updateMode(newMode);
  }
};

const checkSystem = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) { console.warn('Haptics not available'); }
  await systemStore.checkHealth();
};

const sendMock = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (e) { console.warn('Haptics not available'); }
  const telemetryStore = (await import('@/stores/telemetry')).useTelemetryStore();
  await telemetryStore.sendMockTelemetry();
};

onMounted(() => {
  systemStore.fetchState();
});
</script>

<style scoped>
.control-container {
  max-width: 800px;
  margin: 0 auto;
}

.premium-toolbar {
  --background: #0f172a;
}

.custom-toggle {
  --handle-background: white;
  --handle-background-checked: var(--ag-neon-green);
  --track-background: rgba(255, 255, 255, 0.1);
  --track-background-checked: rgba(var(--ag-neon-green-rgb), 0.2);
}

.mode-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.shadow-neon {
  box-shadow: 0 0 20px rgba(var(--ag-neon-green-rgb), 0.2);
}

.active-mode {
  border: 1px solid rgba(var(--ag-neon-green-rgb), 0.3) !important;
  box-shadow: 0 0 30px rgba(var(--ag-neon-green-rgb), 0.1);
}

.pulse-container {
  padding: 4px;
  position: relative;
}

.pulse-container::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  border: 1px solid var(--ag-neon-green);
  animation: ripple 2s infinite;
  pointer-events: none;
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0; }
  50% { opacity: 0.3; }
  100% { transform: scale(1.8); opacity: 0; }
}

.icon-stat {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.status-badge {
  font-size: 9px;
  font-weight: 900;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  letter-spacing: 0.1em;
}

.status-badge.active {
  background: rgba(var(--ag-neon-green-rgb), 0.1);
  color: var(--ag-neon-green);
}

.status-badge.color-accent {
  background: rgba(var(--ag-accent-rgb, 52, 152, 219), 0.1);
  color: var(--ag-accent);
}

.log-container::-webkit-scrollbar {
  width: 4px;
}
.log-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 0.25rem; }
.gap-1\.5 { gap: 0.375rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.p-0 { padding: 0; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.mt-1 { margin-top: 0.25rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.ml-4 { margin-left: 1rem; }
.ml-auto { margin-left: auto; }
.mr-2 { margin-right: 0.5rem; }
</style>

