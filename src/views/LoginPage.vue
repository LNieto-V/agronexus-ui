<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { Leaf, Mail, Lock } from 'lucide-vue-next';
import AppSpinner from '@/components/AppSpinner.vue';

const email = ref('');
const password = ref('');
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const { showToast } = useToast();

const handleLogin = async () => {
  loading.value = true;
  try {
    await authStore.signIn({ email: email.value, password: password.value });
    showToast('Welcome back, explorer.', 'success', 2000);
    router.replace('/tabs/home');
  } catch (error: any) {
    showToast(error.message || 'Authentication failed', 'danger', 3000);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-wrapper">
      <div class="auth-card">
        <!-- Brand -->
        <div class="brand-section">
          <div class="logo-container">
            <Leaf :size="32" class="text-primary emerald-leaf" color="#4edea3" />
          </div>
          <h1 class="brand-name">AgroNexus <span class="text-primary">AI</span></h1>
          <p class="brand-tagline">Secure access to your agricultural protocols</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="auth-form" id="login-form">
          <div class="input-group">
            <label class="input-label" for="login-email">Email Address</label>
            <div class="input-wrap">
              <Mail :size="18" class="input-icon" />
              <input
                id="login-email"
                v-model="email"
                type="email"
                placeholder="operator@observatory.ag"
                required
                autocomplete="email"
                class="auth-input"
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label" for="login-password">Security Key</label>
            <div class="input-wrap">
              <Lock :size="18" class="input-icon" />
              <input
                id="login-password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
                class="auth-input"
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            class="premium-btn"
            :disabled="loading"
          >
            <AppSpinner v-if="loading" size="sm" />
            <span>{{ loading ? 'AUTHENTICATING...' : 'INITIALIZE UPLINK' }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="auth-footer">
          <p>UNAUTHORIZED ACCESS PROHIBITED</p>
          <RouterLink to="/register" class="link-btn">Request Clearance</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap');

.auth-page {
  min-height: 100vh;
  background: #0c1324;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}

.auth-wrapper {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: rgba(46, 52, 71, 0.4);
  box-shadow: inset 0 1px 0 rgba(78, 222, 163, 0.1), 0 30px 60px rgba(0, 79, 52, 0.08);
  backdrop-filter: blur(30px);
  border: none;
  border-radius: 24px;
  padding: 3rem 2.5rem;
  text-align: center;
}

.brand-section { margin-bottom: 2.5rem; }

.logo-container {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.25rem;
  background: rgba(78, 222, 163, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 4s ease infinite;
}

.emerald-leaf {
  color: #4edea3;
  filter: drop-shadow(0 0 8px rgba(78, 222, 163, 0.6));
}

.brand-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.03em;
  color: #dce1fb;
}

.brand-name .text-primary {
  color: #4edea3;
}

.brand-tagline {
  color: #bfc9c3;
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
  font-weight: 400;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.75rem;
  color: #bfc9c3;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 0;
  color: #bfc9c3;
  pointer-events: none;
}

.auth-input {
  width: 100%;
  padding: 0.75rem 0 0.75rem 2rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(64, 73, 68, 0.2);
  color: #dce1fb;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  outline: none;
}

.auth-input::placeholder { color: rgba(191, 201, 195, 0.3); }

.auth-input:focus {
  border-bottom-color: #4edea3;
  box-shadow: 0 4px 10px -4px rgba(78, 222, 163, 0.2);
}

.premium-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 52px;
  margin-top: 1rem;
  background: linear-gradient(135deg, #4edea3 0%, #004f34 100%);
  border: none;
  border-radius: 0.375rem;
  color: #dce1fb;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(78, 222, 163, 0.15);
}

.premium-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(78, 222, 163, 0.4);
}

.premium-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.auth-footer {
  font-size: 0.75rem;
  color: #bfc9c3;
  letter-spacing: 0.05em;
}

.auth-footer p { margin: 0 0 0.75rem; opacity: 0.7; }

.link-btn {
  color: #4edea3;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.2s;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.link-btn:hover { opacity: 0.8; }

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 15px rgba(78, 222, 163, 0.1); }
  50% { box-shadow: 0 0 25px rgba(78, 222, 163, 0.3); }
}
</style>
