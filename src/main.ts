import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

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

const pinia = createPinia();

const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router);

// Инициализируем authStore после настройки Pinia
const authStore = useAuthStore();

// Сначала синхронно проверяем токен в localStorage
const token = localStorage.getItem('token');
if (token) {
  console.log('🔍 Найден токен в localStorage, устанавливаем предварительную авторизацию');
  
  // Получаем сохраненный тип пользователя
  const savedUserType = localStorage.getItem('userType');
  console.log('📱 Сохраненный тип пользователя из localStorage:', savedUserType);
  
  let userType: 'volunteer' | 'organization' = 'volunteer';
  if (savedUserType === 'organization') {
    userType = 'organization';
  }
  
  console.log('✅ Устанавливаем предварительные данные пользователя:', {
    token: token.substring(0, 10) + '...',
    userType: userType
  });
  
  authStore.$patch({
    token: token,
    isAuthenticated: true,
    user: { id: 1, email: 'qwe', type: userType },
    isAuthLoading: false
  });
}

// Выполняем полную проверку авторизации асинхронно
authStore.checkAuth().finally(() => {
  console.log('✅ Проверка авторизации завершена');
});

// Монтируем приложение сразу
router.isReady().then(() => {
  app.mount('#app');
});
