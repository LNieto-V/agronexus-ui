<template>
  <div class="ag-card p-6 flex flex-col skeleton-wrapper">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="skeleton-box" style="width:36px;height:36px;border-radius:12px" />
        <div class="skeleton-box" style="width:80px;height:12px" />
      </div>
    </div>

    <div class="flex items-baseline gap-1 mb-4 flex-grow">
      <div class="skeleton-box" style="width:60px;height:36px" />
      <div class="skeleton-box" style="width:20px;height:14px" />
    </div>

    <div class="progress-track">
      <div class="skeleton-box" style="width:100%;height:6px;border-radius:9999px" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-wrapper {
  min-width: 160px;
  flex: 1;
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
