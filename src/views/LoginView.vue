<template>
  <ion-page class="login-page">
    <ion-content class="login-content">
      <div class="login-container">
        <!-- Заголовок и логотип -->
        <div class="login-header">
          <div class="eco-icon">
            <ion-icon :icon="leafOutline" />
          </div>
          <div class="app-branding">
            <div class="app-title-section">
              <img src="@/assets/logo-white.png" alt="EcoEvents Logo" class="app-logo" />
              <h1 class="app-title">EcoEvents</h1>
            </div>
            <p class="app-subtitle">Экологические мероприятия</p>
          </div>
        </div>

        <!-- Форма входа -->
        <div class="login-form-card eco-card">
          <div class="login-form-content">
            <h2 class="form-title">Вход в систему</h2>
            
            <div class="form-fields">
              <div class="input-group">
                <ion-label class="input-label">Логин</ion-label>
                <ion-input 
                  class="eco-input"
                  fill="outline"
                  type="text" 
                  v-model="login" 
                  placeholder="Введите ваш логин"
                  :clear-input="true"
                ></ion-input>
              </div>

              <div class="input-group">
                <ion-label class="input-label">Пароль</ion-label>
                <ion-input 
                  class="eco-input"
                  fill="outline"
                  type="password" 
                  v-model="password" 
                  placeholder="Введите ваш пароль"
                  :clear-input="true"
                ></ion-input>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="form-actions">
              <ion-button 
                expand="block" 
                size="large"
                class="login-button eco-button eco-button-primary"
                @click="handleLogin" 
                :disabled="isLoading || !canSubmit"
              >
                <ion-icon v-if="isLoading" :icon="refreshOutline" class="loading-icon" />
                {{ isLoading ? 'Вход...' : 'Войти' }}
              </ion-button>
              
              <div class="divider">
                <span class="divider-text">или</span>
              </div>
              
              <ion-button 
                expand="block" 
                fill="clear" 
                size="large"
                class="register-button eco-button eco-button-ghost"
                @click="goToRegister"
              >
                Создать аккаунт
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast для ошибок -->
      <ion-toast
        :is-open="showError"
        :message="errorMessage"
        :duration="4000"
        color="danger"
        position="top"
        @didDismiss="showError = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  IonPage, 
  IonContent, 
  IonLabel, 
  IonInput, 
  IonButton,
  IonToast,
  IonIcon 
} from '@ionic/vue';
import { leafOutline, refreshOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores';
import { getErrorMessage } from '../utils/network';

const router = useRouter();
const authStore = useAuthStore();
const login = ref('');
const password = ref('');
const isLoading = ref(false);
const showError = ref(false);
const errorMessage = ref('');

const canSubmit = computed(() => {
  return login.value.trim() && password.value.trim();
});

const handleLogin = async () => {
  if (!canSubmit.value) {
    errorMessage.value = 'Заполните все поля';
    showError.value = true;
    return;
  }

  isLoading.value = true;
  try {
    await authStore.login({ login: login.value.trim(), password: password.value });
    // Перенаправляем на соответствующую главную страницу в зависимости от роли
    if (authStore.isOrganization) {
      router.push('/tabs/events-management');
    } else {
      router.push('/tabs/events-list');
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = getErrorMessage(error, 'login');
    showError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-page {
  --background: var(--eco-primary);
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-secondary) 100%);
}

.login-content {
  --background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--eco-space-6);
}

.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.login-header {
  text-align: center;
  margin-bottom: var(--eco-space-8);
  margin-top: var(--eco-space-8);
  color: white;
}

.eco-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--eco-space-4) auto;
}

.eco-icon ion-icon {
  font-size: 80px;
  color: white;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.app-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-3xl);
  font-weight: var(--eco-font-weight-bold);
  margin: 0;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-stroke: 1px rgba(0, 0, 0, 0.1);
}

.app-branding {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--eco-space-4);
}

.app-title-section {
  display: flex;
  align-items: center;
  gap: var(--eco-space-3);
}

.app-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.app-subtitle {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-normal);
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.login-form-card {
  background: white;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-form-content {
  padding: var(--eco-space-8);
}

.form-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-2xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  text-align: center;
  margin: 0 0 var(--eco-space-8) 0;
}

.form-fields {
  margin-bottom: var(--eco-space-8);
}

.input-group {
  margin-bottom: var(--eco-space-6);
}

.input-label {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-700);
  margin-bottom: var(--eco-space-2);
  display: block;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.login-button {
  height: 56px;
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
}

.loading-icon {
  margin-right: var(--eco-space-2);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.divider {
  position: relative;
  text-align: center;
  margin: var(--eco-space-2) 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--eco-gray-200);
  z-index: 1;
}

.divider-text {
  background: white;
  padding: 0 var(--eco-space-4);
  color: var(--eco-gray-500);
  font-size: var(--eco-font-size-sm);
  position: relative;
  z-index: 2;
}

.register-button {
  height: 48px;
  font-size: var(--eco-font-size-base);
  color: var(--eco-primary) !important;
}

.register-button:hover {
  --background: var(--eco-gray-50) !important;
}

/* Отзывчивость */
@media (max-width: 480px) {
  .login-content {
    padding: var(--eco-space-4);
  }
  
  .login-form-content {
    padding: var(--eco-space-6);
  }
  
  .app-title {
    font-size: var(--eco-font-size-2xl);
  }
  
  .app-logo {
    width: 48px;
    height: 48px;
  }
  
  .app-title-section {
    gap: var(--eco-space-2);
  }
  
  .app-branding {
    gap: var(--eco-space-3);
  }
  
  .form-title {
    font-size: var(--eco-font-size-xl);
  }
}

.eco-input {
  --background: var(--eco-white);
  --color: var(--eco-gray-800);
  --border-color: var(--eco-gray-300);
  --border-radius: var(--eco-radius-md);
  --padding-start: var(--eco-space-4);
  --padding-end: var(--eco-space-4);
  --padding-top: var(--eco-space-3);
  --padding-bottom: var(--eco-space-3);
  font-size: var(--eco-font-size-base);
  border: 1px solid var(--border-color);
  transition: all var(--eco-transition-normal);
}

.eco-input:focus {
  --border-color: var(--eco-primary);
  box-shadow: 0 0 0 3px rgba(53, 90, 221, 0.1);
}
</style> 
