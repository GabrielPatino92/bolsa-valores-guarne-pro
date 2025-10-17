import { create } from 'zustand';
import { User } from '@/lib/api';

/**
 * Estado de autenticación global con Zustand
 *
 * Este store maneja:
 * - Usuario actual
 * - Token JWT
 * - Estado de carga
 * - Funciones de login/logout
 */

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Acciones
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  /**
   * Guarda el usuario y token en el store y localStorage
   */
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    set({ user, token, isLoading: false });
  },

  /**
   * Borra la sesión del usuario
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  /**
   * Inicializa el store desde localStorage al cargar la app
   */
  initAuth: () => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');

      if (userStr && token) {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },
}));
