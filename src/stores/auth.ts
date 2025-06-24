import { defineStore } from 'pinia';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import type { AuthRequestDTO, AuthResponseDTO } from '../types/api';

interface AuthResponse {
  token: string;
  user: User;
}

interface User {
  id: number;
  email: string;
  type: 'volunteer' | 'organization';
  organizationName?: string;
}

interface AuthState {
  user: AuthResponseDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isAuthLoading: true
  }),

  getters: {
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isUserAuthenticated: (state) => state.isAuthenticated,
    isOrganization: (state) => state.user?.role === 'ADMIN',
    isVolunteer: (state) => state.user?.role === 'USER'
  },

  actions: {
    async login(credentials: AuthRequestDTO) {
      try {
        const user = await authApi.login(credentials);
        this.user = user;
        this.token = user.token;
        this.isAuthenticated = true;
        localStorage.setItem('token', user.token);
        localStorage.setItem('userType', user.role);
        localStorage.setItem('userId', String(user.id));
        return user;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async register(userData: AuthRequestDTO) {
      try {
        const response = await authApi.login(userData);
        this.user = response;
        this.isAuthenticated = true;
        return response;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      authApi.logout();
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
    },

    async checkAuth() {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userType');
      const id = localStorage.getItem('userId');
      console.log('[checkAuth] token:', token, 'role:', role, 'id:', id);
      if (token && role && id) {
        this.token = token;
        this.isAuthenticated = true;
        try {
          const user = await usersApi.getMe();
          console.log('[checkAuth] user from API:', user);
          this.user = { ...user, token };
        } catch (e) {
          console.error('[checkAuth] error loading user:', e);
          this.user = null;
        }
      } else {
        this.token = null;
        this.isAuthenticated = false;
        this.user = null;
      }
    }
  }
}); 