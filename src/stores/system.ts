import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import { dashboardService, systemService } from '../services/api';
import type { SystemMode } from '@/types';

export const useSystemStore = defineStore('system', () => {
  const mode = shallowRef<SystemMode>('AUTO');
  const isOnline = shallowRef(true);
  const lastCheck = shallowRef<string | null>(null);
  const loading = shallowRef(false);
  const error = shallowRef<string | null>(null);
  const logs = ref<{ time: string; tag: string; message: string }[]>([]);

  function addLog(tag: string, message: string) {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    logs.value = [{ time, tag, message }, ...logs.value.slice(0, 49)];
  }

  async function fetchState() {
    try {
      const response = await dashboardService.getState();
      // El backend ahora devuelve 'mode' mapeado correctamente
      mode.value = response.data.mode;
      isOnline.value = true;
    } catch (err: unknown) {
      isOnline.value = false;
      error.value = err instanceof Error ? err.message : 'Error fetching system state';
    }
  }

  async function updateMode(newMode: SystemMode) {
    const previousMode = mode.value;
    mode.value = newMode; // Optimistic update
    loading.value = true;
    try {
      await dashboardService.updateMode(newMode);
    } catch (err: unknown) {
      mode.value = previousMode; // Rollback
      error.value = err instanceof Error ? err.message : 'Error updating mode';
    } finally {
      loading.value = false;
    }
  }

  async function checkHealth() {
    try {
      await systemService.checkHealth();
      isOnline.value = true;
      lastCheck.value = new Date().toISOString();
    } catch {
      isOnline.value = false;
    }
  }

  return { mode, isOnline, lastCheck, loading, error, logs, fetchState, updateMode, checkHealth, addLog };
});
