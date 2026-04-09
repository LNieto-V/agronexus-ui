import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ZoneManager from '@/components/system/ZoneManager.vue';
import { useIotStore } from '@/stores/iotStore';
import { iotService } from '@/services/api';

// Mock de Ionic controllers
vi.mock('@ionic/vue', async () => {
    const actual = await vi.importActual('@ionic/vue');
    return {
        ...(actual as any),
        modalController: { dismiss: vi.fn() },
        toastController: { create: vi.fn(() => ({ present: vi.fn() })) }
    };
});

// Mock de API Services
vi.mock('@/services/api', () => ({
  iotService: {
    getZones: vi.fn().mockResolvedValue({ data: [] }),
    createZone: vi.fn(),
    updateZone: vi.fn(),
    deleteZone: vi.fn(),
    getActuatorLog: vi.fn()
  }
}));

describe('ZoneManager.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    const STUBS = {
        'ion-icon': { template: '<div></div>' },
        'ion-item': { template: '<div><slot /></div>' },
        'ion-list': { template: '<div><slot /></div>' },
        'ion-item-sliding': { template: '<div><slot /></div>' },
        'ion-item-options': { template: '<div><slot /></div>' },
        'ion-item-option': { template: '<div><slot /></div>' },
        'ion-button': { template: '<button class="ag-btn-stub"><slot /></button>' },
        'ion-input': { 
            props: ['modelValue'],
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' 
        },
        'ion-spinner': { template: '<div></div>' }
    };

    it('debería mostrar la lista de zonas inicialmente', async () => {
        const iotStore = useIotStore();
        iotStore.zones = [{ id: '1', name: 'Invernadero A', crop_type: 'Tomate' }];
        
        const wrapper = mount(ZoneManager, {
            global: { stubs: STUBS }
        });

        expect(wrapper.text()).toContain('Invernadero A');
    });

    it('debería llamar a createZone al enviar el formulario', async () => {
        const wrapper = mount(ZoneManager, {
            global: { stubs: STUBS }
        });

        // Simular modo creación
        const vm = wrapper.vm as any;
        vm.isCreating = true;
        await vm.$nextTick();

        // Llenar inputs
        const inputs = wrapper.findAll('input');
        await inputs[0].setValue('Zona Test');
        await inputs[1].setValue('Lechuga');
        
        // Mock de respuesta del servicio
        vi.mocked(iotService.createZone).mockResolvedValue({ data: { id: 'new', name: 'Zona Test' } } as any);

        // Click en enviar
        // Buscamos por texto para ser más precisos con el stub de botón
        const buttons = wrapper.findAll('button');
        const createBtn = buttons.find(b => b.text().includes('Create'));
        
        await createBtn?.trigger('click');
        await vm.$nextTick();

        expect(iotService.createZone).toHaveBeenCalledWith('Zona Test', 'Lechuga');
    });
});
