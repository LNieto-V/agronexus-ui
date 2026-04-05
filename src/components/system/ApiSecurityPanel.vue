<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';
import { 
  shieldCheckmarkOutline, 
  eyeOutline, 
  flashOutline, 
  arrowForwardOutline,
  lockClosedOutline
} from 'ionicons/icons';
import type { ApiKeyType } from '@/types';

defineEmits<{
  generate: [type: ApiKeyType]
}>();
</script>

<template>
  <div class="security-section">
    <div class="section-label">Security & API Access</div>

    <!-- Main Card -->
    <div class="security-card">
      
      <!-- Header -->
      <div class="security-header">
        <div class="header-icon-wrap">
          <ion-icon :icon="shieldCheckmarkOutline" class="header-icon" />
        </div>
        <div class="header-text">
          <h4 class="header-title">Developer Gateway</h4>
          <p class="header-desc">Provision secure API keys for external integrations & IoT protocols.</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="card-divider"></div>

      <!-- Key Types -->
      <div class="keys-grid">

        <!-- Read Key -->
        <div class="key-tile read">
          <div class="key-tile-top">
            <div class="tile-icon read-icon">
              <ion-icon :icon="eyeOutline" />
            </div>
            <div class="tile-badge read-badge">READ ONLY</div>
          </div>
          <h5 class="tile-title">Telemetry Access</h5>
          <p class="tile-desc">Read-only access to sensor data and historical telemetry. Safe for dashboards.</p>
          <button class="tile-btn read-btn" @click="$emit('generate', 'read')">
            Generate Key
            <ion-icon :icon="arrowForwardOutline" class="btn-icon" />
          </button>
        </div>

        <!-- Write Key -->
        <div class="key-tile write">
          <div class="key-tile-top">
            <div class="tile-icon write-icon">
              <ion-icon :icon="flashOutline" />
            </div>
            <div class="tile-badge write-badge">FULL ACCESS</div>
          </div>
          <h5 class="tile-title">Full Control</h5>
          <p class="tile-desc">Full access to actuators and system configuration. Elevated security required.</p>
          <button class="tile-btn write-btn" @click="$emit('generate', 'write')">
            Generate Key
            <ion-icon :icon="arrowForwardOutline" class="btn-icon" />
          </button>
        </div>

      </div>

      <!-- Footer -->
      <div class="security-footer">
        <ion-icon :icon="lockClosedOutline" class="footer-icon" />
        <span class="footer-text">SHA-256 HMAC · End-to-End Encrypted · Keys shown once</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.security-section {
  margin-top: 2.5rem;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ag-text-muted);
  margin-bottom: 1rem;
}

/* ── Main Card ── */
.security-card {
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 20px;
  overflow: hidden;
}

/* ── Header ── */
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

.header-icon {
  font-size: 1.375rem;
  color: var(--ag-primary);
}

.header-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ag-text);
  margin: 0 0 0.25rem;
}

.header-desc {
  font-size: 0.8rem;
  color: var(--ag-text-muted);
  margin: 0;
  line-height: 1.4;
}

/* ── Divider ── */
.card-divider {
  height: 1px;
  background: var(--ag-border);
  margin: 0 1.75rem;
}

/* ── Keys Grid ── */
.keys-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--ag-border);
}

@media (max-width: 540px) {
  .keys-grid { grid-template-columns: 1fr; }
}

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

/* Icons */
.tile-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.read-icon { 
  background: rgba(59, 130, 246, 0.12); 
  color: var(--ag-blue); 
}

.write-icon { 
  background: rgba(249, 115, 22, 0.12); 
  color: var(--ag-orange); 
}

/* Badges */
.tile-badge {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.read-badge {
  background: rgba(59, 130, 246, 0.1);
  color: var(--ag-blue);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.write-badge {
  background: rgba(249, 115, 22, 0.1);
  color: var(--ag-orange);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

/* Text */
.tile-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ag-text);
  margin: 0;
}

.tile-desc {
  font-size: 0.78rem;
  color: var(--ag-text-muted);
  line-height: 1.5;
  margin: 0;
  flex-grow: 1;
}

/* Buttons */
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

.read-btn {
  color: var(--ag-blue);
  border-color: rgba(59, 130, 246, 0.25);
}
.read-btn:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.5);
}

.write-btn {
  color: var(--ag-orange);
  border-color: rgba(249, 115, 22, 0.25);
}
.write-btn:hover {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.5);
}

.btn-icon {
  font-size: 0.85rem;
  transition: transform 0.2s ease;
}
.tile-btn:hover .btn-icon { transform: translateX(3px); }

/* ── Footer ── */
.security-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.75rem;
  background: rgba(0, 0, 0, 0.25);
  border-top: 1px solid var(--ag-border);
}

.footer-icon {
  font-size: 0.85rem;
  color: var(--ag-primary);
  flex-shrink: 0;
}

.footer-text {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--ag-text-muted);
}
</style>
