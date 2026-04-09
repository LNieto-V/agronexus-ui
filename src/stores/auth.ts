import { defineStore } from 'pinia';
import { shallowRef, computed, ref } from 'vue';
import api, { userService } from '@/services/api';
import type { LoginCredentials, LoginResponse, SignUpCredentials } from '@/types';

const TOKEN_KEY = 'agronexus_token';
const USER_KEY = 'agronexus_user';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = shallowRef<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  
  const user = ref<LoginResponse['user'] | null>(
    JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  );

  const loading = shallowRef(false);
  const initialized = shallowRef(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  const userDisplayName = computed(() => {
    return user.value?.user_metadata?.display_name || user.value?.email?.split('@')[0] || 'Farmer';
  });

  function setSession(data: LoginResponse | null) {
    if (data) {
      accessToken.value = data.access_token;
      user.value = data.user || null;
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } else {
      accessToken.value = null;
      user.value = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  async function initialize() {
    if (initialized.value) return;
    initialized.value = true;
    loading.value = false;
  }

  async function signIn(credentials: LoginCredentials) {
    loading.value = true;
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      setSession(response.data);
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function signUp(credentials: SignUpCredentials) {
    loading.value = true;
    try {
      const response = await api.post<LoginResponse>('/auth/register', credentials);
      setSession(response.data);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    setSession(null);
  }

  async function updateProfile(metadata: Record<string, unknown>) {
    loading.value = true;
    try {
      await userService.updateProfile(metadata);
      if (user.value) {
        user.value.user_metadata = {
          ...user.value.user_metadata,
          ...metadata
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user.value));
      }
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return { 
    accessToken, user, loading, initialized, 
    isAuthenticated, userDisplayName, 
    initialize, signIn, signUp, signOut, updateProfile 
  };
});
