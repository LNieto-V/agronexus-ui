import { computed, onMounted, reactive } from 'vue';
import { useSystemStore } from '@/stores/system';
import { useTelemetryStore } from '@/stores/telemetry';
import { useAuthStore } from '@/stores/auth';
import { systemService } from '@/services/api';
import { modalController, toastController } from '@ionic/vue';
import ApiKeyModal from '@/components/ApiKeyModal.vue';
import { useIotStore } from '@/stores/iotStore';
import { useRouter } from 'vue-router';
import type { ApiKeyType, SystemMode } from '@/types';

export function useSystemControls() {
  const systemStore = useSystemStore();
  const telemetryStore = useTelemetryStore();
  const iotStore = useIotStore();
  const authStore = useAuthStore();
  const router = useRouter();
  
  const mode = computed(() => systemStore.mode);
  const isOnline = computed(() => systemStore.isOnline);
  const controls = reactive({ fan: false, light: true, water: false });

  const logs = computed(() => systemStore.logs);
  const selectedZoneId = computed(() => iotStore.selectedZoneId);
  
  onMounted(async () => {
    await Promise.all([
      systemStore.fetchState(),
      telemetryStore.fetchLatest(),
      telemetryStore.fetchHistory()
    ]);
  });

  const handleModeToggle = async (checked: boolean) => {
    const newMode: SystemMode = checked ? 'AUTO' : 'MANUAL';
    await systemStore.updateMode(newMode);
  };

  const checkSystem = async () => {
    await systemStore.checkHealth();
  };

  const sendMock = async () => {
    try {
      const { actions, alerts } = await telemetryStore.sendMockTelemetry();
      
      // Process alerts
      alerts.forEach((alert: string) => {
        systemStore.addLog('AI', `ALERT: ${alert}`);
      });
      
      // Process actions
      actions.forEach((action: any) => {
        const msg = typeof action === 'string' ? action : (action.label || action.type || 'Action triggered');
        systemStore.addLog('SYS', `ACTION: ${msg}`);
      });

      if (alerts.length === 0 && actions.length === 0) {
        systemStore.addLog('SYS', 'Telemetry sent: No anomalies detected.');
      }
      
      const toast = await toastController.create({
        message: 'Mock telemetry sent successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (err) {
      systemStore.addLog('ERR', 'Failed to send telemetry');
    }
  };

  const generateKey = async (type: ApiKeyType) => {
    try {
      const response = await systemService.generateApiKey(type, selectedZoneId.value);
      const key = response.data.api_key;

      const modal = await modalController.create({
        component: ApiKeyModal,
        componentProps: { apiKey: key },
        cssClass: 'premium-modal'
      });
      await modal.present();
    } catch {
      const toast = await toastController.create({
        message: 'Failed to generate API Key',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  };

  const handleLogout = async () => {
    try {
      await authStore.signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return {
    mode,
    isOnline,
    controls,
    logs,
    handleModeToggle,
    checkSystem,
    sendMock,
    generateKey,
    handleLogout
  };
}
