<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding auth-page">
      <div class="auth-wrapper">
        <div class="glass-card auth-card">
          <div class="brand-section">
            <div class="logo-container">
              <ion-icon :icon="leafOutline" class="logo-icon animate-pulse" />
            </div>
            <h1 class="brand-name">AgroNexus <span class="text-primary">AI</span></h1>
            <p class="brand-tagline">Secure access to your agricultural protocols</p>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="input-group">
              <ion-item lines="none" class="glass-input">
                <ion-icon :icon="mailOutline" slot="start" />
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="Email Address"
                  required
                ></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-item lines="none" class="glass-input">
                <ion-icon :icon="lockClosedOutline" slot="start" />
                <ion-input
                  v-model="password"
                  type="password"
                  placeholder="Password"
                  required
                ></ion-input>
              </ion-item>
            </div>

            <ion-button 
              expand="block" 
              type="submit" 
              class="premium-btn mt-6"
              :disabled="loading"
            >
              <ion-spinner v-if="loading" slot="start" name="crescent"></ion-spinner>
              <span>{{ loading ? 'Authenticating...' : 'Sign In' }}</span>
            </ion-button>
          </form>

          <div class="auth-footer mt-8">
            <p>Don't have an account?</p>
            <ion-button fill="clear" router-link="/register" class="text-primary font-bold">
              Create Account
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonContent, IonInput, IonButton, 
  IonIcon, IonItem, IonSpinner, toastController 
} from '@ionic/vue';
import { leafOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  try {
    await authStore.signIn({ email: email.value, password: password.value });
    const toast = await toastController.create({
      message: 'Welcome back, explorer.',
      duration: 2000,
      color: 'success',
      position: 'bottom',
      cssClass: 'premium-toast'
    });
    await toast.present();
    router.replace('/tabs/home');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Authentication failed',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  --background: radial-gradient(circle at top right, #1a2a1a 0%, #0a0a0a 100%);
}

.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  text-align: center;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
}

.brand-section {
  margin-bottom: 2.5rem;
}

.logo-container {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: var(--ag-primary-soft);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 32px;
  color: var(--ag-primary);
}

.brand-name {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -1px;
}

.brand-tagline {
  color: #888;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.glass-input {
  --background: rgba(255, 255, 255, 0.05);
  --border-radius: 12px;
  --color: white;
  --placeholder-color: #666;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.glass-input:focus-within {
  border-color: var(--ag-primary);
  background: rgba(255, 255, 255, 0.08);
}

.premium-btn {
  --background: var(--ag-primary);
  --background-hover: #45a049;
  --border-radius: 12px;
  --box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  height: 52px;
  font-weight: 700;
  text-transform: none;
  font-size: 1rem;
}

.auth-footer {
  font-size: 0.9rem;
  color: #666;
}

.animate-pulse {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
