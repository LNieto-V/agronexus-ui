<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonButton, IonIcon 
} from '@ionic/vue';
import { logOutOutline, pulseOutline, warningOutline } from 'ionicons/icons';
import { onMounted } from 'vue';

import { useSystemControls } from '@/composables/useSystemControls';

import ModeToggleCard from '@/components/system/ModeToggleCard.vue';
import EnvironmentControls from '@/components/system/EnvironmentControls.vue';
import ApiSecurityPanel from '@/components/system/ApiSecurityPanel.vue';
import ActivityLog from '@/components/system/ActivityLog.vue';
import ProfileSettings from '@/components/system/ProfileSettings.vue';

const {
  mode,
  isOnline,
  controls,
  logs,
  handleModeToggle,
  checkSystem,
  sendMock,
  generateKey,
  handleLogout
} = useSystemControls();

onMounted(() => {
  checkSystem();
});
</script>

<template>
  <ion-page>
    <!-- Modern Header -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4 py-2">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="font-bold text-lg">System Control</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout" shape="round" color="danger">
            <ion-icon :icon="logOutOutline" />
          </ion-button>
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
          <div class="ag-card ag-glass px-4 py-2 rounded-full ag-flex-row gap-3">
            <div class="w-2-5 h-2-5 rounded-full" :class="isOnline ? 'bg-primary' : 'bg-danger'"></div>
            <span class="text-sm font-bold uppercase tracking-wider" :class="isOnline ? 'text-primary' : 'text-danger'">
              {{ isOnline ? 'System Online' : 'System Offline' }}
            </span>
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
            <ActivityLog :logs="logs" />

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
</style>
