import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    session: null as Session | null,
    loading: true,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    accessToken: (state) => state.session?.access_token || null,
  },

  actions: {
    async initialize() {
      if (this.initialized) return;

      const { data: { session } } = await supabase.auth.getSession();
      this.setSession(session);

      supabase.auth.onAuthStateChange((_event, session) => {
        this.setSession(session);
      });

      this.initialized = true;
      this.loading = false;
    },

    setSession(session: Session | null) {
      this.session = session;
      this.user = session?.user || null;
      this.loading = false;
    },

    async signUp(credentials: { email: string; password: any }) {
      const { data, error } = await supabase.auth.signUp(credentials);
      if (error) throw error;
      return data;
    },

    async signIn(credentials: { email: string; password: any }) {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      this.setSession(data.session);
      return data;
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.setSession(null);
    },
  },
});
