import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

// Mock de API
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  },
  userService: {
    updateProfile: vi.fn()
  }
}));

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('debería inicializarse vacío si no hay token en localStorage', () => {
    const auth = useAuthStore();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.accessToken).toBe(null);
  });

  it('debería inicializarse con datos si existen en localStorage', () => {
    localStorage.setItem('agronexus_token', 'fake-token');
    localStorage.setItem('agronexus_user', JSON.stringify({ email: 'test@example.com' }));
    
    // Necesitamos re-instanciar o asegurar que el store lea de localStorage
    // En Pinia, si el estado inicial se lee en el setup, debemos instanciarlo DESPUÉS del setItem
    const auth = useAuthStore();
    
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.accessToken).toBe('fake-token');
    expect(auth.user?.email).toBe('test@example.com');
  });

  it('debería hacer login exitoso (signIn)', async () => {
    const auth = useAuthStore();
    const mockResponse = {
      data: {
        access_token: 'new-token',
        user: { email: 'login@test.com' }
      }
    };
    
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    await auth.signIn({ email: 'login@test.com', password: 'password' });

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.accessToken).toBe('new-token');
    expect(localStorage.getItem('agronexus_token')).toBe('new-token');
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'login@test.com',
      password: 'password'
    });
  });

  it('debería limpiar sesión en signOut', () => {
    localStorage.setItem('agronexus_token', 'old-token');
    const auth = useAuthStore();
    
    auth.signOut();

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.accessToken).toBe(null);
    expect(localStorage.getItem('agronexus_token')).toBe(null);
  });
});
