import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TelemetryCard from '@/components/TelemetryCard.vue';
import { thermometerOutline } from 'ionicons/icons';

describe('TelemetryCard.vue', () => {
  it('debería renderizar las props correctamente', () => {
    const wrapper = mount(TelemetryCard, {
      props: {
        label: 'Temperatura',
        value: 25.5,
        unit: '°C',
        icon: thermometerOutline,
        color: 'red',
        progress: 60
      },
      global: {
        stubs: ['ion-icon']
      }
    });

    expect(wrapper.text()).toContain('Temperatura');
    expect(wrapper.text()).toContain('25.5');
    expect(wrapper.text()).toContain('°C');
  });

  it('debería aplicar el ancho de progreso dinámicamente', () => {
    const progressValue = 75;
    const wrapper = mount(TelemetryCard, {
      props: {
        label: 'Humedad',
        value: 70,
        unit: '%',
        icon: thermometerOutline,
        color: 'blue',
        progress: progressValue
      },
      global: {
        stubs: ['ion-icon']
      }
    });

    const progressBar = wrapper.find('.progress-fill');
    expect(progressBar.attributes('style')).toContain(`width: ${progressValue}%`);
  });

  it('debería aplicar las clases de color correctamente', () => {
    const wrapper = mount(TelemetryCard, {
      props: {
        label: 'pH',
        value: 6.5,
        unit: 'pH',
        icon: thermometerOutline,
        color: 'purple',
        progress: 50
      },
      global: {
        stubs: ['ion-icon']
      }
    });

    const iconBox = wrapper.find('.ag-icon-box');
    expect(iconBox.classes()).toContain('bg-purple-soft');
    expect(iconBox.classes()).toContain('text-purple');
  });
});
