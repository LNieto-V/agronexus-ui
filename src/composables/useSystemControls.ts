import { computed, onMounted, reactive } from 'vue';
import { useSystemStore } from '@/stores/system';
import { useTelemetryStore } from '@/stores/telemetry';
import { useAuthStore } from '@/stores/auth';
import { systemService } from '@/services/api';
import { useToast } from '@/composables/useToast';
import { useModal } from '@/composables/useModal';
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
  const { showToast } = useToast();
  const { openModal } = useModal();

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
      alerts.forEach((alert: string) => systemStore.addLog('AI', `ALERT: ${alert}`));
      actions.forEach((action: any) => {
        const msg = typeof action === 'string' ? action : (action.label || action.type || 'Action triggered');
        systemStore.addLog('SYS', `ACTION: ${msg}`);
      });
      if (alerts.length === 0 && actions.length === 0) {
        systemStore.addLog('SYS', 'Telemetry sent: No anomalies detected.');
      }
      showToast('Mock telemetry sent successfully', 'success', 2000);
    } catch {
      systemStore.addLog('ERR', 'Failed to send telemetry');
    }
  };

  const generateKey = async (type: ApiKeyType) => {
    try {
      const response = await systemService.generateApiKey(type, selectedZoneId.value);
      const key = response.data.api_key;
      openModal(ApiKeyModal, { apiKey: key });
    } catch {
      showToast('Failed to generate API Key', 'danger', 3000);
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
    mode, isOnline, controls, logs,
    handleModeToggle, checkSystem, sendMock, generateKey, handleLogout
  };
}
