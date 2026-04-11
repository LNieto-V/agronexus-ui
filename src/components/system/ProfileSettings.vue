<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User, Save, CheckCircle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import AppSpinner from '@/components/AppSpinner.vue';

const authStore = useAuthStore();
const { showToast } = useToast();
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
    showToast('¡Perfil actualizado con éxito!', 'success', 2000);
  } catch (error: any) {
    showToast(error.message || 'Error al actualizar el perfil', 'danger', 3000);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="ag-card ag-glass p-6">
    <div class="ag-flex-row gap-3 mb-6">
      <div class="ag-icon-box bg-primary-soft text-primary">
        <User :size="18" />
      </div>
      <div>
        <h3 class="text-xl font-bold">Ajustes de Perfil</h3>
        <p class="text-xs text-muted">¿Cómo quieres que AgroNexus te llame?</p>
      </div>
    </div>

    <div class="ag-flex-col gap-4">
      <div class="input-group">
        <label class="input-label" for="profile-name">Nombre de Usuario</label>
        <input
          id="profile-name"
          v-model="displayName"
          type="text"
          placeholder="Ej: AgroMaster, Juan, etc."
          class="profile-input"
          @keyup.enter="handleSave"
        />
      </div>

      <button
        id="save-profile-btn"
        class="save-btn"
        @click="handleSave"
        :disabled="loading || !displayName.trim()"
      >
        <AppSpinner v-if="loading" size="sm" />
        <Save v-else :size="18" />
        <span>{{ loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
      </button>
    </div>

    <div
      v-if="(authStore.user?.user_metadata as any)?.display_name"
      class="saved-notice"
    >
      <CheckCircle :size="14" class="text-primary" />
      <span>Tu nombre actual es: <strong>{{ (authStore.user?.user_metadata as any).display_name }}</strong></span>
    </div>
  </div>
</template>

<style scoped>
.input-group { display: flex; flex-direction: column; gap: 0.5rem; }

.input-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ag-primary);
}

.profile-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  color: var(--ag-text);
  font-size: 1rem;
  font-family: var(--ag-font);
  outline: none;
  transition: all 0.2s ease;
}

.profile-input::placeholder { color: var(--ag-text-muted); }

.profile-input:focus {
  border-color: var(--ag-primary);
  background: rgba(var(--ag-primary-rgb), 0.04);
  box-shadow: 0 0 0 3px rgba(var(--ag-primary-rgb), 0.1);
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 48px;
  background: var(--ag-primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) { background: var(--ag-primary-hover); }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.saved-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.75rem;
  color: rgba(var(--ag-primary-rgb), 0.8);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
