import { onMounted, onUnmounted } from 'vue';
import { useTelemetryStore } from '@/stores/telemetry';
import { useAuthStore } from '@/stores/auth';
import { iotService } from '@/services/api';

export function useTelemetrySSE() {
  const telemetryStore = useTelemetryStore();
  const authStore = useAuthStore();
  let eventSource: EventSource | null = null;

  function connect() {
    const token = authStore.accessToken;
    if (!token) return;

    eventSource = iotService.createTelemetryStream(token);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        telemetryStore.updateLatest(data);
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      console.warn('[SSE] Connection lost. Reconnecting in 5s...');
      eventSource?.close();
      setTimeout(connect, 5000);
    };
  }

  onMounted(connect);
  onUnmounted(() => eventSource?.close());

  return { connect };
}
