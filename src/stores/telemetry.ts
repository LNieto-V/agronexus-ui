import { defineStore } from 'pinia';
import { dashboardService } from '../services/api';

export interface TelemetryData {
  temperature: number;
  humidity: number;
  ph: number;
  ec: number;
  light: number;
  timestamp: string;
}

export const useTelemetryStore = defineStore('telemetry', {
  state: () => ({
    latest: null as TelemetryData | null,
    history: [] as TelemetryData[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchLatest() {
      this.loading = true;
      try {
        const response = await dashboardService.getLatest();
        console.log('Backend response (latest):', response.data);
        
        // Robust mapping for varying field names (e.g., temp vs temperature)
        const raw = response.data.sensor_data || response.data;
        
        this.latest = {
          temperature: raw.temperature ?? raw.temp ?? raw.t ?? 0,
          humidity: raw.humidity ?? raw.hum ?? raw.h ?? 0,
          ph: raw.ph ?? raw.p ?? 0,
          ec: raw.ec ?? raw.e ?? 0,
          light: raw.light ?? raw.lux ?? raw.l ?? 0,
          timestamp: response.data.timestamp || new Date().toISOString()
        };
      } catch (err: any) {
        this.error = err.message || 'Error fetching latest data';
      } finally {
        this.loading = false;
      }
    },

    async fetchHistory() {
      try {
        const response = await dashboardService.getHistory();
        console.log('Backend response (history):', response.data);
        
        // Handle history data (array of telemetry objects)
        const rawHistory = Array.isArray(response.data) ? response.data : (response.data.history || []);
        
        this.history = rawHistory.map((item: any) => ({
          temperature: item.temperature ?? item.temp ?? item.t ?? 0,
          humidity: item.humidity ?? item.hum ?? item.h ?? 0,
          ph: item.ph ?? item.p ?? 0,
          ec: item.ec ?? item.e ?? 0,
          light: item.light ?? item.lux ?? item.l ?? 0,
          timestamp: item.timestamp || item.created_at || new Date().toISOString()
        }));
      } catch (err: any) {
        console.error('Error fetching history:', err);
      }
    },

    updateLatest(data: any) {
      // Map real-time payload same as latest
      const mapped: TelemetryData = {
        temperature: data.temperature ?? data.temp ?? data.t ?? 0,
        humidity: data.humidity ?? data.hum ?? data.h ?? 0,
        ph: data.ph ?? data.p ?? 0,
        ec: data.ec ?? data.e ?? 0,
        light: data.light ?? data.lux ?? data.l ?? 0,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      this.latest = mapped;
      this.history.push(mapped);
      if (this.history.length > 50) {
        this.history.shift();
      }
    },

    async sendMockTelemetry() {
      const mockData = {
        temperature: Math.floor(Math.random() * 5 + 20),
        humidity: Math.floor(Math.random() * 20 + 60),
        ph: parseFloat((Math.random() * 1 + 6).toFixed(2)),
        ec: parseFloat((Math.random() * 0.5 + 1.5).toFixed(2)),
        light: Math.floor(Math.random() * 200 + 800)
      };
      
      try {
        await dashboardService.postTelemetry(mockData);
      } catch (err: any) {
        console.error('Error sending mock telemetry:', err);
      }
    }
  },
});
