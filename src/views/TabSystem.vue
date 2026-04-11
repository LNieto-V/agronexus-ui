<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useSystemControls } from '@/composables/useSystemControls';
import { useIotStore } from '@/stores/iotStore';
import { useModal } from '@/composables/useModal';
import { Activity, AlertTriangle, Building2 } from 'lucide-vue-next';

import ModeToggleCard from '@/components/system/ModeToggleCard.vue';
import EnvironmentControls from '@/components/system/EnvironmentControls.vue';
import ApiSecurityPanel from '@/components/system/ApiSecurityPanel.vue';
import ActivityLog from '@/components/system/ActivityLog.vue';
import ProfileSettings from '@/components/system/ProfileSettings.vue';
import ZoneManager from '@/components/system/ZoneManager.vue';
import AppSelect from '@/components/AppSelect.vue';

const {
  mode, isOnline, controls,
  handleModeToggle, checkSystem, sendMock, generateKey
} = useSystemControls();

const iotStore = useIotStore();
const { openModal } = useModal();

function openZoneManager() {
  openModal(ZoneManager, {});
}

onMounted(() => {
  checkSystem();
  iotStore.fetchZones();
  iotStore.fetchActuatorLogs(true);
});

watch(() => iotStore.selectedZoneId, () => {
  iotStore.fetchActuatorLogs(true);
});

const zoneOptions = [
  { value: null as string | null, label: 'All Zones' },
  ...iotStore.zones.map(z => ({ value: z.id, label: z.name }))
];
</script>

<template>
  <div class="page-scroll">
    <div class="ag-container py-6 max-width-900">

      <!-- Page Header -->
      <div class="page-header mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Main Controller</h1>
          <p class="text-muted mt-1 text-sm">
            Node 01 · Active <span class="text-primary">· Synced</span>
          </p>
        </div>
        <div class="ag-flex-row gap-3 flex-wrap">
          <button id="open-zone-manager" @click="openZoneManager" class="zone-btn">
            <Building2 :size="16" class="text-primary" />
            <span>Zones</span>
          </button>
          <AppSelect
            v-model="iotStore.selectedZoneId"
            :options="[{ value: null, label: 'All Zones' }, ...iotStore.zones.map(z => ({ value: z.id, label: z.name }))]"
            placeholder="All Zones"
            class="zone-select"
          />
          <div class="status-pill" :class="isOnline ? 'online' : 'offline'">
            <div class="pill-dot" />
            <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="system-grid">
        <!-- Left column -->
        <div class="ag-flex-col gap-10">
          <ModeToggleCard :mode="mode" @toggle="handleModeToggle" />
          <ProfileSettings />
          <ApiSecurityPanel @generate="generateKey" />
        </div>

        <!-- Right column -->
        <div class="ag-flex-col gap-8 sticky top-6">
          <EnvironmentControls :mode="mode" :controls="controls" />

          <!-- Diagnostics -->
          <div>
            <div class="section-label">Diagnostics</div>
            <div class="diag-card">
              <button class="diag-btn" @click="checkSystem" id="health-check-btn">
                <div class="diag-icon icon-primary">
                  <Activity :size="18" />
                </div>
                <div>
                  <div class="diag-name">Health Check</div>
                  <div class="diag-desc">Verify all system nodes</div>
                </div>
              </button>
              <div class="diag-divider" />
              <button class="diag-btn" @click="sendMock" id="test-telemetry-btn">
                <div class="diag-icon icon-warning">
                  <AlertTriangle :size="18" />
                </div>
                <div>
                  <div class="diag-name">Test Telemetry</div>
                  <div class="diag-desc">Send mock sensor data</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Activity Log -->
          <ActivityLog
            :logs="iotStore.actuatorLogs"
            :has-more="iotStore.logHasMore"
            @load-more="iotStore.fetchActuatorLogs()"
          />
        </div>
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

.zone-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--ag-border);
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  color: var(--ag-text);
  font-size: 0.875rem;
  font-weight: 700;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.zone-btn:hover {
  background: rgba(var(--ag-primary-rgb), 0.1);
  border-color: var(--ag-primary);
  transform: translateY(-2px);
}

.zone-select { min-width: 150px; }

.status-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--ag-border);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill.online { color: var(--ag-primary); border-color: rgba(var(--ag-primary-rgb), 0.3); }
.status-pill.offline { color: var(--ag-danger); border-color: rgba(239,68,68,0.3); }

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.system-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .system-grid { grid-template-columns: 1fr 380px; }
}

.section-label {
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

.diag-btn:hover { background: rgba(255,255,255,0.03); }

.diag-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-primary { background: rgba(var(--ag-primary-rgb), 0.12); color: var(--ag-primary); }
.icon-warning { background: rgba(245,158,11,0.12); color: var(--ag-yellow); }

.diag-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ag-text);
  margin-bottom: 0.175rem;
}

.diag-desc {
  font-size: 0.73rem;
  color: var(--ag-text-muted);
}

.diag-divider {
  height: 1px;
  background: var(--ag-border);
  margin: 0 1.25rem;
}

.flex-wrap { flex-wrap: wrap; }
</style>
