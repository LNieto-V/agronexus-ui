<script setup lang="ts">
import { Cpu, Wrench } from 'lucide-vue-next';
import type { SystemMode } from '@/types';
import AppToggle from '@/components/AppToggle.vue';

const props = defineProps<{ mode: SystemMode }>();
const emit = defineEmits<{ toggle: [checked: boolean] }>();
</script>

<template>
  <div class="mode-card ag-glass" :class="{ 'is-auto': mode === 'AUTO' }">
    <div class="mode-left">
      <div class="mode-icon" :class="mode === 'AUTO' ? 'icon-auto' : 'icon-manual'">
        <component :is="mode === 'AUTO' ? Cpu : Wrench" :size="22" />
      </div>
      <div class="mode-text">
        <div class="mode-title">AI Automation</div>
        <div class="mode-status">
          <span class="status-dot" :class="mode === 'AUTO' ? 'dot-on' : 'dot-off'" />
          <span :class="mode === 'AUTO' ? 'status-on' : 'status-off'">
            {{ mode === 'AUTO' ? 'Active — AI is in control' : 'Manual — You are in control' }}
          </span>
        </div>
      </div>
    </div>
    <AppToggle
      :model-value="mode === 'AUTO'"
      @change="emit('toggle', $event)"
      class="mode-toggle"
    />
  </div>
</template>

<style scoped>
.mode-card {
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-card.is-auto {
  border-color: rgba(var(--ag-primary-rgb), 0.4);
  box-shadow: 0 0 0 1px rgba(var(--ag-primary-rgb), 0.08),
              0 4px 24px rgba(var(--ag-primary-rgb), 0.06);
}

.mode-left { display: flex; align-items: center; gap: 1rem; }

.mode-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.icon-auto { background: rgba(var(--ag-primary-rgb), 0.12); color: var(--ag-primary); }
.icon-manual {
  background: rgba(255,255,255,0.05);
  color: var(--ag-text-muted);
  border: 1px solid var(--ag-border);
}

.mode-title { font-size: 0.95rem; font-weight: 700; color: var(--ag-text); margin-bottom: 0.3rem; }

.mode-status { display: flex; align-items: center; gap: 0.45rem; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-on {
  background: var(--ag-primary);
  box-shadow: 0 0 6px var(--ag-primary);
  animation: pulse-dot 2s ease-in-out infinite;
}

.dot-off { background: var(--ag-text-muted); }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.status-on { font-size: 0.75rem; color: var(--ag-primary); font-weight: 500; }
.status-off { font-size: 0.75rem; color: var(--ag-text-muted); font-weight: 500; }
</style>
