<script setup lang="ts">
import { useModal } from '@/composables/useModal';
import { X } from 'lucide-vue-next';

const { modalState, closeModal } = useModal();

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) closeModal();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modalState.isOpen"
        class="modal-backdrop"
        @click="onBackdropClick"
        role="dialog"
        aria-modal="true"
      >
        <Transition name="modal-slide">
          <div v-if="modalState.isOpen" class="modal-container">
            <button class="modal-close-btn" @click="closeModal" aria-label="Close modal">
              <X :size="18" />
            </button>
            <component
              :is="modalState.component"
              v-bind="modalState.props"
              @close="closeModal"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: var(--ag-card);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: var(--ag-text-muted);
  cursor: pointer;
  padding: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(255,255,255,0.12);
  color: var(--ag-text);
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-slide-enter-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-slide-leave-active { transition: all 0.25s ease; }
.modal-slide-enter-from { opacity: 0; transform: translateY(30px) scale(0.96); }
.modal-slide-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
</style>
