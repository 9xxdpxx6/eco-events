import { defineStore } from 'pinia';
import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from '../services/apiService';

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
  user: User | null;
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
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isUserAuthenticated: (state) => state.isAuthenticated,
    isOrganization: (state) => state.user?.type === 'organization',
    isVolunteer: (state) => state.user?.type === 'volunteer'
  },

  actions: {
    async login(email: string, password: string) {
      try {
        const api = ApiService.getInstance();
        const data = await api.request<AuthResponse>(API_ENDPOINTS.auth.login, {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        
        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;

        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user.type);
        
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },

    async register(userData: {
      email: string;
      password: string;
      type: 'volunteer' | 'organization';
      organizationName?: string;
    }) {
      try {
        const api = ApiService.getInstance();
        const data = await api.request<AuthResponse>(API_ENDPOINTS.auth.register, {
          method: 'POST',
          body: JSON.stringify(userData)
        });
        
        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;

        localStorage.setItem('token', data.token);
        
        return true;
      } catch (error) {
        console.error('Registration error:', error);
        return false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
    },

    async checkAuth() {
      console.log('🔍 Выполняем полную проверку авторизации...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ Токен не найден в localStorage');
        this.logout();
        return false;
      }

      console.log('✅ Токен найден, проверяем на сервере:', token);

      try {
        const api = ApiService.getInstance();
        const data = await api.request<{ user: User }>(API_ENDPOINTS.auth.me, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Данные пользователя получены с сервера:', data);
        
        // Обновляем данные пользователя актуальными с сервера
        console.log('🔄 Обновляем данные пользователя с сервера:', data.user);
        this.token = token;
        this.user = data.user;
        this.isAuthenticated = true;
        
        // Обновляем тип пользователя в localStorage на случай если он изменился
        localStorage.setItem('userType', data.user.type);
        
        return true;
      } catch (error) {
        console.error('❌ Ошибка проверки авторизации на сервере:', error);
        this.logout();
        return false;
      }
    }
  }
}); 