// Проверка наличия интернет-соединения
export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', { mode: 'no-cors' });
    return true;
  } catch (error) {
    return false;
  }
};

// Проверка наличия соединения с сервером
export const checkServerAvailability = async (baseUrl: string): Promise<boolean> => {
  const timeout = 5000; // 5 секунд

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${baseUrl}`, {
      method: 'GET',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true; // Сервер ответил
  } catch (error) {
    console.error('Ошибка при проверке доступности сервера:', error);
    return false; // Сервер не отвечает
  }
};

// Типы ошибок
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Интерфейс для классифицированной ошибки
export interface ClassifiedError {
  type: ErrorType;
  message: string;
  originalError?: any;
}

// Функция для классификации ошибок
export const classifyError = (error: any): ClassifiedError => {
  // Проверяем сетевые ошибки
  if (!error.response) {
    // Ошибки сети (нет интернета, сервер недоступен)
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED' || error.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Отсутствует соединение с сервером. Проверьте подключение к интернету.',
        originalError: error
      };
    }
    
    // Timeout ошибки
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Превышено время ожидания ответа от сервера. Попробуйте позже.',
        originalError: error
      };
    }
    
    // Общие сетевые ошибки
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Проблема с соединением. Проверьте подключение к интернету.',
      originalError: error
    };
  }

  // Проверяем HTTP статусы
  const status = error.response?.status;
  
  if (status >= 500) {
    return {
      type: ErrorType.SERVER_ERROR,
      message: 'Ошибка сервера. Попробуйте позже.',
      originalError: error
    };
  }
  
  if (status === 401) {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: 'Неверный логин или пароль.',
      originalError: error
    };
  }
  
  if (status === 409) {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: 'Пользователь с таким логином уже существует.',
      originalError: error
    };
  }
  
  if (status === 400) {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: error.response?.data?.message || 'Некорректные данные.',
      originalError: error
    };
  }

  // Неизвестная ошибка
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: 'Произошла неизвестная ошибка. Попробуйте позже.',
    originalError: error
  };
};

// Функция для получения понятного сообщения об ошибке для конкретного действия
export const getErrorMessage = (error: any, context: 'login' | 'register'): string => {
  const classified = classifyError(error);
  
  if (classified.type === ErrorType.NETWORK_ERROR) {
    return classified.message;
  }
  
  if (context === 'login') {
    if (classified.type === ErrorType.VALIDATION_ERROR) {
      return 'Неверный логин или пароль.';
    }
    return 'Ошибка входа. Попробуйте позже.';
  }
  
  if (context === 'register') {
    if (classified.type === ErrorType.VALIDATION_ERROR && error.response?.status === 409) {
      return 'Пользователь с таким логином уже существует.';
    }
    if (classified.type === ErrorType.VALIDATION_ERROR) {
      return classified.message;
    }
    return 'Ошибка регистрации. Попробуйте позже.';
  }
  
  return classified.message;
};

// Класс для хранения кэша
export class Cache {
  private static instance: Cache;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 минут

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
} 