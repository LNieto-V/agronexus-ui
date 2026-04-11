<template>
  <div class="ag-glass-card skeleton-card p-4">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <div class="skeleton-box" style="width:24px;height:24px;border-radius:4px" />
        <div class="skeleton-box" style="width:80px;height:16px" />
      </div>
      <div class="skeleton-box" style="width:8px;height:8px;border-radius:50%" />
    </div>

    <div class="flex items-baseline gap-1 mt-1">
      <div class="skeleton-box" style="width:60px;height:32px" />
      <div class="skeleton-box" style="width:20px;height:14px" />
    </div>

    <div class="mt-3">
      <div class="skeleton-box" style="width:100%;height:6px;border-radius:9999px" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  min-width: 160px;
  flex: 1;
  background: var(--ag-card);
  border: 1px solid var(--ag-border);
  border-radius: 16px;
}

.skeleton-box {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.flex { display: flex; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-1 { gap: 0.25rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-3 { margin-top: 0.75rem; }
.mb-2 { margin-bottom: 0.5rem; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
