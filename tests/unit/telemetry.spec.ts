import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTelemetryStore } from '@/stores/telemetry';
import { dashboardService } from '@/services/api';

// Mock de API
vi.mock('@/services/api', () => ({
  dashboardService: {
    getLatest: vi.fn(),
    getHistory: vi.fn()
  }
}));

describe('Telemetry Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('debería inicializarse con datos vacíos', () => {
    const store = useTelemetryStore();
    expect(store.latest).toBe(null);
    expect(store.history).toEqual([]);
    expect(store.loading).toBe(false);
  });

  it('debería obtener telemetría actual (fetchLatest)', async () => {
    const store = useTelemetryStore();
    const mockData = {
      sensor_data: {
        temperature: 25.5,
        humidity: 60,
        ph: 6.2,
        ec: 1.2,
        light: 500
      },
      timestamp: '2026-04-09T14:00:00Z'
    };
    
    vi.mocked(dashboardService.getLatest).mockResolvedValueOnce({ data: mockData } as any);

    await store.fetchLatest('zone-1');

    expect(store.latest?.temperature).toBe(25.5);
    expect(store.latest?.ph).toBe(6.2);
    expect(dashboardService.getLatest).toHaveBeenCalledWith('zone-1');
  });

  it('debería manejar casos de datos vacíos en fetchLatest', async () => {
    const store = useTelemetryStore();
    vi.mocked(dashboardService.getLatest).mockResolvedValueOnce({ data: {} } as any);

    await store.fetchLatest();

    expect(store.latest).toBe(null);
  });

  it('debería obtener historial y ordenarlo (fetchHistory)', async () => {
    const store = useTelemetryStore();
    const mockHistory = [
      { temperature: 20, timestamp: '2026-04-09T10:00:00Z' },
      { temperature: 22, timestamp: '2026-04-09T09:00:00Z' }
    ];
    
    vi.mocked(dashboardService.getHistory).mockResolvedValueOnce({ data: mockHistory } as any);

    await store.fetchHistory();

    expect(store.history.length).toBe(2);
    // Verificar orden cronológico (ascendente)
    expect(store.history[0].temperature).toBe(22);
    expect(store.history[1].temperature).toBe(20);
  });

  it('debería actualizar datos en tiempo real (updateLatest)', () => {
    const store = useTelemetryStore();
    const realTimeData = {
      temperature: 30,
      humidity: 50,
      timestamp: '2026-04-09T14:10:00Z'
    };

    store.updateLatest(realTimeData);

    expect(store.latest?.temperature).toBe(30);
    expect(store.history.length).toBe(1);
    expect(store.history[0].temperature).toBe(30);
  });
});
