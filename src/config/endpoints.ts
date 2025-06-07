// Базовый URL API
export const API_BASE_URL = 'http://localhost:3000/api'; // Измените на ваш URL

// Интерфейс для типизации эндпоинтов
export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    me: string;
  };
  events: {
    list: string;
    details: (id: number) => string;
    create: string;
    update: (id: number) => string;
    delete: (id: number) => string;
    join: (id: number) => string;
    leave: (id: number) => string;
  };
  profile: {
    get: string;
    update: string;
    statistics: string;
  };
}

// Конфигурация эндпоинтов
export const API_ENDPOINTS: ApiEndpoints = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`
  },
  events: {
    list: `${API_BASE_URL}/events`,
    details: (id: number) => `${API_BASE_URL}/events/${id}`,
    create: `${API_BASE_URL}/events`,
    update: (id: number) => `${API_BASE_URL}/events/${id}`,
    delete: (id: number) => `${API_BASE_URL}/events/${id}`,
    join: (id: number) => `${API_BASE_URL}/events/${id}/join`,
    leave: (id: number) => `${API_BASE_URL}/events/${id}/leave`
  },
  profile: {
    get: `${API_BASE_URL}/profile`,
    update: `${API_BASE_URL}/profile`,
    statistics: `${API_BASE_URL}/profile/statistics`
  }
}; 