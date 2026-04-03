import { defineStore } from 'pinia';
import { dashboardService, systemService } from '../services/api';

export const useSystemStore = defineStore('system', {
  state: () => ({
    mode: 'AUTO' as 'AUTO' | 'MANUAL',
    isOnline: true,
    lastCheck: null as string | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchState() {
      try {
        const response = await dashboardService.getState();
        this.mode = response.data.mode || 'AUTO';
        this.isOnline = true;
      } catch (err: any) {
        this.isOnline = false;
        console.error('Error fetching system state:', err);
      }
    },

    async updateMode(newMode: 'AUTO' | 'MANUAL') {
      const previousMode = this.mode;
      this.mode = newMode; // Optimistic update
      this.loading = true;
      try {
        await dashboardService.updateMode(newMode);
      } catch (err: any) {
        this.mode = previousMode; // Rollback
        this.error = err.message || 'Error updating mode';
      } finally {
        this.loading = false;
      }
    },

    async checkHealth() {
      try {
        await systemService.checkHealth();
        this.isOnline = true;
        this.lastCheck = new Date().toISOString();
      } catch {
        this.isOnline = false;
      }
    }
  },
});
