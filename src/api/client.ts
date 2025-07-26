import axios from 'axios';
import router from '../router';

//const API_URL = 'http://localhost:8080';
// export const API_URL = 'http://192.168.227.172:8080';
export const API_URL = 'https://192.168.227.172:8443';
export const IMAGE_BASE_URL = `${API_URL}/uploads/previews`;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 секунд таймаут
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
  
  // Логируем запрос для отладки
  console.log('🌐 API Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    headers: config.headers,
    data: config.data
  });
  
  return config;
});

// Добавляем интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => {
    // Логируем успешный ответ
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Логируем ошибку для отладки
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      response: error.response?.data
    });
    
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
      } else if (error.message?.includes('fetch')) {
        error.message = 'Не удалось подключиться к серверу';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 