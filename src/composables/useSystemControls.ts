import { computed, reactive, shallowRef } from 'vue';
import { useSystemStore } from '@/stores/system';
import { useTelemetryStore } from '@/stores/telemetry';
import { useAuthStore } from '@/stores/auth';
import { systemService } from '@/services/api';
import { modalController, toastController } from '@ionic/vue';
import ApiKeyModal from '@/components/ApiKeyModal.vue';
import { useRouter } from 'vue-router';
import type { ApiKeyType, SystemMode } from '@/types';

export function useSystemControls() {
  const systemStore = useSystemStore();
  const telemetryStore = useTelemetryStore();
  const authStore = useAuthStore();
  const router = useRouter();

  const mode = computed(() => systemStore.mode);
  const isOnline = computed(() => systemStore.isOnline);

  const controls = reactive({ fan: false, light: true, water: false });

  const logs = shallowRef([
    { time: '12:30:15', tag: 'SYS', message: 'EC levels stabilized at 2.1 mS/cm.' },
    { time: '11:15:02', tag: 'AI', message: 'Nutrient delivery schedule optimized.' },
    { time: '09:00:00', tag: 'PWR', message: 'Growth lighting initialized.' }
  ]);

  const handleModeToggle = async (checked: boolean) => {
    const newMode: SystemMode = checked ? 'AUTO' : 'MANUAL';
    await systemStore.updateMode(newMode);
  };

  const checkSystem = async () => {
    await systemStore.checkHealth();
  };

  const sendMock = async () => {
    await telemetryStore.sendMockTelemetry();
  };

  const generateKey = async (type: ApiKeyType) => {
    try {
      const response = await systemService.generateApiKey(type);
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
