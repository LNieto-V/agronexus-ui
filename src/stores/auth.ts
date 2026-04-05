import { defineStore } from 'pinia';
import { shallowRef, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = shallowRef<User | null>(null);
  const session = shallowRef<Session | null>(null);
  const loading = shallowRef(true);
  const initialized = shallowRef(false);

  const isAuthenticated = computed(() => !!user.value);
  const accessToken = computed(() => session.value?.access_token || null);

  const userDisplayName = computed(() => {
    if (!user.value) return 'Farmer';
    return user.value.user_metadata?.display_name || user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || 'Farmer';
  });

  function setSession(newSession: Session | null) {
    session.value = newSession;
    user.value = newSession?.user || null;
    loading.value = false;
  }

  async function updateProfile(updates: { display_name?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
    user.value = data.user;
    return data;
  }

  async function initialize() {
    if (initialized.value) return;

    const { data } = await supabase.auth.getSession();
    setSession(data.session);

    supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    initialized.value = true;
    loading.value = false;
  }

  async function signUp(credentials: { email: string; password: any; data?: any }) {
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) throw error;
    return data;
  }

  async function signIn(credentials: { email: string; password: any }) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    setSession(data.session);
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
  }

  return { 
    user, session, loading, initialized, isAuthenticated, 
    accessToken, userDisplayName, initialize, setSession, 
    signUp, signIn, signOut, updateProfile 
  };
});
