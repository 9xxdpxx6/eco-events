import { defineStore } from 'pinia';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import type { AuthRequestDTO, AuthResponseDTO, UserRegistrationRequestDto } from '../types/api';

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

    async register(userData: UserRegistrationRequestDto) {
      try {
        // 1. Регистрируем пользователя
        const registeredUser = await usersApi.register(userData);
        
        // 2. Автоматически логинимся после регистрации
        const loginCredentials: AuthRequestDTO = {
          login: userData.login,
          password: userData.password
        };
        
        const authResponse = await authApi.login(loginCredentials);
        
        // 3. Сохраняем состояние авторизации
        this.user = authResponse;
        this.token = authResponse.token;
        this.isAuthenticated = true;
        localStorage.setItem('token', authResponse.token);
        localStorage.setItem('userType', authResponse.role);
        localStorage.setItem('userId', String(authResponse.id));
        
        return authResponse;
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
      localStorage.removeItem('userId');
    },

    async checkAuth() {
      this.isAuthLoading = true;
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userType');
      const id = localStorage.getItem('userId');
      
      if (token && role && id) {
        this.token = token;
        this.isAuthenticated = true;
        
        try {
          const user = await usersApi.getById(Number(id));
          // Создаем объект типа AuthResponseDTO
          this.user = { 
            ...user, 
            token 
          } as AuthResponseDTO;
        } catch (e) {
          if (import.meta.env.DEV) {
            console.error('[checkAuth] error loading user:', e);
          }
          // Создаем минимальный объект пользователя из localStorage
          this.user = {
            id: Number(id),
            fullName: 'Пользователь', // временное имя
            login: 'user',
            role: role as 'USER' | 'ADMIN',
            token
          } as AuthResponseDTO;
        }
      } else {
        this.token = null;
        this.isAuthenticated = false;
        this.user = null;
      }
      
      this.isAuthLoading = false;
    }
  }
}); 