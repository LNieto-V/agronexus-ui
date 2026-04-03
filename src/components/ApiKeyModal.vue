<template>
  <div class="modal-wrapper p-6">
    <div class="text-center mb-6">
      <div class="icon-circle mx-auto mb-4">
        <ion-icon :icon="keyOutline" class="text-3xl text-primary" />
      </div>
      <h2 class="text-2xl font-bold">API Key Generated</h2>
      <p class="text-sm text-muted mt-2">
        Copy this key now. For your security, it will <strong>not be shown again</strong>.
      </p>
    </div>

    <div class="key-display ag-card p-4 mb-6 ag-flex-between">
      <code class="text-primary font-mono break-all">{{ apiKey }}</code>
      <ion-button fill="clear" @click="copyKey" class="copy-btn">
        <ion-icon :icon="copied ? checkmarkOutline : copyOutline" slot="icon-only" />
      </ion-button>
    </div>

    <div class="ag-alert mb-8 p-4 rounded-xl border border-yellow-soft bg-yellow-soft/10">
      <div class="ag-flex-row gap-3">
        <ion-icon :icon="warningOutline" class="text-yellow text-xl" />
        <p class="text-xs text-yellow/80 leading-relaxed">
          Anyone with this key can access your agricultural data. Never share it or commit it to version control.
        </p>
      </div>
    </div>

    <ion-button expand="block" class="premium-btn" @click="close">
      I've Saved It
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { 
  IonIcon, IonButton, modalController, toastController 
} from '@ionic/vue';
import { 
  keyOutline, copyOutline, checkmarkOutline, warningOutline 
} from 'ionicons/icons';
import { ref } from 'vue';
import { Clipboard } from '@capacitor/clipboard';

const props = defineProps<{
  apiKey: string;
}>();

const copied = ref(false);

const copyKey = async () => {
  try {
    await Clipboard.write({
      string: props.apiKey
    });
    copied.value = true;
    const toast = await toastController.create({
      message: 'Key copied to clipboard!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
    setTimeout(() => { copied.value = false; }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

const close = () => {
  modalController.dismiss();
};
</script>

<style scoped>
.modal-wrapper {
  background: var(--ag-card-bg);
  color: white;
}

.icon-circle {
  width: 64px;
  height: 64px;
  background: var(--ag-primary-soft);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.key-display {
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed var(--ag-border);
}

.copy-btn {
  --color: var(--ag-primary);
}

.ag-alert {
  border-color: rgba(255, 183, 77, 0.2);
}

.premium-btn {
  --background: var(--ag-primary);
  --border-radius: 12px;
  height: 52px;
  font-weight: 700;
}
</style>
