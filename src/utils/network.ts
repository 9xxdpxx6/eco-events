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