<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonIcon, IonSelect, IonSelectOption 
} from '@ionic/vue';
import { pulseOutline, warningOutline } from 'ionicons/icons';
import { onMounted, watch } from 'vue';

import { useSystemControls } from '@/composables/useSystemControls';

import ModeToggleCard from '@/components/system/ModeToggleCard.vue';
import EnvironmentControls from '@/components/system/EnvironmentControls.vue';
import ApiSecurityPanel from '@/components/system/ApiSecurityPanel.vue';
import ActivityLog from '@/components/system/ActivityLog.vue';
import ProfileSettings from '@/components/system/ProfileSettings.vue';
import { useIotStore } from '@/stores/iotStore';


const {
  mode,
  isOnline,
  controls,
  handleModeToggle,
  checkSystem,
  sendMock,
  generateKey
} = useSystemControls();

import ZoneManager from '@/components/system/ZoneManager.vue';
import { modalController } from '@ionic/vue';
import { businessOutline } from 'ionicons/icons';

async function openZoneManager() {
  const modal = await modalController.create({
    component: ZoneManager,
    cssClass: 'premium-modal'
  });
  await modal.present();
}

const iotStore = useIotStore();

onMounted(() => {
  checkSystem();
  iotStore.fetchZones();
  iotStore.fetchActuatorLogs(true);
});

watch(() => iotStore.selectedZoneId, () => {
  iotStore.fetchActuatorLogs(true);
});

const handleLogInfinite = (event: any) => {
  iotStore.fetchActuatorLogs().then(() => {
    event.target.complete();
  });
};
</script>

<template>
  <ion-page>
    <!-- Modern Header -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4 py-2">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="font-bold text-lg">System & Hardware</ion-title>
        <ion-buttons slot="end">
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
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="dashboard-bg">
      <div class="ag-container py-6 md:py-10 max-width-900">
        
        <!-- Header & Status -->
        <div class="ag-flex-between mb-8 md:mb-12">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Main Controller</h2>
            <p class="text-muted mt-2 text-base">Node 01 &bull; Active <span class="text-primary">&bull; Synced</span></p>
          </div>
          <div class="ag-flex-row gap-4">
            <button @click="openZoneManager" class="ag-card ag-glass px-4 py-2 rounded-full ag-flex-row gap-2 hover-primary transition-all">
              <ion-icon :icon="businessOutline" class="text-primary" />
              <span class="text-sm font-bold">Zones</span>
            </button>
            <div class="ag-card ag-glass px-4 py-2 rounded-full ag-flex-row gap-3">
              <div class="w-2-5 h-2-5 rounded-full" :class="isOnline ? 'bg-primary' : 'bg-danger'"></div>
              <span class="text-sm font-bold uppercase tracking-wider" :class="isOnline ? 'text-primary' : 'text-danger'">
                {{ isOnline ? 'System Online' : 'System Offline' }}
              </span>
            </div>
          </div>
        </div>

        <!-- System Controls Split Grid -->
        <div class="ag-grid lg:grid-cols-[1fr_380px] gap-8 items-start relative z-10">
          
          <!-- Left Column: Core Controls & Security -->
          <div class="ag-flex-col gap-10">
            
            <!-- Mode Toggle -->
            <ModeToggleCard :mode="mode" @toggle="handleModeToggle" />

            <!-- Profile Settings -->
            <ProfileSettings />

            <!-- Security Panel -->
            <ApiSecurityPanel @generate="generateKey" />

          </div><!-- End Left Column -->

          <!-- Right Column: Settings & Diagnostics -->
          <div class="ag-flex-col gap-8 sticky top-6">
            
            <!-- Environment Controls -->
            <EnvironmentControls :mode="mode" :controls="controls" />
            
            <!-- Diagnostics -->
            <div class="diag-section">
              <div class="section-label-sm">Diagnostics</div>
              <div class="ag-card ag-glass diag-card">
                <button class="diag-btn" @click="checkSystem">
                  <div class="diag-btn-icon icon-primary">
                    <ion-icon :icon="pulseOutline" />
                  </div>
                  <div class="diag-btn-text">
                    <div class="diag-btn-name">Health Check</div>
                    <div class="diag-btn-desc">Verify all system nodes</div>
                  </div>
                </button>
                <div class="diag-divider"></div>
                <button class="diag-btn" @click="sendMock">
                  <div class="diag-btn-icon icon-warning">
                    <ion-icon :icon="warningOutline" />
                  </div>
                  <div class="diag-btn-text">
                    <div class="diag-btn-name">Test Telemetry</div>
                    <div class="diag-btn-desc">Send mock sensor data</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Activity Log -->
            <ActivityLog 
              :logs="iotStore.actuatorLogs" 
              :has-more="iotStore.logHasMore"
              @infinite="handleLogInfinite"
            />

          </div><!-- End Right Column -->

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.dashboard-bg { --background: var(--ag-bg); }

.section-label-sm {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ag-text-muted);
  margin-bottom: 1rem;
}

.diag-card {
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}
.diag-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  z-index: -1;
}

.diag-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
  font-family: inherit;
  color: inherit;
}

.diag-btn:hover { background: rgba(255, 255, 255, 0.03); }
.diag-btn:active { background: rgba(255, 255, 255, 0.05); }

.diag-btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.icon-primary { background: rgba(var(--ag-primary-rgb), 0.12); color: var(--ag-primary); }
.icon-warning { background: rgba(245, 158, 11, 0.12); color: var(--ag-yellow); }

.diag-btn-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ag-text);
  margin-bottom: 0.175rem;
}

.diag-btn-desc {
  font-size: 0.73rem;
  color: var(--ag-text-muted);
}

.diag-divider {
  height: 1px;
  background: var(--ag-border);
  margin: 0 1.25rem;
}

/* Zone Selector Styles */
.zone-selector-wrapper {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  padding: 0 0.5rem;
  transition: all 0.2s ease;
  min-width: 180px;
}

.zone-selector-wrapper:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(var(--ag-primary-rgb), 0.3);
}

.premium-select {
  --placeholder-color: var(--ag-text-muted);
  --placeholder-font-weight: 600;
  --color: var(--ag-primary);
  font-size: 0.85rem;
  font-weight: 700;
}

.hover-primary:hover {
  background: rgba(var(--ag-primary-rgb), 0.1);
  border-color: var(--ag-primary);
  transform: translateY(-2px);
}

.transition-all {
  transition: all 0.2s ease;
}
</style>
