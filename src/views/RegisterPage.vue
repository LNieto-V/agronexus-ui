<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding auth-page">
      <div class="auth-wrapper">
        <div class="glass-card auth-card">
          <div class="brand-section">
            <div class="logo-container">
              <ion-icon :icon="sparklesOutline" class="logo-icon animate-glow" />
            </div>
            <h1 class="brand-name">Join <span class="text-primary">AgroNexus</span></h1>
            <p class="brand-tagline">Start your agricultural optimization journey</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="input-group">
              <ion-item lines="none" class="glass-input">
                <ion-icon :icon="personOutline" slot="start" />
                <ion-input
                  v-model="displayName"
                  type="text"
                  placeholder="Username (e.g. AgroMaster)"
                  required
                ></ion-input>
              </ion-item>
            </div>

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

            <div class="input-group">
              <ion-item lines="none" class="glass-input">
                <ion-icon :icon="shieldCheckmarkOutline" slot="start" />
                <ion-input
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
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
              <span>{{ loading ? 'Creating Account...' : 'Get Started' }}</span>
            </ion-button>
          </form>

          <div class="auth-footer mt-8">
            <p>Already have an account?</p>
            <ion-button fill="clear" router-link="/login" class="text-primary font-bold">
              Sign In
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
import { sparklesOutline, mailOutline, lockClosedOutline, shieldCheckmarkOutline, personOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    const toast = await toastController.create({
      message: "Passwords do not match",
      duration: 3000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
    return;
  }

  loading.value = true;
  try {
    await authStore.signUp({ 
      email: email.value, 
      password: password.value,
      data: { display_name: displayName.value }
    });
    const toast = await toastController.create({
      message: 'Account created! Please check your email for confirmation.',
      duration: 5000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
    router.replace('/login');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Registration failed',
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
  --background: radial-gradient(circle at bottom left, #1a2a1a 0%, #0a0a0a 100%);
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
  border-radius: 50%;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.premium-btn {
  --background: var(--ag-primary);
  --border-radius: 12px;
  height: 52px;
  font-weight: 700;
  text-transform: none;
}

.animate-glow {
  animation: glow 3s infinite ease-in-out;
}

@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 5px var(--ag-primary)); }
  50% { filter: drop-shadow(0 0 15px var(--ag-primary)); }
}
</style>
