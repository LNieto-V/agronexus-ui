<script setup lang="ts">
import { ref, watch } from 'vue';
import { useIotStore } from '@/stores/iotStore';
import { useConversationsStore } from '@/stores/conversationsStore';
import { useRouter } from 'vue-router';
import AppSelect from '@/components/AppSelect.vue';
import AppSpinner from '@/components/AppSpinner.vue';
import {
  Sparkles, Clock, Layers, BarChart2, X
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const iotStore = useIotStore();
const convStore = useConversationsStore();
const router = useRouter();

const selectedZoneId = ref<string | null>(null);
const selectedFocus = ref('general');
const selectedHours = ref(24);
const isGenerating = ref(false);

const focusOptions = [
  { id: 'general', label: 'Salud General', icon: Sparkles },
  { id: 'nutrition', label: 'Nutrición (pH/EC)', icon: BarChart2 },
  { id: 'clima', label: 'Clima y VPD', icon: Clock },
  { id: 'riego', label: 'Riego y Reservorios', icon: Layers },
];

const hourOptions = [
  { value: 24, label: 'Últimas 24 Horas' },
  { value: 48, label: 'Últimas 48 Horas' },
  { value: 168, label: 'Última Semana' },
];

// Initialize zone based on iotStore selection when modal opens
watch(() => props.isOpen, (open) => {
  if (open) {
    selectedZoneId.value = iotStore.selectedZoneId;
  }
});

async function generateReport() {
  if (isGenerating.value) return;
  isGenerating.value = true;

  try {
    const sessionId = await convStore.generateDiagnosticReport(
      selectedZoneId.value,
      selectedHours.value,
      selectedFocus.value
    );
    emit('close');
    router.push({ path: '/tabs/assistant', query: { session: sessionId } });
  } catch (err) {
    console.error(err);
  } finally {
    isGenerating.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="dialog-backdrop" @click.self="$emit('close')">
        <div class="dialog-box" @click.stop>
          <div class="dialog-header mb-6">
            <h2 class="text-xl font-bold tracking-tight">
              Generar <span class="text-primary">Informe IA</span>
            </h2>
            <button class="icon-btn" @click="$emit('close')" :disabled="isGenerating"><X :size="20" /></button>
          </div>

          <p class="text-muted text-sm mb-6">
            Selecciona los parámetros para que nuestra IA analice tu cultivo y genere un diagnóstico en el chat.
          </p>

          <div class="ag-grid md:ag-grid-2 gap-4 mb-6">
            <div class="config-card">
              <div class="ag-flex-row gap-2 mb-3">
                <div class="ag-icon-box bg-primary-soft text-primary">
                  <Layers :size="16" />
                </div>
                <h3 class="font-bold text-sm">Zona de Monitoreo</h3>
              </div>
              <AppSelect
                v-model="selectedZoneId"
                :options="[{ value: null, label: 'Todo el Invernadero' }, ...iotStore.zones.map(z => ({ value: z.id, label: z.name }))]"
                placeholder="Seleccionar Zona"
              />
            </div>

            <div class="config-card">
              <div class="ag-flex-row gap-2 mb-3">
                <div class="ag-icon-box bg-blue-soft text-blue">
                  <Clock :size="16" />
                </div>
                <h3 class="font-bold text-sm">Rango de Análisis</h3>
              </div>
              <div class="hour-chips">
                <button
                  v-for="opt in hourOptions"
                  :key="opt.value"
                  class="hour-chip"
                  :class="{ active: selectedHours === opt.value }"
                  @click="selectedHours = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="font-bold mb-3 text-xs uppercase tracking-widest text-muted">
              Enfoque del Diagnóstico
            </h3>
            <div class="ag-grid sm:ag-grid-2 md:ag-grid-4 gap-3">
              <button
                v-for="focus in focusOptions"
                :key="focus.id"
                class="focus-card"
                :class="{ 'focus-active': selectedFocus === focus.id }"
                @click="selectedFocus = focus.id"
              >
                <component :is="focus.icon" :size="16" />
                <span class="font-bold text-xs">{{ focus.label }}</span>
              </button>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-muted">
            <button
              class="generate-btn"
              @click="generateReport"
              :disabled="isGenerating"
            >
              <AppSpinner v-if="isGenerating" size="sm" />
              <Sparkles v-else :size="16" />
              <span>{{ isGenerating ? 'Analizando...' : 'Generar Informe' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 4000;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.dialog-box {
  background: var(--ag-bg);
  border: 1px solid var(--ag-border);
  border-radius: 20px;
  padding: 1.5rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--ag-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.icon-btn:hover { background: rgba(255,255,255,0.05); color: var(--ag-text); }
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.config-card {
  background: var(--ag-card);
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid var(--ag-border);
}

.hour-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hour-chip {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--ag-border);
  border-radius: 9999px;
  background: transparent;
  color: var(--ag-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.hour-chip.active {
  background: rgba(var(--ag-primary-rgb), 0.12);
  border-color: var(--ag-primary);
  color: var(--ag-primary);
}

.focus-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  color: var(--ag-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  opacity: 0.7;
}

.focus-card:hover { opacity: 0.9; background: rgba(255,255,255,0.04); }

.focus-active {
  background: rgba(var(--ag-primary-rgb), 0.1);
  border-color: var(--ag-primary);
  color: var(--ag-primary);
  opacity: 1;
  box-shadow: 0 4px 12px -5px rgba(var(--ag-primary-rgb), 0.2);
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--ag-primary);
  border: none;
  border-radius: 12px;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(var(--ag-primary-rgb), 0.3);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(var(--ag-primary-rgb), 0.4);
}

.generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.border-muted { border-color: var(--ag-border); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .hour-chips { justify-content: space-between; }
  .hour-chip { flex: 1 1 30%; text-align: center; }
  .generate-btn { width: 100%; }
}
</style>
