<template>
  <div class="tech-segmented-control">
    <div 
      v-for="option in options" 
      :key="option"
      :class="['segmented-item', { 'active': modelValue === option }]"
      @click="$emit('update:modelValue', option)"
    >
      <span class="option-text">{{ option }}</span>
      <div v-if="modelValue === option" class="neon-indicator"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: string[];
  modelValue: string;
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
.tech-segmented-control {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  /* Tech Cut Edges */
  clip-path: polygon(
    0% 0%, 
    95% 0%, 
    100% 25%, 
    100% 100%, 
    5% 100%, 
    0% 75%
  );
  position: relative;
}

.segmented-item {
  position: relative;
  padding: 6px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.option-text {
  font-family: var(--ag-font-heading);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
  z-index: 2;
  transition: color 0.3s ease;
}

.segmented-item.active .option-text {
  color: var(--ag-neon-green);
  text-shadow: 0 0 10px rgba(var(--ag-neon-green-rgb), 0.5);
}

.segmented-item:hover .option-text {
  color: rgba(255, 255, 255, 0.8);
}

.neon-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--ag-neon-green-rgb), 0.1);
  border: 1px solid var(--ag-neon-green);
  box-shadow: inset 0 0 15px rgba(var(--ag-neon-green-rgb), 0.2),
              0 0 15px rgba(var(--ag-neon-green-rgb), 0.1);
  z-index: 1;
  /* Matching the cut feel */
  clip-path: polygon(
    0% 0%, 
    90% 0%, 
    100% 30%, 
    100% 100%, 
    10% 100%, 
    0% 70%
  );
  animation: neon-pulse 2s infinite alternate;
}

@keyframes neon-pulse {
  from { opacity: 0.8; box-shadow: inset 0 0 10px rgba(var(--ag-neon-green-rgb), 0.1); }
  to { opacity: 1; box-shadow: inset 0 0 20px rgba(var(--ag-neon-green-rgb), 0.3); }
}

/* Add a subtle scanline effect to the active item */
.segmented-item.active::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.1) 50%
  ), linear-gradient(
    90deg, 
    rgba(255, 0, 0, 0.02), 
    rgba(0, 255, 0, 0.01), 
    rgba(0, 0, 255, 0.02)
  );
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
  z-index: 3;
  opacity: 0.3;
}
</style>
