<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonList, IonItem, IonLabel,
  IonSelect, IonSelectOption, IonButton, IonIcon, IonCard,
  IonCardContent, IonSpinner, IonChip, toastController
} from '@ionic/vue';
import { 
  documentTextOutline, sparklesOutline, timeOutline, 
  layersOutline, checkmarkCircleOutline, chatbubbleEllipsesOutline,
  refreshOutline, analyticsOutline, downloadOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useIotStore } from '@/stores/iotStore';
import { chatService, conversationService } from '@/services/api';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import ReportPdfTemplate from '@/components/ReportPdfTemplate.vue';
import { useRouter } from 'vue-router';

const iotStore = useIotStore();
const router = useRouter();

const selectedZoneId = ref<string | null>(null);
const selectedFocus = ref('general');
const selectedHours = ref(24);
const isGenerating = ref(false);
const reportContent = ref<string | null>(null);
const currentSessionId = ref<string | null>(null);

const focusOptions = [
  { id: 'general', label: 'Salud General', icon: sparklesOutline },
  { id: 'nutrition', label: 'Nutrición (pH/EC)', icon: analyticsOutline },
  { id: 'clima', label: 'Clima y VPD', icon: timeOutline },
  { id: 'riego', label: 'Riego y Reservorios', icon: layersOutline }
];

const hourOptions = [
  { value: 24, label: 'Últimas 24 Horas' },
  { value: 48, label: 'Últimas 48 Horas' },
  { value: 168, label: 'Última Semana' }
];

async function generateReport() {
  if (isGenerating.value) return;
  
  isGenerating.value = true;
  reportContent.value = null;
  
  try {
    // 1. Crear una nueva sesión para este reporte si no tenemos una
    const focusLabel = focusOptions.find(f => f.id === selectedFocus.value)?.label || 'General';
    const sessionTitle = `Informe ${focusLabel} - ${new Date().toLocaleDateString()}`;
    const sessionRes = await conversationService.createConversation(sessionTitle);
    currentSessionId.value = sessionRes.data.id;

    // 2. Generar el reporte
    const response = await chatService.generateReport({
      zone_id: selectedZoneId.value,
      hours: selectedHours.value,
      focus: selectedFocus.value,
      session_id: currentSessionId.value
    });

    reportContent.value = response.data.response;
    
    const toast = await toastController.create({
      message: 'Análisis generado con éxito',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (error: any) {
    console.error('Error generating report:', error);
    
    let message = 'Error al conectar con el Asesor IA. Reintenta.';
    if (error.response?.status === 429) {
      message = 'El servicio de análisis de IA está operando al máximo de su capacidad. Por favor, reintenta en unos segundos.';
    }

    const toast = await toastController.create({
      message,
      duration: error.response?.status === 429 ? 5000 : 3000,
      color: error.response?.status === 429 ? 'warning' : 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    isGenerating.value = false;
  }
}

function goToChat() {
  if (currentSessionId.value) {
    router.push({
      path: '/tabs/assistant',
      query: { session: currentSessionId.value }
    });
  }
}

async function downloadPdf() {
  const element = document.getElementById('printable-report-template');
  if (!element) return;
  
  const options = {
    margin: 10,
    filename: `AgroNexus_Reporte_${selectedFocus.value}_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    // Mostramos temporalmente para captura si es necesario, pero html2pdf suele manejarlo
    // @ts-ignore — html2pdf is loaded globally via CDN
    await window.html2pdf().from(element).set(options).save();
    
    const toast = await toastController.create({
      message: 'PDF generado correctamente',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (err) {
    console.error('PDF Error:', err);
  }
}

onMounted(() => {
  iotStore.fetchZones();
});
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="premium-toolbar px-4 py-2">
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title class="font-bold text-lg">Asesor Agronómico</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="ag-container py-6">
        
        <!-- Configuration Step -->
        <div v-if="!reportContent" class="config-step">
          <div class="mb-8">
            <h2 class="text-3xl font-black mb-2 tracking-tight">Generar <span class="text-primary">Informe IA</span></h2>
            <p class="text-muted tracking-wide text-sm">Selecciona los parámetros para que nuestra IA analice tu cultivo.</p>
          </div>

          <div class="ag-grid ag-grid-1 md:ag-grid-2 gap-6">
            <!-- Zone Selection -->
            <div class="ag-card ag-glass p-6">
              <div class="ag-flex-row gap-3 mb-4">
                <div class="ag-icon-box bg-primary-soft text-primary">
                  <ion-icon :icon="layersOutline" />
                </div>
                <h3 class="font-bold">Zona de Monitoreo</h3>
              </div>
              <ion-select 
                v-model="selectedZoneId" 
                placeholder="Seleccionar Zona"
                interface="popover"
                class="premium-select w-full"
              >
                <ion-select-option :value="null">Todo el Invernadero</ion-select-option>
                <ion-select-option v-for="zone in iotStore.zones" :key="zone.id" :value="zone.id">
                  {{ zone.name }}
                </ion-select-option>
              </ion-select>
            </div>

            <!-- Time Range Selection -->
            <div class="ag-card ag-glass p-6">
              <div class="ag-flex-row gap-3 mb-4">
                <div class="ag-icon-box bg-blue-soft text-blue">
                  <ion-icon :icon="timeOutline" />
                </div>
                <h3 class="font-bold">Rango de Análisis</h3>
              </div>
              <ion-list class="ag-list-clear">
                 <div class="flex flex-wrap gap-2">
                   <ion-chip 
                    v-for="opt in hourOptions" 
                    :key="opt.value"
                    :outline="selectedHours !== opt.value"
                    :color="selectedHours === opt.value ? 'primary' : 'medium'"
                    @click="selectedHours = opt.value"
                    class="ag-chip-premium"
                   >
                     {{ opt.label }}
                   </ion-chip>
                 </div>
              </ion-list>
            </div>
          </div>

          <!-- Focus Area -->
          <div class="mt-8">
            <h3 class="font-bold mb-4 text-sm uppercase tracking-widest text-muted">Enfoque del Diagnóstico</h3>
            <div class="ag-grid sm:ag-grid-2 md:ag-grid-4 gap-4">
              <div 
                v-for="focus in focusOptions" 
                :key="focus.id"
                class="focus-card ag-card ag-glass p-4 ag-flex-row ag-flex-center gap-3 cursor-pointer transition-all"
                :class="{ 'focus-active': selectedFocus === focus.id }"
                @click="selectedFocus = focus.id"
              >
                <ion-icon :icon="focus.icon" class="text-xl" />
                <span class="font-bold text-sm">{{ focus.label }}</span>
              </div>
            </div>
          </div>

          <div class="mt-12 flex justify-center">
            <ion-button 
              expand="block" 
              class="premium-btn w-full md:w-64 h-14" 
              @click="generateReport"
              :disabled="isGenerating"
            >
              <ion-spinner v-if="isGenerating" name="crescent" slot="start" />
              <ion-icon v-else :icon="sparklesOutline" slot="start" />
              {{ isGenerating ? 'Analizando...' : 'Generar Informe' }}
            </ion-button>
          </div>
        </div>

        <!-- Report Result Step -->
        <div v-else class="report-result pb-20">
          <div class="ag-flex-row ag-flex-wrap justify-between items-center mb-6 gap-4">
            <div class="ag-flex-row ag-flex-wrap gap-3 items-center">
              <ion-button fill="clear" color="medium" @click="reportContent = null">
                <ion-icon :icon="refreshOutline" slot="icon-only" />
              </ion-button>
              <div>
                <h2 class="text-2xl font-black">Tu Informe <span class="text-primary">IA</span></h2>
                <div class="ag-flex-row gap-2 items-center">
                  <span class="status-dot bg-primary"></span>
                  <p class="text-xs text-muted uppercase tracking-widest font-bold">Generado mediante Gemini Pro</p>
                </div>
              </div>
            </div>
            <div class="ag-flex-row ag-flex-wrap gap-2 no-print w-full md:w-auto">
               <ion-button fill="outline" color="primary" class="download-btn flex-grow md:flex-grow-0" @click="downloadPdf">
                <ion-icon :icon="downloadOutline" slot="start" />
                PDF
              </ion-button>
              <ion-button fill="solid" color="primary" class="chat-btn flex-grow md:flex-grow-0" @click="goToChat">
                <ion-icon :icon="chatbubbleEllipsesOutline" slot="start" />
                Asesor
              </ion-button>
            </div>
          </div>

          <div class="ag-card ag-glass p-4 md:p-8 report-viewer border-primary/20 shadow-2xl shadow-primary/5 overflow-x-auto">
            <MarkdownRenderer :content="reportContent" />
          </div>

          <div class="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-center gap-4">
            <div class="ag-icon-box bg-primary text-white scale-75">
              <ion-icon :icon="checkmarkCircleOutline" />
            </div>
            <p class="text-sm text-muted">A continuación puedes exportar este análisis a PDF desde la sesión de chat correspondiente o seguir haciendo preguntas sobre los hallazgos.</p>
          </div>
        </div>

        <!-- Hidden Template for PDF Export -->
        <div style="position: absolute; left: -9999px; top: -9999px;">
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
    </ion-content>
  </ion-page>
</template>

<style scoped>
.config-step {
  max-width: 800px;
  margin: 0 auto;
}

.focus-card {
  border: 1px solid rgba(255,255,255,0.05);
  opacity: 0.6;
}

.focus-active {
  background: rgba(var(--ag-primary-rgb), 0.1);
  border-color: var(--ag-primary);
  color: var(--ag-primary);
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(var(--ag-primary-rgb), 0.2);
}

.report-viewer {
  min-height: 400px;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-btn {
  --border-radius: 14px;
  --box-shadow: 0 4px 15px rgba(var(--ag-primary-rgb), 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 10px var(--ag-primary);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.ag-chip-premium {
  --background: rgba(255,255,255,0.03);
  --color: #fff;
  font-weight: 600;
  transition: all 0.3s ease;
}
@media print {
  /* Ocultar TODO menos el reporte */
  ion-header, ion-footer, .ag-flex-between, .mt-8, ion-buttons, .no-print, .config-step, .actuators-status, .sidebar-content, ion-menu {
    display: none !important;
  }
  
  ion-page, ion-content, #main-content, .ag-container {
    display: block !important;
    position: static !important;
    overflow: visible !important;
    --background: white !important;
    background: white !important;
    color: black !important;
    width: 100% !important;
    height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  .report-viewer {
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    color: black !important;
    padding: 20px !important;
    margin: 0 !important;
    width: 100% !important;
  }

  /* Forzamos colores y tablas */
  .report-viewer :deep(h2) { color: #10b981 !important; margin-top: 0 !important; }
  .report-viewer :deep(table) { background: #fff !important; border: 1px solid #ddd !important; color: black !important; }
  .report-viewer :deep(th) { background: #10b981 !important; color: white !important; -webkit-print-color-adjust: exact; }
  .report-viewer :deep(td) { border-top: 1px solid #eee !important; }
}

.download-btn {
  --border-radius: 14px;
}
</style>
