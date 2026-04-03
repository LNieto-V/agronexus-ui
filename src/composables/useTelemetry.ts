import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { supabase } from '../lib/supabase';
import { useTelemetryStore } from '../stores/telemetry';

export function useTelemetry() {
  const store = useTelemetryStore();
  const { latest, loading, error, history } = storeToRefs(store);

  const subscribeToTelemetry = () => {
    const channel = supabase
      .channel('public:telemetry')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'telemetry' },
        (payload) => {
          console.log('Real-time telemetry update:', payload.new);
          store.updateLatest(payload.new as any);
        }
      )
      .subscribe();

    return channel;
  };

  onMounted(() => {
    const channel = subscribeToTelemetry();
    
    onUnmounted(() => {
      supabase.removeChannel(channel);
    });
  });

  return {
    latest,
    loading,
    error,
    history
  };
}
