<script setup lang="ts">
import { Snowflake, Sun, Droplets } from 'lucide-vue-next';
import type { SystemMode } from '@/types';
import { computed } from 'vue';
import { useActuatorBus } from '@/composables/useActuatorBus';
import AppToggle from '@/components/AppToggle.vue';

defineProps<{
  mode: SystemMode;
  controls: { fan: boolean; light: boolean; water: boolean; }
}>();

const emit = defineEmits<{
  'update:fan': [value: boolean];
  'update:light': [value: boolean];
  'update:water': [value: boolean];
}>();

const { pendingActions } = useActuatorBus();

const isFanPending = computed(() =>
  pendingActions.value.some(a => (a.device === 'VENTILADOR' || a.device === 'FAN') && a.action === 'ON')
);
const isLightPending = computed(() =>
  pendingActions.value.some(a => (a.device === 'LUZ' || a.device === 'LIGHT') && a.action === 'ON')
);
const isWaterPending = computed(() =>
  pendingActions.value.some(a => (a.device === 'BOMBA' || a.device === 'WATER' || a.device === 'PUMP') && a.action === 'ON')
);
</script>

<template>
  <div class="env-section">
    <div class="section-label">Environment Controls</div>

    <div class="env-card">
      <!-- Auto lock notice -->
      <div v-if="mode === 'AUTO'" class="auto-lock-bar">
        <span class="lock-dot" />
        <span class="lock-text">Controls locked — AI Automation is active</span>
      </div>

      <!-- Fan -->
      <div class="control-row" :class="{ 'is-on': controls.fan, 'is-locked': mode === 'AUTO', 'pulse-green': isFanPending }">
        <div class="control-left">
          <div class="control-icon" :class="controls.fan ? 'icon-blue' : 'icon-off'">
            <Snowflake :size="18" />
          </div>
          <div class="control-text">
            <div class="control-name">Ventilation Fans</div>
            <div class="control-desc">Air circulation &amp; temp control</div>
          </div>
        </div>
        <AppToggle
          :model-value="controls.fan"
          :disabled="mode === 'AUTO'"
          @update:model-value="emit('update:fan', $event)"
        />
      </div>

      <div class="row-divider" />

      <!-- Light -->
      <div class="control-row" :class="{ 'is-on': controls.light, 'is-locked': mode === 'AUTO', 'pulse-green': isLightPending }">
        <div class="control-left">
          <div class="control-icon" :class="controls.light ? 'icon-yellow' : 'icon-off'">
            <Sun :size="18" />
          </div>
          <div class="control-text">
            <div class="control-name">Growth Lighting</div>
            <div class="control-desc">LED array scheduling</div>
          </div>
        </div>
        <AppToggle
          :model-value="controls.light"
          :disabled="mode === 'AUTO'"
          @update:model-value="emit('update:light', $event)"
        />
      </div>

      <div class="row-divider" />

      <!-- Water -->
      <div class="control-row" :class="{ 'is-on': controls.water, 'is-locked': mode === 'AUTO', 'pulse-green': isWaterPending }">
        <div class="control-left">
          <div class="control-icon" :class="controls.water ? 'icon-green' : 'icon-off'">
            <Droplets :size="18" />
          </div>
          <div class="control-text">
            <div class="control-name">Irrigation Pump</div>
            <div class="control-desc">Nutrient delivery system</div>
          </div>
        </div>
        <AppToggle
          :model-value="controls.water"
          :disabled="mode === 'AUTO'"
          @update:model-value="emit('update:water', $event)"
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
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--ag-border);
  backdrop-filter: blur(10px);
}

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
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  transition: background 0.2s ease;
}

.control-row:not(.is-locked):hover { background: rgba(255,255,255,0.02); }
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
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.icon-off { background: rgba(255,255,255,0.04); color: var(--ag-text-muted); border: 1px solid var(--ag-border); }
.icon-blue { background: rgba(59,130,246,0.12); color: var(--ag-blue); }
.icon-yellow { background: rgba(245,158,11,0.12); color: var(--ag-yellow); }
.icon-green { background: rgba(var(--ag-primary-rgb),0.12); color: var(--ag-primary); }

.control-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ag-text);
  margin-bottom: 0.175rem;
}

.control-desc { font-size: 0.73rem; color: var(--ag-text-muted); }

.row-divider { height: 1px; background: var(--ag-border); margin: 0 1.25rem; }

@keyframes pulseGreen {
  0%, 100% { box-shadow: inset 0 0 0 0 rgba(34,197,94,0); background: transparent; }
  50% { box-shadow: inset 0 0 0 2px rgba(34,197,94,0.4); background: rgba(34,197,94,0.05); }
}

.pulse-green {
  animation: pulseGreen 1s ease-in-out infinite;
  opacity: 1 !important;
}
</style>
