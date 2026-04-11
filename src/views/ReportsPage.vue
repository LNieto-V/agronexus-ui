<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIotStore } from '@/stores/iotStore';
import { chatService, conversationService } from '@/services/api';
import { useToast } from '@/composables/useToast';
import { useRouter } from 'vue-router';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import ReportPdfTemplate from '@/components/ReportPdfTemplate.vue';
import AppSelect from '@/components/AppSelect.vue';
import AppSpinner from '@/components/AppSpinner.vue';
import {
  Sparkles, Clock, Layers, BarChart2,
  CheckCircle, MessageCircle, RefreshCw, Download
} from 'lucide-vue-next';

const iotStore = useIotStore();
const router = useRouter();
const { showToast } = useToast();

const selectedZoneId = ref<string | null>(null);
const selectedFocus = ref('general');
const selectedHours = ref(24);
const isGenerating = ref(false);
const reportContent = ref<string | null>(null);
const currentSessionId = ref<string | null>(null);

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

async function generateReport() {
  if (isGenerating.value) return;
  isGenerating.value = true;
  reportContent.value = null;

  try {
    const focusLabel = focusOptions.find(f => f.id === selectedFocus.value)?.label || 'General';
    const sessionTitle = `Informe ${focusLabel} - ${new Date().toLocaleDateString()}`;
    const sessionRes = await conversationService.createConversation(sessionTitle);
    currentSessionId.value = sessionRes.data.id;

    const response = await chatService.generateReport({
      zone_id: selectedZoneId.value,
      hours: selectedHours.value,
      focus: selectedFocus.value,
      session_id: currentSessionId.value
    });

    reportContent.value = response.data.response;
    showToast('Análisis generado con éxito', 'success', 2000);
  } catch (error: any) {
    const is429 = error.response?.status === 429;
    const message = is429
      ? 'El servicio de análisis de IA está al máximo de capacidad. Por favor, reintenta en unos segundos.'
      : 'Error al conectar con el Asesor IA. Reintenta.';
    showToast(message, is429 ? 'warning' : 'danger', is429 ? 5000 : 3000);
    console.error('Report error:', error);
  } finally {
    isGenerating.value = false;
  }
}

function goToChat() {
  if (currentSessionId.value) {
    router.push({ path: '/tabs/assistant', query: { session: currentSessionId.value } });
  }
}

async function downloadPdf() {
  const element = document.getElementById('printable-report-template');
  if (!element) return;
  const options = {
    margin: 10,
    filename: `AgroNexus_Reporte_${selectedFocus.value}_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  try {
    // @ts-ignore — html2pdf is loaded globally via CDN
    await window.html2pdf().from(element).set(options).save();
    showToast('PDF generado correctamente', 'success', 2000);
  } catch (err) {
    console.error('PDF Error:', err);
  }
}

onMounted(() => iotStore.fetchZones());
</script>

<template>
  <div class="page-scroll">
    <div class="ag-container py-6">

      <!-- Config step -->
      <div v-if="!reportContent" class="config-step">
        <div class="mb-8">
          <h1 class="text-3xl font-black mb-2 tracking-tight">
            Generar <span class="text-primary">Informe IA</span>
          </h1>
          <p class="text-muted text-sm">
            Selecciona los parámetros para que nuestra IA analice tu cultivo.
          </p>
        </div>

        <!-- Zone + Time range -->
        <div class="ag-grid md:ag-grid-2 gap-6" style="position: relative; z-index: 50;">
          <div class="ag-card ag-glass p-6" style="z-index: 51;">
            <div class="ag-flex-row gap-3 mb-4">
              <div class="ag-icon-box bg-primary-soft text-primary">
                <Layers :size="18" />
              </div>
              <h3 class="font-bold">Zona de Monitoreo</h3>
            </div>
            <AppSelect
              v-model="selectedZoneId"
              :options="[{ value: null, label: 'Todo el Invernadero' }, ...iotStore.zones.map(z => ({ value: z.id, label: z.name }))]"
              placeholder="Seleccionar Zona"
            />
          </div>

          <div class="ag-card ag-glass p-6">
            <div class="ag-flex-row gap-3 mb-4">
              <div class="ag-icon-box bg-blue-soft text-blue">
                <Clock :size="18" />
              </div>
              <h3 class="font-bold">Rango de Análisis</h3>
            </div>
            <div class="hour-chips">
              <button
                v-for="opt in hourOptions"
                :key="opt.value"
                class="hour-chip"
                :class="{ active: selectedHours === opt.value }"
                @click="selectedHours = opt.value"
                :id="`hour-${opt.value}`"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Focus area -->
        <div class="mt-8">
          <h3 class="font-bold mb-4 text-xs uppercase tracking-widest text-muted">
            Enfoque del Diagnóstico
          </h3>
          <div class="ag-grid sm:ag-grid-2 md:ag-grid-4 gap-4">
            <button
              v-for="focus in focusOptions"
              :key="focus.id"
              class="focus-card"
              :class="{ 'focus-active': selectedFocus === focus.id }"
              @click="selectedFocus = focus.id"
              :id="`focus-${focus.id}`"
            >
              <component :is="focus.icon" :size="20" />
              <span class="font-bold text-sm">{{ focus.label }}</span>
            </button>
          </div>
        </div>

        <!-- Generate button -->
        <div class="mt-12 flex justify-center">
          <button
            id="generate-report-btn"
            class="generate-btn"
            @click="generateReport"
            :disabled="isGenerating"
          >
            <AppSpinner v-if="isGenerating" size="sm" />
            <Sparkles v-else :size="18" />
            <span>{{ isGenerating ? 'Analizando...' : 'Generar Informe' }}</span>
          </button>
        </div>
      </div>

      <!-- Report result -->
      <div v-else class="report-result pb-20">
        <div class="ag-flex-between flex-wrap gap-4 mb-6">
          <div class="ag-flex-row gap-3">
            <button class="icon-btn" @click="reportContent = null" title="Nueva consulta">
              <RefreshCw :size="18" />
            </button>
            <div>
              <h2 class="text-2xl font-black">Tu Informe <span class="text-primary">IA</span></h2>
              <div class="ag-flex-row gap-2 items-center">
                <span class="status-dot bg-primary" />
                <p class="text-xs text-muted uppercase tracking-widest font-bold">Generado mediante Gemini Pro</p>
              </div>
            </div>
          </div>

          <div class="ag-flex-row gap-2 no-print flex-wrap">
            <button id="download-pdf-btn" class="action-btn outline-btn" @click="downloadPdf">
              <Download :size="16" />
              <span>PDF</span>
            </button>
            <button id="go-to-chat-btn" class="action-btn primary-btn" @click="goToChat">
              <MessageCircle :size="16" />
              <span>Asesor</span>
            </button>
          </div>
        </div>

        <div class="ag-card ag-glass p-4 md:p-8 report-viewer overflow-x-auto">
          <MarkdownRenderer :content="reportContent || ''" />
        </div>

        <div class="mt-8 p-6 tip-card">
          <div class="ag-icon-box bg-primary text-white" style="width:36px;height:36px;border-radius:10px">
            <CheckCircle :size="18" />
          </div>
          <p class="text-sm text-muted">
            Puedes exportar este análisis a PDF o seguir conversando en el chat.
          </p>
        </div>
      </div>

      <!-- Hidden print template -->
      <div style="position:absolute;left:-9999px;top:-9999px;">
        <div id="printable-report-template">
          <ReportPdfTemplate
            v-if="reportContent"
            :content="reportContent"
            :metadata="{
              zoneName: iotStore.zones.find(z => z.id === selectedZoneId)?.name || 'Invernadero Global',
              focusLabel: focusOptions.find(f => f.id === selectedFocus)?.label || 'General',
              hours: selectedHours,
              date: new Date().toLocaleString(),
              reportId: Math.random().toString(36).substr(2, 9).toUpperCase()
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-scroll {
  height: 100%;
  overflow-y: auto;
  background: var(--ag-bg);
}

.config-step {
  max-width: 800px;
  margin: 0 auto;
}

.hour-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hour-chip {
  padding: 0.5rem 1rem;
  border: 1px solid var(--ag-border);
  border-radius: 9999px;
  background: transparent;
  color: var(--ag-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.hour-chip.active {
  background: rgba(var(--ag-primary-rgb), 0.12);
  border-color: var(--ag-primary);
  color: var(--ag-primary);
  font-weight: 700;
}

.focus-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  color: var(--ag-text-muted);
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  opacity: 0.65;
}

.focus-card:hover { opacity: 0.9; background: rgba(255,255,255,0.04); }

.focus-active {
  background: rgba(var(--ag-primary-rgb), 0.1);
  border-color: var(--ag-primary);
  color: var(--ag-primary);
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(var(--ag-primary-rgb), 0.2);
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--ag-primary);
  border: none;
  border-radius: 14px;
  color: white;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 220px;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(var(--ag-primary-rgb), 0.3);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(var(--ag-primary-rgb), 0.4);
}

.generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.icon-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--ag-border);
  border-radius: 10px;
  color: var(--ag-text-muted);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--ag-text); }

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 14px;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.outline-btn {
  background: transparent;
  border: 1px solid rgba(var(--ag-primary-rgb), 0.4);
  color: var(--ag-primary);
}

.outline-btn:hover { background: rgba(var(--ag-primary-rgb), 0.08); }

.primary-btn {
  background: var(--ag-primary);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(var(--ag-primary-rgb), 0.3);
}

.primary-btn:hover { background: var(--ag-primary-hover); transform: translateY(-1px); }

.report-viewer {
  min-height: 400px;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(var(--ag-primary-rgb), 0.2) !important;
}

.tip-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(var(--ag-primary-rgb), 0.05);
  border: 1px solid rgba(var(--ag-primary-rgb), 0.1);
  border-radius: 1.5rem;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 10px var(--ag-primary);
}

.flex-wrap { flex-wrap: wrap; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
