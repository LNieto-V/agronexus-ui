import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { dashboardService } from '../services/api';
import type { TelemetryData } from '@/types';

export const useTelemetryStore = defineStore('telemetry', () => {
  const latest = shallowRef<TelemetryData | null>(null);
  const history = shallowRef<TelemetryData[]>([]);
  const loading = shallowRef(false);
  const error = shallowRef<string | null>(null);

  async function fetchLatest() {
    loading.value = true;
    try {
      const response = await dashboardService.getLatest();
      
      const raw = response.data.sensor_data || response.data;
      
      latest.value = {
        temperature: (raw.temperature ?? raw.temp ?? raw.t ?? 0) as number,
        humidity: (raw.humidity ?? raw.hum ?? raw.h ?? 0) as number,
        ph: (raw.ph ?? raw.p ?? 0) as number,
        ec: (raw.ec ?? raw.e ?? 0) as number,
        light: (raw.light ?? raw.lux ?? raw.l ?? 0) as number,
        timestamp: response.data.timestamp || new Date().toISOString()
      };
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error fetching latest data';
    } finally {
      loading.value = false;
    }
  }

  async function fetchHistory() {
    try {
      const response = await dashboardService.getHistory();
      
      const responseData = response.data as any;
      const rawHistory = Array.isArray(responseData) ? responseData : (responseData.history || []);
      
      history.value = rawHistory.map((item: Record<string, unknown>) => ({
        temperature: (item.temperature ?? item.temp ?? item.t ?? 0) as number,
        humidity: (item.humidity ?? item.hum ?? item.h ?? 0) as number,
        ph: (item.ph ?? item.p ?? 0) as number,
        ec: (item.ec ?? item.e ?? 0) as number,
        light: (item.light ?? item.lux ?? item.l ?? 0) as number,
        timestamp: (item.timestamp || item.created_at || new Date().toISOString()) as string
      }));
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
      temperature: Math.floor(Math.random() * 5 + 20),
      humidity: Math.floor(Math.random() * 20 + 60),
      ph: parseFloat((Math.random() * 1 + 6).toFixed(2)),
      ec: parseFloat((Math.random() * 0.5 + 1.5).toFixed(2)),
      light: Math.floor(Math.random() * 200 + 800)
    };
    
    try {
      await dashboardService.postTelemetry(mockData);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Error sending mock telemetry';
    }
  }

  return { latest, history, loading, error, fetchLatest, fetchHistory, updateLatest, sendMockTelemetry };
});
