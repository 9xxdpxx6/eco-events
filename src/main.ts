import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import { useAuthStore } from './stores/auth';

// Импортируем API клиент для тестирования
import { apiClient } from './api/client'

const pinia = createPinia();

const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router);

// Инициализируем authStore после настройки Pinia
const authStore = useAuthStore();

// Проверяем доступность сети
const checkNetworkAccess = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Пробуем сделать тестовый запрос к вашему серверу
      const response = await fetch('http://192.168.31.250:8080', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log('✅ Сетевое подключение работает');
    } catch (error) {
      console.warn('⚠️ Проблема с сетевым подключением:', error);
    }
  }
};

// Выполняем восстановление авторизации (синхронно, так как работает с localStorage)
if (import.meta.env.DEV) {
  console.log('✅ Авторизация проверена:', {
    isAuthenticated: authStore.isAuthenticated,
    userRole: authStore.user?.role
  });
}

// Тестируем API при загрузке приложения
console.log('🚀 Приложение запускается...')
console.log('🔗 API URL:', 'http://192.168.31.250:8080')

// Принудительно тестируем API
setTimeout(() => {
  console.log('🧪 Тестируем API...')
  
  // Тест 1: Простой GET запрос
  fetch('http://192.168.31.250:8080/v3/api-docs')
    .then(response => {
      console.log('✅ Fetch test успешен:', response.status)
    })
    .catch(error => {
      console.error('❌ Fetch test ошибка:', error)
    })
  
  // Тест 2: Axios запрос
  apiClient.get('/v3/api-docs')
    .then(response => {
      console.log('✅ Axios test успешен:', response.status)
    })
    .catch(error => {
      console.error('❌ Axios test ошибка:', error.message)
    })
  
  // Тест 3: HEAD запрос
  fetch('http://192.168.31.250:8080/api/auth/login', { method: 'HEAD' })
    .then(response => {
      console.log('✅ HEAD test успешен:', response.status)
    })
    .catch(error => {
      console.error('❌ HEAD test ошибка:', error)
    })
}, 1000)

router.isReady().then(async () => {
  await checkNetworkAccess();
  app.mount('#app');
});
