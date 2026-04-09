import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { dashboardService } from '../services/api';
import type { TelemetryData } from '@/types';

export const useTelemetryStore = defineStore('telemetry', () => {
  const latest = shallowRef<TelemetryData | null>(null);
  const history = shallowRef<TelemetryData[]>([]);
  const loading = shallowRef(false);
  const error = shallowRef<string | null>(null);

  async function fetchLatest(zoneId?: string | null) {
    loading.value = true;
    try {
      const response = await dashboardService.getLatest(zoneId);
      
      const raw = response.data.sensor_data || response.data;
      
      // Si el objeto está vacío, no tenemos telemetría real
      if (!raw || Object.keys(raw).length === 0 || (raw.id === undefined && raw.temperature === undefined)) {
        latest.value = null;
        return;
      }
      
      latest.value = {
        temperature: (raw.temperature ?? raw.temp ?? raw.t) as number,
        humidity: (raw.humidity ?? raw.hum ?? raw.h) as number,
        ph: (raw.ph ?? raw.p) as number,
        ec: (raw.ec ?? raw.e) as number,
        light: (raw.light ?? raw.lux ?? raw.l) as number,
        timestamp: (response.data.timestamp || raw.created_at || new Date().toISOString()) as string
      };
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error fetching latest data';
    } finally {
      loading.value = false;
    }
  }

  async function fetchHistory(zoneId?: string | null) {
    try {
      const response = await dashboardService.getHistory(zoneId);
      
      const responseData = response.data as any;
      const rawHistory = Array.isArray(responseData) ? responseData : (responseData.history || []);
      
      history.value = rawHistory.map((item: Record<string, unknown>) => ({
        temperature: (item.temperature ?? item.temp ?? item.t ?? 0) as number,
        humidity: (item.humidity ?? item.hum ?? item.h ?? 0) as number,
        ph: (item.ph ?? item.p ?? 0) as number,
        ec: (item.ec ?? item.e ?? 0) as number,
        light: (item.light ?? item.lux ?? item.l ?? 0) as number,
        timestamp: (item.timestamp || item.created_at || new Date().toISOString()) as string
      })).sort((a: TelemetryData, b: TelemetryData) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error fetching history';
    }
  }

  function updateLatest(data: Record<string, unknown>) {
    const mapped: TelemetryData = {
      temperature: (data.temperature ?? data.temp ?? data.t ?? 0) as number,
      humidity: (data.humidity ?? data.hum ?? data.h ?? 0) as number,
      ph: (data.ph ?? data.p ?? 0) as number,
      ec: (data.ec ?? data.e ?? 0) as number,
      light: (data.light ?? data.lux ?? data.l ?? 0) as number,
      timestamp: (data.timestamp || new Date().toISOString()) as string
    };
    
    latest.value = mapped;
    history.value = [...history.value.slice(-49), mapped];
  }

  async function sendMockTelemetry() {
    const mockData = {
      temperature: 38.5, // Explicitly trigger anomaly
      humidity: 40,
      ph: 6.5,
      ec: 1.5,
      light: 45000
    };
    
    try {
      const response = await dashboardService.postTelemetry(mockData);
      const data = response.data as any;
      return {
        actions: data.actions || [],
        alerts: data.alerts || []
      };
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error sending mock telemetry';
      throw err;
    }
  }

  return { latest, history, loading, error, fetchLatest, fetchHistory, updateLatest, sendMockTelemetry };
});
