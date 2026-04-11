<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { Sparkles, Mail, Lock, ShieldCheck, User } from 'lucide-vue-next';
import AppSpinner from '@/components/AppSpinner.vue';

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const { showToast } = useToast();

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    showToast('Passwords do not match', 'warning', 3000);
    return;
  }
  loading.value = true;
  try {
    await authStore.signUp({
      email: email.value,
      password: password.value,
      data: { display_name: displayName.value }
    });
    showToast('Account created! Please check your email for confirmation.', 'success', 5000);
    router.replace('/login');
  } catch (error: any) {
    showToast(error.message || 'Registration failed', 'danger', 3000);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="brand-section">
          <div class="logo-container">
            <Sparkles :size="32" class="text-primary" />
          </div>
          <h1 class="brand-name">Join <span class="text-primary">AgroNexus</span></h1>
          <p class="brand-tagline">Start your agricultural optimization journey</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form" id="register-form">
          <div class="input-wrap">
            <User :size="18" class="input-icon" />
            <input
              id="register-name"
              v-model="displayName"
              type="text"
              placeholder="Username (e.g. AgroMaster)"
              required
              autocomplete="username"
              class="auth-input"
            />
          </div>

          <div class="input-wrap">
            <Mail :size="18" class="input-icon" />
            <input
              id="register-email"
              v-model="email"
              type="email"
              placeholder="Email Address"
              required
              autocomplete="email"
              class="auth-input"
            />
          </div>

          <div class="input-wrap">
            <Lock :size="18" class="input-icon" />
            <input
              id="register-password"
              v-model="password"
              type="password"
              placeholder="Password"
              required
              autocomplete="new-password"
              class="auth-input"
            />
          </div>

          <div class="input-wrap">
            <ShieldCheck :size="18" class="input-icon" />
            <input
              id="register-confirm"
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              autocomplete="new-password"
              class="auth-input"
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            class="premium-btn"
            :disabled="loading"
          >
            <AppSpinner v-if="loading" size="sm" />
            <span>{{ loading ? 'Creating Account...' : 'Get Started' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account?</p>
          <RouterLink to="/login" class="link-btn">Sign In</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: radial-gradient(circle at bottom left, #1a2a1a 0%, #09090b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-wrapper {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  text-align: center;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
}

.brand-section { margin-bottom: 2rem; }

.logo-container {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.25rem;
  background: var(--ag-primary-soft);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: glow 3s ease infinite;
}

.brand-name {
  font-size: 1.875rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.03em;
}

.brand-tagline {
  color: var(--ag-text-muted);
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--ag-text-muted);
  pointer-events: none;
}

.auth-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--ag-text);
  font-size: 0.9rem;
  font-family: var(--ag-font);
  transition: all 0.2s ease;
  outline: none;
}

.auth-input::placeholder { color: var(--ag-text-muted); }

.auth-input:focus {
  border-color: var(--ag-primary);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 3px rgba(var(--ag-primary-rgb), 0.15);
}

.premium-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 52px;
  margin-top: 0.5rem;
  background: var(--ag-primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--ag-font);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(var(--ag-primary-rgb), 0.3);
}

.premium-btn:hover:not(:disabled) {
  background: var(--ag-primary-hover);
  transform: translateY(-1px);
}

.premium-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.auth-footer {
  margin-top: 2rem;
  font-size: 0.875rem;
  color: var(--ag-text-muted);
}

.auth-footer p { margin: 0 0 0.5rem; }

.link-btn {
  color: var(--ag-primary);
  font-weight: 700;
  text-decoration: none;
}

.link-btn:hover { opacity: 0.8; }

@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 5px var(--ag-primary)); }
  50% { filter: drop-shadow(0 0 15px var(--ag-primary)); }
}
</style>
