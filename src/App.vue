<template>
  <ion-app>
    <ion-router-outlet :animated="true" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initialize();
});
</script>

<style>
/* Global Premium Transitions */
.ion-page {
  --animate-duration: 400ms;
}

/* Custom Modal Styles */
.premium-modal {
  --height: auto;
  --width: 90%;
  --max-width: 500px;
  --border-radius: 24px;
  --backdrop-opacity: 0.8;
}

/* Custom Toast Styles */
.premium-toast {
  --background: rgba(30, 30, 30, 0.9);
  --color: white;
  --border-radius: 12px;
  --box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}
</style>
