import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { dashboardService, systemService } from '../services/api';
import type { SystemMode } from '@/types';

export const useSystemStore = defineStore('system', () => {
  const mode = shallowRef<SystemMode>('AUTO');
  const isOnline = shallowRef(true);
  const lastCheck = shallowRef<string | null>(null);
  const loading = shallowRef(false);
  const error = shallowRef<string | null>(null);

  async function fetchState() {
    try {
      const response = await dashboardService.getState();
      mode.value = response.data.mode || 'AUTO';
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

  return { mode, isOnline, lastCheck, loading, error, fetchState, updateMode, checkHealth };
});
