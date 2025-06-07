import { API_BASE_URL, API_ENDPOINTS } from '../config/endpoints';
import { checkInternetConnection, checkServerAvailability, Cache } from '../utils/network';
import { toastController } from '@ionic/vue';

// Типы ошибок
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Интерфейс для ошибок API
interface ApiError {
  type: ApiErrorType;
  message: string;
  details?: any;
}

// Функция для создания заголовков запроса
const createHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Класс для работы с API
export class ApiService {
  private static instance: ApiService;
  private cache: Cache;
  private isOffline: boolean = false;

  private constructor() {
    this.cache = Cache.getInstance();
    this.setupNetworkListeners();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Настройка слушателей состояния сети
  private setupNetworkListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private async handleOnline() {
    this.isOffline = false;
    await this.showToast('Соединение восстановлено', 'success');
  }

  private async handleOffline() {
    this.isOffline = true;
    await this.showToast('Нет подключения к интернету', 'warning');
  }

  // Показ уведомлений
  private async showToast(message: string, color: string = 'danger') {
    const toast = await toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  // Проверка состояния сети
  private async checkNetworkStatus(): Promise<boolean> {
    const hasInternet = await checkInternetConnection();
    if (!hasInternet) {
      await this.showToast('Нет подключения к интернету');
      return false;
    }

    const isServerAvailable = await checkServerAvailability(API_BASE_URL);
    if (!isServerAvailable) {
      await this.showToast('Сервер недоступен');
      return false;
    }

    return true;
  }

  // Обработка ошибок
  private async handleError(error: any): Promise<ApiError> {
    console.error('API Error:', error);

    if (!navigator.onLine) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: 'Нет подключения к интернету'
      };
    }

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          return {
            type: ApiErrorType.AUTH_ERROR,
            message: 'Требуется авторизация',
            details: data
          };
        case 403:
          return {
            type: ApiErrorType.AUTH_ERROR,
            message: 'Доступ запрещен',
            details: data
          };
        case 422:
          return {
            type: ApiErrorType.VALIDATION_ERROR,
            message: 'Ошибка валидации',
            details: data
          };
        default:
          return {
            type: ApiErrorType.SERVER_ERROR,
            message: 'Ошибка сервера',
            details: data
          };
      }
    }

    return {
      type: ApiErrorType.UNKNOWN_ERROR,
      message: 'Произошла неизвестная ошибка'
    };
  }

  // Основной метод для выполнения запросов
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false
  ): Promise<T> {
    // Логирование запроса
    console.log(`[API Request] ${options.method || 'GET'} ${endpoint}`);

    // Проверка сети
    if (!await this.checkNetworkStatus()) {
      // Если есть кэш и разрешено его использование
      if (useCache) {
        const cachedData = this.cache.get(endpoint);
        if (cachedData) {
          console.log('[API Cache] Using cached data for', endpoint);
          return cachedData;
        }
      }
      throw new Error('Нет подключения к интернету');
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...createHeaders(localStorage.getItem('token')),
          ...options.headers
        }
      });

      // Логирование ответа
      console.log(`[API Response] ${response.status} ${endpoint}`);

      if (!response.ok) {
        const text = await response.text();
        console.error('Ошибка ответа сервера:', response.status, text);
        throw await this.handleError({ response });
      }

      const data = await response.json();

      // Кэширование успешного ответа
      if (useCache) {
        this.cache.set(endpoint, data);
      }

      return data;
    } catch (error) {
      const apiError = await this.handleError(error);
      await this.showToast(apiError.message);
      throw apiError;
    }
  }

  // Методы для работы с мероприятиями
  async getEvents(useCache: boolean = true) {
    return this.request(API_ENDPOINTS.events.list, {}, useCache);
  }

  async getEventDetails(id: number, useCache: boolean = true) {
    return this.request(API_ENDPOINTS.events.details(id), {}, useCache);
  }

  async createEvent(eventData: any) {
    return this.request(API_ENDPOINTS.events.create, {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async updateEvent(id: number, eventData: any) {
    return this.request(API_ENDPOINTS.events.update(id), {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  }

  async deleteEvent(id: number) {
    return this.request(API_ENDPOINTS.events.delete(id), {
      method: 'DELETE'
    });
  }

  async joinEvent(id: number) {
    return this.request(API_ENDPOINTS.events.join(id), {
      method: 'POST'
    });
  }

  async leaveEvent(id: number) {
    return this.request(API_ENDPOINTS.events.leave(id), {
      method: 'POST'
    });
  }

  async getEventsWithParams(params: URLSearchParams) {
    return this.request(API_ENDPOINTS.events.list + '?' + params.toString());
  }

  // Методы для работы с профилем
  async getProfile(useCache: boolean = true) {
    return this.request(API_ENDPOINTS.profile.get, {}, useCache);
  }

  async updateProfile(profileData: any) {
    return this.request(API_ENDPOINTS.profile.update, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getStatistics(useCache: boolean = true) {
    return this.request(API_ENDPOINTS.profile.statistics, {}, useCache);
  }
} 