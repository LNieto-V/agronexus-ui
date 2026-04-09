<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonSpinner, toastController 
} from '@ionic/vue';
import { personOutline, saveOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const displayName = ref('');
const loading = ref(false);

onMounted(() => {
  const metadata = authStore.user?.user_metadata as Record<string, any>;
  displayName.value = metadata?.display_name || '';
});

async function handleSave() {
  if (!displayName.value.trim()) return;
  
  loading.value = true;
  try {
    await authStore.updateProfile({ display_name: displayName.value });
    const toast = await toastController.create({
      message: '¡Perfil actualizado con éxito!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Error al actualizar el perfil',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="ag-card ag-glass p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="ag-icon-box bg-primary-soft text-primary">
        <ion-icon :icon="personOutline" />
      </div>
      <div>
        <h3 class="text-xl font-bold">Ajustes de Perfil</h3>
        <p class="text-xs text-muted">¿Cómo quieres que AgroNexus te llame?</p>
      </div>
    </div>

    <div class="ag-flex-col gap-4">
      <div class="input-group">
        <ion-item lines="none" class="glass-input !bg-white/5 border border-white/10 rounded-xl">
          <ion-label position="stacked" class="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Nombre de Usuario</ion-label>
          <ion-input
            v-model="displayName"
            placeholder="Ej: AgroMaster, Juan, etc."
            @keyup.enter="handleSave"
            class="text-base"
          ></ion-input>
        </ion-item>
      </div>

      <ion-button 
        expand="block" 
        @click="handleSave" 
        class="premium-btn !h-12 mt-2"
        :disabled="loading || !displayName.trim()"
      >
        <ion-icon v-if="!loading" :icon="saveOutline" slot="start" />
        <ion-spinner v-if="loading" name="crescent" slot="start" />
        <span>{{ loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
      </ion-button>
    </div>

    <div v-if="(authStore.user?.user_metadata as any)?.display_name" class="mt-4 flex items-center gap-2 text-xs text-primary/80 animate-fade-in">
      <ion-icon :icon="checkmarkCircleOutline" />
      <span>Tu nombre actual es: <strong>{{ (authStore.user?.user_metadata as any).display_name }}</strong></span>
    </div>
  </div>
</template>

<style scoped>
.glass-input {
  --padding-start: 12px;
  --padding-end: 12px;
  --highlight-height: 0;
}

.premium-btn {
  --background: var(--ag-primary);
  --border-radius: 12px;
  font-weight: 700;
  margin: 0;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
