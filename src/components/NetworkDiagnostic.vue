<template>
  <div class="network-diagnostic">
    <ion-card>
      <ion-card-header>
        <ion-card-title>🔍 Диагностика сети</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div class="diagnostic-item">
          <ion-icon :icon="wifiOutline" :color="internetStatus.color"></ion-icon>
          <span>Интернет: {{ internetStatus.text }}</span>
        </div>
        <div class="diagnostic-item">
          <ion-icon :icon="serverOutline" :color="serverStatus.color"></ion-icon>
          <span>Сервер: {{ serverStatus.text }}</span>
        </div>
        <div class="diagnostic-item">
          <ion-icon :icon="informationCircleOutline" :color="'primary'"></ion-icon>
          <span>URL: {{ serverUrl }}</span>
        </div>
        <div v-if="lastError" class="error-details">
          <ion-icon :icon="warningOutline" color="danger"></ion-icon>
          <span>Ошибка: {{ lastError }}</span>
        </div>
        <ion-button @click="runDiagnostic" :disabled="isRunning" expand="block">
          <ion-icon :icon="refreshOutline" v-if="isRunning" class="loading-icon"></ion-icon>
          {{ isRunning ? 'Проверяю...' : 'Проверить соединение' }}
        </ion-button>
        <div class="debug-info">
          <p>Статус: {{ isRunning ? 'Проверяется' : 'Готов' }}</p>
          <p>Интернет: {{ internetConnected ? 'Да' : 'Нет' }}</p>
          <p>Сервер: {{ serverConnected ? 'Да' : 'Нет' }}</p>
        </div>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonIcon,
  IonButton
} from '@ionic/vue';
import { 
  wifiOutline, 
  serverOutline, 
  informationCircleOutline,
  warningOutline,
  refreshOutline
} from 'ionicons/icons';

const showDiagnostic = ref(false);
const isRunning = ref(false);
const internetConnected = ref(false);
const serverConnected = ref(false);
const lastError = ref('');

const serverUrl = 'http://192.168.31.250:8080';

const internetStatus = computed(() => {
  if (isRunning.value) return { text: 'Проверяю...', color: 'warning' };
  return internetConnected.value 
    ? { text: 'Подключен', color: 'success' }
    : { text: 'Не подключен', color: 'danger' };
});

const serverStatus = computed(() => {
  if (isRunning.value) return { text: 'Проверяю...', color: 'warning' };
  return serverConnected.value 
    ? { text: 'Доступен', color: 'success' }
    : { text: 'Недоступен', color: 'danger' };
});

const checkInternet = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', { 
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.error('Internet check failed:', error);
    return false;
  }
};

const checkServer = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Пробуем разные методы запроса
    const methods = ['HEAD', 'GET', 'OPTIONS'];
    
    for (const method of methods) {
      try {
        console.log(`🔍 Пробуем ${method} запрос к ${serverUrl}`);
        
        const response = await fetch(serverUrl, {
          method: method as any,
          mode: 'cors', // Пробуем с CORS
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ ${method} запрос успешен:`, response.status, response.statusText);
        clearTimeout(timeoutId);
        return true;
      } catch (methodError) {
        console.log(`❌ ${method} запрос не удался:`, methodError);
        
        // Если CORS не работает, пробуем без CORS
        const errorMessage = methodError instanceof Error ? methodError.message : String(methodError);
        if (errorMessage.includes('CORS') || errorMessage.includes('fetch')) {
          try {
            console.log(`🔄 Пробуем ${method} без CORS`);
            const noCorsResponse = await fetch(serverUrl, {
              method: method as any,
              mode: 'no-cors',
              signal: controller.signal
            });
            
            console.log(`✅ ${method} без CORS успешен:`, noCorsResponse.type);
            clearTimeout(timeoutId);
            return true;
          } catch (noCorsError) {
            console.log(`❌ ${method} без CORS тоже не удался:`, noCorsError);
          }
        }
      }
    }
    
    clearTimeout(timeoutId);
    throw new Error('Все методы запроса не удались');
    
  } catch (error) {
    console.error('Server check failed:', error);
    lastError.value = error instanceof Error ? error.message : String(error);
    return false;
  }
};

const checkServerWithXHR = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    
    xhr.onload = () => {
      console.log('✅ XMLHttpRequest успешен:', xhr.status, xhr.statusText);
      resolve(true);
    };
    
    xhr.onerror = () => {
      console.log('❌ XMLHttpRequest ошибка:', xhr.status, xhr.statusText);
      resolve(false);
    };
    
    xhr.ontimeout = () => {
      console.log('⏰ XMLHttpRequest таймаут');
      resolve(false);
    };
    
    try {
      xhr.open('GET', serverUrl, true);
      xhr.send();
    } catch (error) {
      console.log('❌ XMLHttpRequest исключение:', error);
      resolve(false);
    }
  });
};

const checkServerWithPing = async (): Promise<boolean> => {
  try {
    // Пробуем простой ping через fetch с очень коротким таймаутом
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${serverUrl}/ping`, {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.log('❌ Ping не удался:', error);
    return false;
  }
};

const checkServerWithImage = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log('✅ Изображение загружено - сервер доступен');
      resolve(true);
    };
    img.onerror = () => {
      console.log('❌ Изображение не загрузилось');
      resolve(false);
    };
    
    // Пробуем загрузить изображение с сервера
    img.src = `${serverUrl}/favicon.ico?t=${Date.now()}`;
    
    // Таймаут через 3 секунды
    setTimeout(() => {
      console.log('⏰ Таймаут загрузки изображения');
      resolve(false);
    }, 3000);
  });
};

const checkServerWithWebSocket = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Пробуем WebSocket подключение
      const ws = new WebSocket(`ws://192.168.31.250:8080`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket подключение успешно');
        ws.close();
        resolve(true);
      };
      
      ws.onerror = (error) => {
        console.log('❌ WebSocket ошибка:', error);
        resolve(false);
      };
      
      // Таймаут через 3 секунды
      setTimeout(() => {
        console.log('⏰ WebSocket таймаут');
        ws.close();
        resolve(false);
      }, 3000);
      
    } catch (error) {
      console.log('❌ WebSocket исключение:', error);
      resolve(false);
    }
  });
};

const checkServerWithNative = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Пробуем через нативный Android-код
      const capacitor = (window as any).Capacitor;
      if (capacitor && capacitor.isNativePlatform()) {
        // Используем Capacitor HTTP плагин если доступен
        console.log('🔄 Пробуем нативный HTTP запрос...');
        
        // Простой fetch с минимальными заголовками
        fetch(serverUrl, {
          method: 'GET',
          mode: 'no-cors',
          headers: {
            'Accept': '*/*',
            'User-Agent': 'EcoEvents/1.0'
          }
        })
        .then(() => {
          console.log('✅ Нативный запрос успешен');
          resolve(true);
        })
        .catch((error) => {
          console.log('❌ Нативный запрос не удался:', error);
          resolve(false);
        });
      } else {
        resolve(false);
      }
    } catch (error) {
      console.log('❌ Нативный запрос исключение:', error);
      resolve(false);
    }
  });
};

const runDiagnostic = async () => {
  isRunning.value = true;
  lastError.value = '';
  
  try {
    // Проверяем интернет
    internetConnected.value = await checkInternet();
    
    // Проверяем сервер через fetch
    serverConnected.value = await checkServer();
    
    // Если fetch не работает, пробуем XMLHttpRequest
    if (!serverConnected.value) {
      console.log('🔄 Пробуем XMLHttpRequest...');
      serverConnected.value = await checkServerWithXHR();
    }
    
    // Если XMLHttpRequest не работает, пробуем ping
    if (!serverConnected.value) {
      console.log('🔄 Пробуем ping...');
      serverConnected.value = await checkServerWithPing();
    }
    
    // Если ping не работает, пробуем загрузку изображения
    if (!serverConnected.value) {
      console.log('🔄 Пробуем загрузку изображения...');
      serverConnected.value = await checkServerWithImage();
    }
    
    // Если изображение не загружается, пробуем WebSocket
    if (!serverConnected.value) {
      console.log('🔄 Пробуем WebSocket...');
      serverConnected.value = await checkServerWithWebSocket();
    }
    
    // Если WebSocket не работает, пробуем нативный запрос
    if (!serverConnected.value) {
      console.log('🔄 Пробуем нативный запрос...');
      serverConnected.value = await checkServerWithNative();
    }
    
  } catch (error) {
    console.error('Diagnostic error:', error);
    lastError.value = error instanceof Error ? error.message : String(error);
  } finally {
    isRunning.value = false;
  }
};

// Показываем диагностику при тройном нажатии на заголовок
const showDiagnosticOnTripleTap = () => {
  showDiagnostic.value = !showDiagnostic.value;
};

onMounted(() => {
  console.log('🚀 NetworkDiagnostic компонент загружен');
  
  // Добавляем обработчик для показа диагностики
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      showDiagnostic.value = !showDiagnostic.value;
    }
  });
  
  // Автоматически запускаем диагностику через 2 секунды
  setTimeout(() => {
    console.log('⏰ Автоматически запускаем диагностику...');
    runDiagnostic();
  }, 2000);
});
</script>

<style scoped>
.network-diagnostic {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
  background: white;
  border: 2px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.diagnostic-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.error-details {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  padding: 8px;
  background: var(--ion-color-danger-tint);
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.debug-info {
  margin-top: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
}

.debug-info p {
  margin: 4px 0;
  color: #666;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 