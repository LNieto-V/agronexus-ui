import { ref } from 'vue';
import type { AiAction } from '@/types';

// Bus reactivo global (singleton por módulo)
const pendingActions = ref<AiAction[]>([]);

export function useActuatorBus() {
  function emitActuatorActions(actions: AiAction[]) {
    pendingActions.value = actions;
    // Limpiar tras animación (2s)
    setTimeout(() => { pendingActions.value = []; }, 2000);
  }

  return { pendingActions, emitActuatorActions };
}
