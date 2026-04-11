import { ref, readonly } from 'vue';

export type ToastColor = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  color: ToastColor;
  duration: number;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
  function showToast(message: string, color: ToastColor = 'info', duration = 3000) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, message, color, duration };
    toasts.value.push(toast);
    setTimeout(() => removeToast(id), duration + 400); // +400 for exit animation
  }

  function removeToast(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id);
    if (idx !== -1) toasts.value.splice(idx, 1);
  }

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
  };
}
