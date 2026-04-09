<script setup lang="ts">
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';
import type { ActuatorLogEntry } from '@/types';

defineProps<{
  logs: ActuatorLogEntry[];
  hasMore: boolean;
}>();

const emit = defineEmits<{
  'infinite': [event: any];
}>();

const tagColor = (device: string) => {
  if (device === 'BOMBA' || device === 'WATER' || device === 'PUMP') return 'tag-pwr';
  if (device === 'VENTILADOR' || device === 'FAN') return 'tag-sys';
  if (device === 'LUZ' || device === 'LIGHT') return 'tag-ai';
  return 'tag-default';
};

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString('en-GB', { hour12: false });
};
</script>

<template>
  <div class="log-section">
    <div class="section-label">Activity Log</div>

    <div class="log-card">
      <!-- Header -->
      <div class="log-header">
        <div class="log-header-left">
          <div class="live-pill">
            <span class="live-dot"></span>
            <span>LIVE</span>
          </div>
        </div>
        <div class="traffic-lights">
          <span class="tl red"></span>
          <span class="tl yellow"></span>
          <span class="tl green"></span>
        </div>
      </div>

      <!-- Entries -->
      <div class="log-body">
        <div v-for="log in logs" :key="log.id" class="log-entry">
          <span class="log-time">{{ formatTime(log.created_at) }}</span>
          <span class="log-tag" :class="tagColor(log.device)">{{ log.device }}</span>
          <span class="log-msg">{{ log.action }}: {{ log.reason }}</span>
        </div>
        <div v-if="logs.length === 0" class="log-empty">No events recorded.</div>

        <ion-infinite-scroll 
          @ionInfinite="emit('infinite', $event)"
          :disabled="!hasMore"
          threshold="100px"
        >
          <ion-infinite-scroll-content loading-spinner="crescent"></ion-infinite-scroll-content>
        </ion-infinite-scroll>
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

.log-card {
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 20px;
  overflow: hidden;
}

/* Header */
.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--ag-border);
  background: rgba(0, 0, 0, 0.2);
}

.log-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.live-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--ag-primary);
}

.live-dot {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ag-primary);
  animation: blink 1.4s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.traffic-lights {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tl {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tl.red    { background: #ff5f57; }
.tl.yellow { background: #febc2e; }
.tl.green  { background: #28c840; }

/* Log body */
.log-body {
  padding: 0.75rem 0;
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
}

.log-entry {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.35rem 1.25rem;
  transition: background 0.15s ease;
}

.log-entry:hover {
  background: rgba(255, 255, 255, 0.025);
}

.log-time {
  font-size: 0.7rem;
  color: var(--ag-text-muted);
  flex-shrink: 0;
  opacity: 0.6;
}

.log-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}

.tag-ai   { background: rgba(var(--ag-primary-rgb), 0.12); color: var(--ag-primary); }
.tag-sys  { background: rgba(59, 130, 246, 0.12); color: var(--ag-blue); }
.tag-pwr  { background: rgba(245, 158, 11, 0.12); color: var(--ag-yellow); }
.tag-default { background: rgba(255,255,255,0.06); color: var(--ag-text-muted); }

.log-msg {
  font-size: 0.73rem;
  color: var(--ag-text-muted);
  line-height: 1.4;
}

.log-empty {
  padding: 1rem 1.25rem;
  font-size: 0.75rem;
  color: var(--ag-text-muted);
  font-style: italic;
}
</style>
