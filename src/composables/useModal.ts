import { ref, shallowRef, readonly, type Component, type DefineComponent } from 'vue';

interface ModalState {
  component: Component | DefineComponent | null;
  props: Record<string, unknown>;
  isOpen: boolean;
}

const state = ref<ModalState>({
  component: null,
  props: {},
  isOpen: false,
});

export function useModal() {
  function openModal(component: Component | DefineComponent, props: Record<string, unknown> = {}) {
    state.value.component = shallowRef(component) as unknown as Component;
    state.value.props = props;
    state.value.isOpen = true;
  }

  function closeModal() {
    state.value.isOpen = false;
    setTimeout(() => {
      state.value.component = null;
      state.value.props = {};
    }, 300);
  }

  return {
    modalState: readonly(state),
    openModal,
    closeModal,
  };
}
