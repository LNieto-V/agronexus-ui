<script setup lang="ts">
import { shallowRef } from 'vue';
import { Key, Copy, Check, AlertTriangle } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';
import { useModal } from '@/composables/useModal';

const props = defineProps<{
  apiKey: string;
}>();

const emit = defineEmits<{ close: [] }>();

const copied = shallowRef(false);
const { showToast } = useToast();
const { closeModal } = useModal();

const copyKey = async () => {
  try {
    await navigator.clipboard.writeText(props.apiKey);
    copied.value = true;
    showToast('Key copied to clipboard!', 'success', 2000);
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    showToast('Failed to copy key', 'danger', 2000);
  }
};

const close = () => {
  emit('close');
  closeModal();
};
</script>

<template>
  <div class="modal-wrapper p-6">
    <div class="text-center mb-6">
      <div class="icon-circle mx-auto mb-4">
        <Key :size="28" class="text-primary" />
      </div>
      <h2 class="text-2xl font-bold">API Key Generated</h2>
      <p class="text-sm text-muted mt-2">
        This is the only time you'll see this master key.
        <strong>Copy it and burn it into your ESP32.</strong>
      </p>
    </div>

    <div class="key-display ag-card p-4 mb-6 ag-flex-between">
      <code class="text-primary font-mono break-all text-sm">{{ apiKey }}</code>
      <button class="copy-btn" @click="copyKey" :title="copied ? 'Copied!' : 'Copy'">
        <Check v-if="copied" :size="18" class="text-primary" />
        <Copy v-else :size="18" />
      </button>
    </div>

    <div class="ag-alert mb-6 p-4 rounded-xl">
      <div class="ag-flex-row gap-3">
        <AlertTriangle :size="18" class="text-yellow flex-shrink-0 mt-0.5" />
        <p class="text-xs text-muted leading-relaxed">
          This key grants direct access to your greenhouse telemetry. Guard it like your harvest
          — never share it or commit it to version control.
        </p>
      </div>
    </div>

    <button id="api-key-close-btn" class="premium-btn w-full" @click="close">
      I've Saved It
    </button>
  </div>
</template>

<style scoped>
.modal-wrapper {
  color: var(--ag-text);
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
  gap: 0.75rem;
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--ag-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.2s;
}

.copy-btn:hover { color: var(--ag-primary); }

.ag-alert {
  border: 1px solid rgba(245, 158, 11, 0.2);
  background: rgba(245, 158, 11, 0.05);
}

.text-yellow { color: var(--ag-yellow); }

.premium-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  background: var(--ag-primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.premium-btn:hover { background: var(--ag-primary-hover); }

.w-full { width: 100%; }
.mx-auto { margin-left: auto; margin-right: auto; }
.flex-shrink-0 { flex-shrink: 0; }
.mt-0-5 { margin-top: 0.125rem; }
</style>
