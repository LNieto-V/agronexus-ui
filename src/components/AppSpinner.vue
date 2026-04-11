<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg';
}>();
</script>

<template>
  <div class="app-spinner" :class="size ?? 'md'" role="status" aria-label="Loading">
    <div class="spinner-ring" />
  </div>
</template>

<style scoped>
.app-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.spinner-ring {
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--ag-primary);
  animation: spin 0.75s linear infinite;
}

.sm .spinner-ring { width: 16px; height: 16px; }
.md .spinner-ring { width: 24px; height: 24px; }
.lg .spinner-ring { width: 36px; height: 36px; border-width: 3px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
