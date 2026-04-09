<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonList, IonItemSliding, IonItemOptions, 
  IonItemOption, modalController, toastController, IonSpinner
} from '@ionic/vue';
import { 
  addOutline, trashOutline, createOutline, 
  closeOutline, leafOutline, businessOutline 
} from 'ionicons/icons';
import { useIotStore } from '@/stores/iotStore';
import type { Zone } from '@/types';

const iotStore = useIotStore();
const isCreating = ref(false);
const editingZoneId = ref<string | null>(null);

const form = ref({
  name: '',
  crop_type: ''
});

const isSubmitting = ref(false);

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
      showToast('Zone updated successfully');
    } else {
      await iotStore.createZone(form.value.name, form.value.crop_type);
      showToast('New zone created');
    }
    resetForm();
  } catch (error) {
    showToast('Operation failed', 'danger');
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
    showToast('Zone deleted');
  } catch (error) {
    showToast('Could not delete zone', 'danger');
  }
}

async function showToast(message: string, color = 'success') {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'bottom'
  });
  await toast.present();
}

function dismiss() {
  modalController.dismiss();
}
</script>

<template>
  <div class="zone-manager">
    <div class="modal-header">
      <div class="header-content">
        <div class="icon-wrap">
          <ion-icon :icon="businessOutline" />
        </div>
        <div>
          <h3>Infrastructure Manager</h3>
          <p>Manage greenhouse zones and crop types</p>
        </div>
      </div>
      <button @click="dismiss" class="close-btn">
        <ion-icon :icon="closeOutline" />
      </button>
    </div>

    <div class="modal-body">
      
      <!-- List Section -->
      <div v-if="!isCreating" class="list-section">
        <div class="section-label">Existing Zones</div>
        
        <div v-if="iotStore.zones.length === 0" class="empty-state">
          <ion-icon :icon="leafOutline" />
          <p>No zones configured yet.</p>
        </div>

        <ion-list class="zone-list" lines="none">
          <ion-item-sliding v-for="zone in iotStore.zones" :key="zone.id">
            <ion-item class="zone-item ag-glass mb-3">
              <div class="zone-info">
                <span class="zone-name">{{ zone.name }}</span>
                <span class="zone-crop">{{ zone.crop_type || 'No crop set' }}</span>
              </div>
              <div slot="end" class="item-actions">
                <button @click="startEdit(zone)" class="action-btn edit">
                  <ion-icon :icon="createOutline" />
                </button>
              </div>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="danger" @click="handleDelete(zone.id)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>

        <ion-button expand="block" class="add-btn mt-6" @click="isCreating = true">
          <ion-icon :icon="addOutline" slot="start" />
          Add New Zone
        </ion-button>
      </div>

      <!-- Form Section -->
      <div v-else class="form-section animate-slide-in">
        <div class="section-label">{{ editingZoneId ? 'Edit Zone' : 'New Zone Details' }}</div>
        
        <div class="ag-flex-col gap-4">
          <div class="input-wrap">
            <label>Zone Name</label>
            <ion-input 
              v-model="form.name" 
              placeholder="e.g. Greenhouse Beta" 
              class="ag-input"
            />
          </div>

          <div class="input-wrap">
            <label>Crop Type</label>
            <ion-input 
              v-model="form.crop_type" 
              placeholder="e.g. Hydroponic Strawberries" 
              class="ag-input"
            />
          </div>

          <div class="form-actions mt-4">
            <ion-button fill="clear" color="medium" @click="resetForm">Cancel</ion-button>
            <ion-button 
              class="premium-btn" 
              @click="handleSubmit" 
              :disabled="!form.name || isSubmitting"
            >
              <ion-spinner v-if="isSubmitting" name="crescent" slot="start" />
              {{ editingZoneId ? 'Update Zone' : 'Create Infrastructure' }}
            </ion-button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.zone-manager {
  background: var(--ag-bg);
  height: 100%;
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

.header-content {
  display: flex;
  gap: 1rem;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  background: rgba(var(--ag-primary-rgb), 0.1);
  color: var(--ag-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.header-content h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.header-content p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: var(--ag-text-muted);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--ag-text-muted);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ag-primary);
  margin-bottom: 1.25rem;
}

.zone-list {
  background: transparent;
}

.zone-item {
  --background: var(--ag-card);
  --border-radius: 12px;
  --padding-start: 1rem;
  --padding-end: 0.5rem;
}

.zone-info {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
}

.zone-name {
  font-weight: 700;
  font-size: 1rem;
}

.zone-crop {
  font-size: 0.75rem;
  color: var(--ag-text-muted);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

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
}

.action-btn:hover {
  background: rgba(var(--ag-primary-rgb), 0.15);
  color: var(--ag-primary);
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--ag-text-muted);
}

.empty-state ion-icon {
  font-size: 3rem;
  opacity: 0.2;
  margin-bottom: 1rem;
}

.add-btn {
  --background: var(--ag-card);
  --color: var(--ag-primary);
  --border-color: var(--ag-border);
  --border-style: solid;
  --border-width: 1px;
  --border-radius: 12px;
  font-weight: 700;
}

.input-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-wrap label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ag-text-muted);
}

.ag-input {
  --background: var(--ag-card);
  --padding-start: 1rem;
  --padding-end: 1rem;
  --border-radius: 10px;
  border: 1px solid var(--ag-border);
}

.premium-btn {
  --background: var(--ag-primary);
  --border-radius: 10px;
  font-weight: 700;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
