<script setup lang="ts">
import { IonIcon, IonToggle } from '@ionic/vue';
import { snowOutline, sunnyOutline, waterOutline } from 'ionicons/icons';
import type { SystemMode } from '@/types';

defineProps<{
  mode: SystemMode;
  controls: { fan: boolean; light: boolean; water: boolean; }
}>();

const emit = defineEmits<{
  'update:fan': [value: boolean];
  'update:light': [value: boolean];
  'update:water': [value: boolean];
}>();
</script>

<template>
  <div class="env-section">
    <div class="section-label">Environment Controls</div>

    <div class="env-card">
      <!-- Manual mode lock notice -->
      <div v-if="mode === 'AUTO'" class="auto-lock-bar">
        <span class="lock-dot"></span>
        <span class="lock-text">Controls locked — AI Automation is active</span>
      </div>

      <!-- Fan -->
      <div class="control-row" :class="{ 'is-on': controls.fan, 'is-locked': mode === 'AUTO' }">
        <div class="control-left">
          <div class="control-icon" :class="controls.fan ? 'icon-blue' : 'icon-off'">
            <ion-icon :icon="snowOutline" />
          </div>
          <div class="control-text">
            <div class="control-name">Ventilation Fans</div>
            <div class="control-desc">Air circulation &amp; temp control</div>
          </div>
        </div>
        <ion-toggle
          :checked="controls.fan"
          @ionChange="emit('update:fan', $event.detail.checked)"
          :disabled="mode === 'AUTO'"
          color="primary"
        />
      </div>

      <div class="row-divider"></div>

      <!-- Light -->
      <div class="control-row" :class="{ 'is-on': controls.light, 'is-locked': mode === 'AUTO' }">
        <div class="control-left">
          <div class="control-icon" :class="controls.light ? 'icon-yellow' : 'icon-off'">
            <ion-icon :icon="sunnyOutline" />
          </div>
          <div class="control-text">
            <div class="control-name">Growth Lighting</div>
            <div class="control-desc">LED array scheduling</div>
          </div>
        </div>
        <ion-toggle
          :checked="controls.light"
          @ionChange="emit('update:light', $event.detail.checked)"
          :disabled="mode === 'AUTO'"
          color="primary"
        />
      </div>

      <div class="row-divider"></div>

      <!-- Water -->
      <div class="control-row" :class="{ 'is-on': controls.water, 'is-locked': mode === 'AUTO' }">
        <div class="control-left">
          <div class="control-icon" :class="controls.water ? 'icon-green' : 'icon-off'">
            <ion-icon :icon="waterOutline" />
          </div>
          <div class="control-text">
            <div class="control-name">Irrigation Pump</div>
            <div class="control-desc">Nutrient delivery system</div>
          </div>
        </div>
        <ion-toggle
          :checked="controls.water"
          @ionChange="emit('update:water', $event.detail.checked)"
          :disabled="mode === 'AUTO'"
          color="primary"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ag-text-muted);
  margin-bottom: 1rem;
}

.env-card {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.env-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  z-index: -1;
}

.env-card {
  border: 1px solid var(--ag-border);
}

/* Auto lock bar */
.auto-lock-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: rgba(var(--ag-primary-rgb), 0.06);
  border-bottom: 1px solid rgba(var(--ag-primary-rgb), 0.12);
}

.lock-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ag-primary);
  flex-shrink: 0;
}

.lock-text {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ag-primary);
  letter-spacing: 0.02em;
}

/* Rows */
.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  transition: background 0.2s ease;
}

.control-row:not(.is-locked):hover {
  background: rgba(255, 255, 255, 0.02);
}

.control-row.is-locked { opacity: 0.5; }

.control-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.control-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.icon-off {
  background: rgba(255, 255, 255, 0.04);
  color: var(--ag-text-muted);
  border: 1px solid var(--ag-border);
}

.icon-blue   { background: rgba(59, 130, 246, 0.12); color: var(--ag-blue); }
.icon-yellow { background: rgba(245, 158, 11, 0.12); color: var(--ag-yellow); }
.icon-green  { background: rgba(var(--ag-primary-rgb), 0.12); color: var(--ag-primary); }

.control-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ag-text);
  margin-bottom: 0.175rem;
}

.control-desc {
  font-size: 0.73rem;
  color: var(--ag-text-muted);
}

.row-divider {
  height: 1px;
  background: var(--ag-border);
  margin: 0 1.25rem;
}
</style>
