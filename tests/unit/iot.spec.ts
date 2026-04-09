import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useIotStore } from '@/stores/iotStore';
import { iotService } from '@/services/api';

// Mock de API
vi.mock('@/services/api', () => ({
  iotService: {
    getZones: vi.fn(),
    createZone: vi.fn(),
    updateZone: vi.fn(),
    deleteZone: vi.fn(),
    getActuatorLog: vi.fn()
  }
}));

describe('IoT Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('debería inicializarse con estados vacíos', () => {
    const store = useIotStore();
    expect(store.zones).toEqual([]);
    expect(store.actuatorLogs).toEqual([]);
    expect(store.selectedZoneId).toBe(null);
  });

  it('debería obtener zonas (fetchZones)', async () => {
    const store = useIotStore();
    const mockZones = [{ id: '1', name: 'Zona A' }];
    vi.mocked(iotService.getZones).mockResolvedValueOnce({ data: mockZones } as any);

    await store.fetchZones();

    expect(store.zones.length).toBe(1);
    expect(store.zones[0].name).toBe('Zona A');
  });

  it('debería añadir una zona optimísticamente al crear (createZone)', async () => {
    const store = useIotStore();
    const newZone = { id: '2', name: 'Zona B' };
    vi.mocked(iotService.createZone).mockResolvedValueOnce({ data: newZone } as any);

    await store.createZone('Zona B', 'Tomate');

    expect(store.zones.length).toBe(1);
    expect(store.zones[0].id).toBe('2');
    expect(iotService.createZone).toHaveBeenCalledWith('Zona B', 'Tomate');
  });

  it('debería eliminar zona y resetear selección (deleteZone)', async () => {
    const store = useIotStore();
    store.zones = [{ id: '1', name: 'Zona A' }, { id: '2', name: 'Zona B' }];
    store.selectedZoneId = '1';

    vi.mocked(iotService.deleteZone).mockResolvedValueOnce({} as any);

    await store.deleteZone('1');

    expect(store.zones.length).toBe(1);
    expect(store.zones[0].id).toBe('2');
    expect(store.selectedZoneId).toBe(null);
  });

  it('debería manejar paginación de logs (fetchActuatorLogs)', async () => {
    const store = useIotStore();
    const mockLogs = {
      logs: Array(49).fill({ id: 'log', device: 'BOMBA', action: 'ON' })
    };
    
    vi.mocked(iotService.getActuatorLog).mockResolvedValueOnce({ data: mockLogs } as any);

    await store.fetchActuatorLogs();

    expect(store.actuatorLogs.length).toBe(49);
    expect(store.logHasMore).toBe(false); 
  });
});
