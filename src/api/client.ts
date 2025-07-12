import axios from 'axios';
import router from '../router';

const API_URL = 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 секунд таймаут
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для добавления токена авторизации
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Не добавлять токен для login и registration
  const isAuthRequest = config.url?.includes('/auth/login') || config.url?.includes('/users/registration');
  if (token && !isAuthRequest) {
    config.headers = config.headers || {};
    config.headers.Authorization = token;
  }
  return config;
});

// Добавляем интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Логируем ошибку для отладки
    if (import.meta.env.DEV) {
      console.error('API Error:', error);
    }
    
    // Обрабатываем ошибки авторизации
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      router.push('/login');
    }
    
    // Для сетевых ошибок добавляем дополнительную информацию
    if (!error.response) {
      // Сетевая ошибка или таймаут
      if (error.code === 'ECONNABORTED') {
        error.message = 'Превышено время ожидания ответа от сервера';
      } else if (error.message === 'Network Error') {
        error.message = 'Ошибка соединения с сервером';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 