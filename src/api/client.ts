import axios from 'axios';
import router from '../router';

const API_URL = 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient; 