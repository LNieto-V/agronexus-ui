<script setup lang="ts">
import { ShieldCheck, Eye, Zap, ArrowRight, Lock, AlertTriangle } from 'lucide-vue-next';
import { computed } from 'vue';
import { useIotStore } from '@/stores/iotStore';
import type { ApiKeyType } from '@/types';

const iotStore = useIotStore();
const hasZoneSelected = computed(() => !!iotStore.selectedZoneId);
const selectedZoneName = computed(() => {
  if (!iotStore.selectedZoneId) return null;
  const zone = iotStore.zones.find(z => z.id === iotStore.selectedZoneId);
  return zone?.name || 'Unknown Zone';
});

defineEmits<{ generate: [type: ApiKeyType] }>();
</script>

<template>
  <div class="security-section">
    <div class="section-label">Hardware &amp; Security Management</div>

    <div class="security-card">
      <!-- Header -->
      <div class="security-header">
        <div class="header-icon-wrap">
          <ShieldCheck :size="22" class="header-icon" />
        </div>
        <div>
          <h4 class="header-title">Hardware Access Provisioning</h4>
          <p v-if="hasZoneSelected" class="header-desc">
            Provision secure API keys for <strong class="text-primary">{{ selectedZoneName }}</strong>.
          </p>
          <p v-else class="header-desc">
            Global scope — only <strong>read</strong> keys available. Select a zone for write access.
          </p>
        </div>
      </div>

      <div class="card-divider" />

      <!-- Key tiles -->
      <div class="keys-grid">
        <!-- Read Key -->
        <div class="key-tile read">
          <div class="key-tile-top">
            <div class="tile-icon read-icon"><Eye :size="18" /></div>
            <div class="tile-badge read-badge">READ ONLY</div>
          </div>
          <h5 class="tile-title">Telemetry Access</h5>
          <p class="tile-desc">Read-only access to sensor data and historical telemetry. Safe for dashboards.</p>
          <div v-if="!hasZoneSelected" class="scope-tag">GLOBAL SCOPE</div>
          <button class="tile-btn read-btn" @click="$emit('generate', 'read')" id="gen-read-key-btn">
            Generate Key <ArrowRight :size="14" class="btn-icon" />
          </button>
        </div>

        <!-- Write Key -->
        <div class="key-tile write" :class="{ 'tile-locked': !hasZoneSelected }">
          <div class="key-tile-top">
            <div class="tile-icon write-icon"><Zap :size="18" /></div>
            <div class="tile-badge write-badge">FULL ACCESS</div>
          </div>
          <h5 class="tile-title">Full Control</h5>
          <p class="tile-desc">Full access to actuators and system configuration. Requires a specific zone.</p>
          <p v-if="!hasZoneSelected" class="lock-msg">
            <AlertTriangle :size="14" /> Select a zone first
          </p>
          <button
            class="tile-btn write-btn"
            :disabled="!hasZoneSelected"
            @click="$emit('generate', 'write')"
            id="gen-write-key-btn"
          >
            Generate Key <ArrowRight :size="14" class="btn-icon" />
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="security-footer">
        <Lock :size="14" class="footer-icon" />
        <span class="footer-text">SHA-256 HMAC · End-to-End Encrypted · Keys shown once</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.security-section { margin-top: 2.5rem; }

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ag-text-muted);
  margin-bottom: 1rem;
}

.security-card {
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 20px;
  overflow: hidden;
}

.security-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 1.75rem;
}

.header-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(var(--ag-primary-rgb), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon { color: var(--ag-primary); }

.header-title { font-size: 1rem; font-weight: 700; color: var(--ag-text); margin: 0 0 0.25rem; }
.header-desc { font-size: 0.8rem; color: var(--ag-text-muted); margin: 0; line-height: 1.4; }

.card-divider { height: 1px; background: var(--ag-border); margin: 0 1.75rem; }

.keys-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--ag-border);
}

@media (max-width: 540px) { .keys-grid { grid-template-columns: 1fr; } }

.key-tile {
  background: var(--ag-card);
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: background 0.2s ease;
}

.key-tile:hover { background: var(--ag-card-hover); }

.key-tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tile-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.read-icon { background: rgba(59,130,246,0.12); color: var(--ag-blue); }
.write-icon { background: rgba(249,115,22,0.12); color: var(--ag-orange); }

.tile-badge {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.read-badge { background: rgba(59,130,246,0.1); color: var(--ag-blue); border: 1px solid rgba(59,130,246,0.2); }
.write-badge { background: rgba(249,115,22,0.1); color: var(--ag-orange); border: 1px solid rgba(249,115,22,0.2); }

.tile-title { font-size: 0.95rem; font-weight: 700; color: var(--ag-text); margin: 0; }
.tile-desc { font-size: 0.78rem; color: var(--ag-text-muted); line-height: 1.5; margin: 0; flex-grow: 1; }

.tile-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  font-family: inherit;
  align-self: flex-start;
}

.tile-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.read-btn { color: var(--ag-blue); border-color: rgba(59,130,246,0.25); }
.read-btn:hover:not(:disabled) { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.5); }

.write-btn { color: var(--ag-orange); border-color: rgba(249,115,22,0.25); }
.write-btn:hover:not(:disabled) { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.5); }

.btn-icon { transition: transform 0.2s; }
.tile-btn:hover:not(:disabled) .btn-icon { transform: translateX(3px); }

.security-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.75rem;
  background: rgba(0,0,0,0.25);
  border-top: 1px solid var(--ag-border);
}

.footer-icon { color: var(--ag-primary); flex-shrink: 0; }
.footer-text { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; color: var(--ag-text-muted); }

.scope-tag {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  background: rgba(var(--ag-primary-rgb), 0.1);
  color: var(--ag-primary);
  border: 1px solid rgba(var(--ag-primary-rgb), 0.2);
  align-self: flex-start;
}

.tile-locked { opacity: 0.45; }

.lock-msg {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ag-yellow);
  margin: 0;
}
</style>
