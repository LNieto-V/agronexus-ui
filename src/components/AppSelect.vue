<script setup lang="ts" generic="T extends string | number | null = string | null">
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

interface SelectOption<V = T> {
  value: V;
  label: string;
}

const props = defineProps<{
  modelValue: T;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: T];
}>();

const isOpen = ref(false);

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue);
  return found?.label ?? props.placeholder ?? 'Select...';
});

function select(value: T) {
  emit('update:modelValue', value);
  isOpen.value = false;
}

function onBlur() {
  setTimeout(() => { isOpen.value = false; }, 150);
}
</script>

<template>
  <div class="app-select" @blur="onBlur" tabindex="-1">
    <button
      class="select-trigger"
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
      @click="!disabled && (isOpen = !isOpen)"
      type="button"
    >
      <span class="select-label">{{ selectedLabel }}</span>
      <ChevronDown :size="16" class="select-chevron" :class="{ rotated: isOpen }" />
    </button>

    <Transition name="select-drop">
      <div v-if="isOpen" class="select-dropdown">
        <button
          v-for="option in options"
          :key="String(option.value)"
          class="select-option"
          :class="{ 'is-selected': option.value === modelValue }"
          @click="select(option.value)"
          type="button"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-select {
  position: relative;
  outline: none;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.875rem;
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 10px;
  color: var(--ag-text);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.select-trigger:hover:not(.is-disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(var(--ag-primary-rgb), 0.4);
}

.select-trigger.is-open {
  border-color: var(--ag-primary);
  background: var(--ag-card);
}

.select-trigger.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.select-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ag-primary);
}

.select-chevron {
  flex-shrink: 0;
  color: var(--ag-text-muted);
  transition: transform 0.2s ease;
}

.select-chevron.rotated { transform: rotate(180deg); }

.select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 9999;
  background: #18181b !important;
  border: 1px solid #3f3f46 !important;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0,0,0,0.9) !important;
  opacity: 1 !important;
}

.select-option {
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--ag-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.select-option:hover {
  background: rgba(var(--ag-primary-rgb), 0.15);
  color: var(--ag-text);
}

.select-option.is-selected {
  color: var(--ag-primary);
  font-weight: 700;
  background: rgba(var(--ag-primary-rgb), 0.1);
}

/* Transitions */
.select-drop-enter-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.select-drop-leave-active { transition: all 0.15s ease; }
.select-drop-enter-from { opacity: 0; transform: translateY(-8px) scale(0.98); }
.select-drop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
