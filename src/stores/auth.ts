import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api';
import { usersApi } from '../api';
import type { AuthRequestDTO, AuthResponseDTO, UserRegistrationRequestDto } from '../types/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthResponseDTO | null>(null);
  const isLoading = ref(false);

  // Восстанавливаем состояние при загрузке страницы
  const restoreAuth = () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');
    const userFullName = localStorage.getItem('userFullName');
    const userLogin = localStorage.getItem('userLogin');

    if (token && userType && userId && userFullName && userLogin) {
      user.value = {
        id: parseInt(userId),
        fullName: userFullName,
        login: userLogin,
        role: userType as 'USER' | 'ORGANIZATION',
        token
      };
    }
  };

  // Геттеры
  const isAuthenticated = computed(() => !!user.value);
  const isUser = computed(() => user.value?.role === 'USER');
  
  // Обновляем геттеры для новой роли ORGANIZATION
  const isOrganization = computed(() => user.value?.role === 'ORGANIZATION');
  
  // Оставляем isAdmin для обратной совместимости, но теперь он равен isOrganization
  const isAdmin = computed(() => user.value?.role === 'ORGANIZATION');

  // Действия
  const login = async (credentials: AuthRequestDTO) => {
    isLoading.value = true;
      try {
      const authData = await authApi.login(credentials);
      user.value = authData;

      // Сохраняем в localStorage
      localStorage.setItem('token', authData.token);
      localStorage.setItem('userType', authData.role);
      localStorage.setItem('userId', authData.id.toString());
      localStorage.setItem('userFullName', authData.fullName);
      localStorage.setItem('userLogin', authData.login);

      return authData;
      } catch (error) {
      console.error('Auth error:', error);
        throw error;
    } finally {
      isLoading.value = false;
      }
  };

  const register = async (userData: UserRegistrationRequestDto) => {
    isLoading.value = true;
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
      user.value = authResponse;
        localStorage.setItem('token', authResponse.token);
        localStorage.setItem('userType', authResponse.role);
      localStorage.setItem('userId', authResponse.id.toString());
      localStorage.setItem('userFullName', authResponse.fullName);
      localStorage.setItem('userLogin', authResponse.login);
        
        return authResponse;
      } catch (error) {
      console.error('Registration error:', error);
        throw error;
    } finally {
      isLoading.value = false;
      }
  };

  const logout = () => {
    user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userLogin');
    authApi.logout();
  };

  const createUser = async (fullName: string, login: string, password: string, role: 'USER' | 'ORGANIZATION') => {
    return {
      id: Date.now(), // Временный ID
      fullName,
      login,
      role: role as 'USER' | 'ORGANIZATION',
      token: 'mock-token'
    };
  };

  // Инициализация
  restoreAuth();

  return {
    user: user,
    isLoading,
    isAuthenticated,
    isUser,
    isOrganization,
    isAdmin, // Оставляем для обратной совместимости
    login,
    register,
    logout,
    createUser,
    restoreAuth
  };
}); 