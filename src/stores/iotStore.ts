import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import { iotService } from '@/services/api';
import type { ActuatorLogEntry, Zone } from '@/types';

export const useIotStore = defineStore('iot', () => {
  const actuatorLogs = ref<ActuatorLogEntry[]>([]);
  const zones = ref<Zone[]>([]);
  const selectedZoneId = shallowRef<string | null>(null);
  const logPage = ref(0);
  const logHasMore = ref(true);
  const isLoadingLogs = ref(false);
  const LOG_PAGE_SIZE = 50;

  async function fetchZones() {
    try {
      const response = await iotService.getZones();
      zones.value = response.data;
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  }

  async function createZone(name: string, crop_type?: string) {
    try {
      const response = await iotService.createZone(name, crop_type);
      zones.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  async function updateZone(id: string, name: string, crop_type?: string) {
    try {
      const response = await iotService.updateZone(id, name, crop_type);
      const index = zones.value.findIndex(z => z.id === id);
      if (index !== -1) zones.value[index] = response.data;
      return response.data;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  }

  async function deleteZone(id: string) {
    try {
      await iotService.deleteZone(id);
      zones.value = zones.value.filter(z => z.id !== id);
      if (selectedZoneId.value === id) selectedZoneId.value = null;
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  }

  async function fetchActuatorLogs(reset = false) {
    if (isLoadingLogs.value) return;
    if (reset) {
      actuatorLogs.value = [];
      logPage.value = 0;
      logHasMore.value = true;
    }
    if (!logHasMore.value) return;

    isLoadingLogs.value = true;
    const offset = logPage.value * LOG_PAGE_SIZE;
    try {
      const response = await iotService.getActuatorLog(LOG_PAGE_SIZE, offset, selectedZoneId.value);
      const items = response.data.logs || [];
      if (items.length < LOG_PAGE_SIZE) logHasMore.value = false;
      actuatorLogs.value = [...actuatorLogs.value, ...items];
      logPage.value++;
    } catch (error) {
      console.error('Error fetching actuator logs:', error);
    } finally {
      isLoadingLogs.value = false;
    }
  }

  function addOptimisticLog(entry: { device: string, action: string, reason: string }) {
    const newEntry: ActuatorLogEntry = {
      id: `opt-${Date.now()}`,
      device: entry.device,
      action: entry.action,
      reason: entry.reason,
      created_at: new Date().toISOString()
    };
    actuatorLogs.value.unshift(newEntry);
  }

  return {
    actuatorLogs, zones, selectedZoneId,
    logHasMore, isLoadingLogs,
    fetchZones, createZone, updateZone, deleteZone,
    fetchActuatorLogs, addOptimisticLog
  };
});
