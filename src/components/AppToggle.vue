<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  disabled?: boolean;
  color?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'change': [value: boolean];
}>();

function toggle() {
  if (props.disabled) return;
  const next = !props.modelValue;
  emit('update:modelValue', next);
  emit('change', next);
}
</script>

<template>
  <button
    class="app-toggle"
    :class="{ 'is-on': modelValue, 'is-disabled': disabled }"
    @click="toggle"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    type="button"
  >
    <span class="toggle-thumb" />
  </button>
</template>

<style scoped>
.app-toggle {
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  padding: 0;
}

.app-toggle.is-on {
  background: var(--ag-primary);
  border-color: var(--ag-primary);
  box-shadow: 0 0 12px rgba(var(--ag-primary-rgb), 0.4);
}

.app-toggle.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.25s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.is-on .toggle-thumb {
  transform: translateX(20px);
  background: white;
}
</style>
