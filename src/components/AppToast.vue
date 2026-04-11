<script setup lang="ts">
import { ref } from 'vue';
import { useToast, type Toast } from '@/composables/useToast';
import { X } from 'lucide-vue-next';

const { toasts, removeToast } = useToast();

const getIcon = (color: Toast['color']) => {
  switch (color) {
    case 'success': return '✓';
    case 'danger': return '✕';
    case 'warning': return '⚠';
    default: return 'ℹ';
  }
};
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" role="region" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-group">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-${toast.color}`"
          @click="removeToast(toast.id)"
        >
          <span class="toast-icon">{{ getIcon(toast.color) }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" @click.stop="removeToast(toast.id)" aria-label="Close">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
  width: max-content;
  max-width: calc(100vw - 2rem);
}

.toast-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-radius: 14px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-size: 0.875rem;
  font-weight: 600;
  pointer-events: all;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06);
  max-width: 420px;
  min-width: 280px;
  transition: all 0.2s ease;
  animation: toastEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #d1fae5;
}

.toast-danger {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fee2e2;
}

.toast-warning {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fef3c7;
}

.toast-info {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #dbeafe;
}

.toast-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.toast-msg {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  opacity: 0.6;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.toast-close:hover { opacity: 1; }

@keyframes toastEnter {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.toast-enter-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateY(20px) scale(0.95); }
.toast-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
</style>
