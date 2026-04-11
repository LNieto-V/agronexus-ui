<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AppToast from './components/AppToast.vue';
import AppModal from './components/AppModal.vue';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initialize();
});
</script>

<template>
  <RouterView />
  <AppToast />
  <AppModal />
</template>
