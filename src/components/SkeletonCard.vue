<template>
  <div class="ag-glass-card skeleton-card p-4">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <ion-skeleton-text animated style="width: 24px; height: 24px; border-radius: 4px;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 80px; height: 16px;"></ion-skeleton-text>
      </div>
      <ion-skeleton-text animated style="width: 8px; height: 8px; border-radius: 50%;"></ion-skeleton-text>
    </div>
    
    <div class="flex items-baseline gap-1 mt-1">
      <ion-skeleton-text animated style="width: 60px; height: 32px;"></ion-skeleton-text>
      <ion-skeleton-text animated style="width: 20px; height: 14px;"></ion-skeleton-text>
    </div>
    
    <div class="mt-3">
      <div class="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <ion-skeleton-text animated style="width: 100%; height: 100%; margin: 0;"></ion-skeleton-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonSkeletonText } from '@ionic/vue';
</script>

<style scoped>
.skeleton-card {
  min-width: 160px;
  flex: 1;
}

.p-4 { padding: 1rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-1 { gap: 0.25rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-3 { margin-top: 0.75rem; }
.mb-2 { margin-bottom: 0.5rem; }
</style>
