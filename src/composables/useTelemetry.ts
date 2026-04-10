import { storeToRefs } from 'pinia';
import { useTelemetryStore } from '../stores/telemetry';

/**
 * useTelemetry legacy wrapper.
 * NOTE: Real-time updates are now handled by useTelemetrySSE in the main layout.
 * This composable just provides easy access to the store refs.
 */
export function useTelemetry() {
  const store = useTelemetryStore();
  const { latest, loading, error, history } = storeToRefs(store);

  return {
    latest,
    loading,
    error,
    history
  };
}
