<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Trash2, Pencil, X, Leaf, Building2, Copy } from 'lucide-vue-next';
import { useIotStore } from '@/stores/iotStore';
import { useModal } from '@/composables/useModal';
import { useToast } from '@/composables/useToast';
import AppSpinner from '@/components/AppSpinner.vue';
import type { Zone } from '@/types';

const iotStore = useIotStore();
const { closeModal } = useModal();
const { showToast } = useToast();

const isCreating = ref(false);
const editingZoneId = ref<string | null>(null);
const isSubmitting = ref(false);

const form = ref({ name: '', crop_type: '' });

function resetForm() {
  form.value = { name: '', crop_type: '' };
  isCreating.value = false;
  editingZoneId.value = null;
}

async function handleSubmit() {
  if (!form.value.name) return;
  isSubmitting.value = true;
  try {
    if (editingZoneId.value) {
      await iotStore.updateZone(editingZoneId.value, form.value.name, form.value.crop_type);
      showToast('Zone updated successfully', 'success', 2000);
    } else {
      await iotStore.createZone(form.value.name, form.value.crop_type);
      showToast('New zone created', 'success', 2000);
    }
    resetForm();
  } catch {
    showToast('Operation failed', 'danger', 2000);
  } finally {
    isSubmitting.value = false;
  }
}

function startEdit(zone: Zone) {
  form.value = { name: zone.name, crop_type: zone.crop_type || '' };
  editingZoneId.value = zone.id;
  isCreating.value = true;
}

async function handleDelete(id: string) {
  try {
    await iotStore.deleteZone(id);
    showToast('Zone deleted', 'success', 2000);
  } catch {
    showToast('Could not delete zone', 'danger', 2000);
  }
}

async function copyId(id: string) {
  await navigator.clipboard.writeText(id);
  showToast('UUID copied to clipboard', 'success', 2000);
}

function dismiss() {
  closeModal();
}
</script>

<template>
  <div class="zone-manager">
    <div class="modal-header">
      <div class="header-content">
        <div class="icon-wrap">
          <Building2 :size="22" />
        </div>
        <div>
          <h3>Infrastructure Manager</h3>
          <p>Manage greenhouse zones and crop types</p>
        </div>
      </div>
      <button class="close-btn" @click="dismiss" id="zone-manager-close" aria-label="Close">
        <X :size="20" />
      </button>
    </div>

    <div class="modal-body">

      <!-- Zone List -->
      <div v-if="!isCreating">
        <div class="section-label">Existing Zones</div>

        <div v-if="iotStore.zones.length === 0" class="empty-state">
          <Leaf :size="48" class="empty-icon" />
          <p>No zones configured yet.</p>
        </div>

        <div class="zone-list">
          <div v-for="zone in iotStore.zones" :key="zone.id" class="zone-item ag-glass">
            <div class="zone-info">
              <span class="zone-name">{{ zone.name }}</span>
              <span class="zone-crop">{{ zone.crop_type || 'No crop set' }}</span>
              <div class="zone-uuid-container" @click="copyId(zone.id)">
                <span class="zone-uuid">ID: {{ zone.id }}</span>
                <Copy :size="11" class="copy-icon" />
              </div>
            </div>
            <div class="item-actions">
              <button class="action-btn" @click="startEdit(zone)" :title="`Edit ${zone.name}`">
                <Pencil :size="14" />
              </button>
              <button class="action-btn danger" @click="handleDelete(zone.id)" :title="`Delete ${zone.name}`">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>

        <button id="add-zone-btn" class="add-btn" @click="isCreating = true">
          <Plus :size="18" />
          Add New Zone
        </button>
      </div>

      <!-- Form -->
      <div v-else class="form-section animate-slide-in">
        <div class="section-label">{{ editingZoneId ? 'Edit Zone' : 'New Zone Details' }}</div>

        <div class="ag-flex-col gap-4">
          <div class="input-wrap">
            <label for="zone-name">Zone Name</label>
            <input
              id="zone-name"
              v-model="form.name"
              type="text"
              placeholder="e.g. Greenhouse Beta"
              class="ag-native-input"
            />
          </div>

          <div class="input-wrap">
            <label for="zone-crop">Crop Type</label>
            <input
              id="zone-crop"
              v-model="form.crop_type"
              type="text"
              placeholder="e.g. Hydroponic Strawberries"
              class="ag-native-input"
            />
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="resetForm">Cancel</button>
            <button
              id="zone-submit-btn"
              class="submit-btn"
              @click="handleSubmit"
              :disabled="!form.name || isSubmitting"
            >
              <AppSpinner v-if="isSubmitting" size="sm" />
              {{ editingZoneId ? 'Update Zone' : 'Create Infrastructure' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.zone-manager {
  background: var(--ag-bg);
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--ag-border);
}

.header-content { display: flex; gap: 1rem; align-items: flex-start; }

.icon-wrap {
  width: 44px;
  height: 44px;
  background: rgba(var(--ag-primary-rgb), 0.1);
  color: var(--ag-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-content h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.header-content p { margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--ag-text-muted); }

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--ag-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover { background: rgba(255,255,255,0.06); color: var(--ag-text); }

.modal-body { padding: 1.5rem; flex-grow: 1; overflow-y: auto; }

.section-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ag-primary);
  margin-bottom: 1.25rem;
}

.zone-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }

.zone-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-radius: 12px;
}

.zone-info { display: flex; flex-direction: column; gap: 0.2rem; }
.zone-name { font-weight: 700; font-size: 1rem; }
.zone-crop { font-size: 0.75rem; color: var(--ag-text-muted); }

.zone-uuid-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  background: rgba(255,255,255,0.05);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  width: fit-content;
  transition: all 0.2s;
}

.zone-uuid-container:hover { background: rgba(var(--ag-primary-rgb), 0.1); color: var(--ag-primary); }
.zone-uuid { font-family: 'Courier New', monospace; font-size: 0.63rem; opacity: 0.7; }
.copy-icon { opacity: 0.5; }

.item-actions { display: flex; gap: 0.5rem; }

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255,255,255,0.05);
  color: var(--ag-text-muted);
  transition: all 0.2s;
}

.action-btn:hover { background: rgba(var(--ag-primary-rgb), 0.15); color: var(--ag-primary); }
.action-btn.danger:hover { background: rgba(239,68,68,0.15); color: var(--ag-red); }

.empty-state { text-align: center; padding: 3rem 0; color: var(--ag-text-muted); }
.empty-icon { opacity: 0.2; margin-bottom: 1rem; }

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  color: var(--ag-primary);
  font-weight: 700;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover { background: rgba(var(--ag-primary-rgb), 0.06); border-color: rgba(var(--ag-primary-rgb), 0.3); }

.input-wrap { display: flex; flex-direction: column; gap: 0.5rem; }
.input-wrap label { font-size: 0.8rem; font-weight: 600; color: var(--ag-text-muted); }

.ag-native-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 10px;
  color: var(--ag-text);
  font-family: var(--ag-font);
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.ag-native-input:focus {
  border-color: var(--ag-primary);
  box-shadow: 0 0 0 3px rgba(var(--ag-primary-rgb), 0.1);
}

.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem; }

.cancel-btn {
  background: transparent;
  border: 1px solid var(--ag-border);
  border-radius: 10px;
  color: var(--ag-text-muted);
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover { background: rgba(255,255,255,0.04); color: var(--ag-text); }

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--ag-primary);
  border: none;
  border-radius: 10px;
  color: white;
  padding: 0.625rem 1.5rem;
  font-weight: 700;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) { background: var(--ag-primary-hover); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.animate-slide-in { animation: slideIn 0.3s ease-out; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
