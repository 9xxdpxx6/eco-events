<template>
  <ion-page class="register-page">
    <ion-content class="register-content">
      <div class="register-container">
        <!-- Заголовок -->
        <div class="register-header">
          <div class="eco-icon">
            <ion-icon :icon="personAddOutline" />
          </div>
          <div class="app-branding">
            <div class="app-title-section">
              <img src="@/assets/logo-white.png" alt="Волонтёрство" class="app-logo" />
              <h1 class="app-title">Волонтёрство</h1>
            </div>
            <p class="app-subtitle">Присоединяйтесь и начните делать мир лучше</p>
          </div>
        </div>

        <!-- Форма регистрации -->
        <div class="register-form-card eco-card">
          <div class="register-form-content">
            <h2 class="form-title">Регистрация</h2>
            
            <!-- Выбор роли -->
            <div class="role-selector">
              <ion-label class="section-label">Выберите тип аккаунта</ion-label>
              <ion-segment v-model="userRole" class="role-segment">
                <ion-segment-button value="USER">
                  <div class="role-option">
                    <ion-icon :icon="heartOutline" />
                    <span>Волонтёр</span>
                  </div>
                </ion-segment-button>
                <ion-segment-button value="ORGANIZATION">
                  <div class="role-option">
                    <ion-icon :icon="businessOutline" />
                    <span>Организация</span>
                  </div>
                </ion-segment-button>
              </ion-segment>
            </div>

            <!-- Поля формы -->
            <div class="form-fields">
              <div class="input-group">
                <ion-label class="input-label">
                  {{ userRole === 'ORGANIZATION' ? 'Название организации' : 'Полное имя' }} *
                </ion-label>
                <ion-input 
                  class="eco-input"
                  fill="outline"
                  type="text" 
                  v-model="fullName" 
                  :placeholder="userRole === 'ORGANIZATION' ? 'Введите название организации' : 'Введите ваше ФИО'"
                  :clear-input="true"
                ></ion-input>
              </div>

              <div class="input-group">
                <ion-label class="input-label">Логин *</ion-label>
                <ion-input 
                  class="eco-input"
                  fill="outline"
                  type="text" 
                  v-model="login" 
                  placeholder="Придумайте логин"
                  :clear-input="true"
                ></ion-input>
              </div>

              <div class="input-group">
                <ion-label class="input-label">Email</ion-label>
                <ion-input 
                  class="eco-input"
                  fill="outline"
                  type="email" 
                  v-model="email" 
                  placeholder="email@example.com (необязательно)"
                  :clear-input="true"
                ></ion-input>
              </div>

              <div class="input-group">
                <ion-label class="input-label">Пароль *</ion-label>
                <ion-input 
                  class="eco-input"
                  fill="outline"
                  type="password" 
                  v-model="password" 
                  placeholder="Минимум 6 символов"
                  :clear-input="true"
                ></ion-input>
                <div class="password-strength" v-if="password">
                  <div class="strength-indicator" :class="passwordStrengthClass">
                    <div class="strength-bar"></div>
                  </div>
                  <span class="strength-text">{{ passwordStrengthText }}</span>
                </div>
              </div>

              <div class="input-group">
                <ion-label class="input-label">Подтвердите пароль *</ion-label>
                <ion-input 
                  class="eco-input"
                  fill="outline"
                  type="password" 
                  v-model="confirmPassword" 
                  placeholder="Повторите пароль"
                  :clear-input="true"
                ></ion-input>
                <div class="password-match" v-if="confirmPassword">
                  <ion-icon 
                    :icon="passwordsMatch ? checkmarkCircleOutline : closeCircleOutline" 
                    :class="{ 'match': passwordsMatch, 'no-match': !passwordsMatch }"
                  />
                  <span :class="{ 'text-success': passwordsMatch, 'text-error': !passwordsMatch }">
                    {{ passwordsMatch ? 'Пароли совпадают' : 'Пароли не совпадают' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="form-actions">
              <ion-button 
                expand="block" 
                size="large"
                class="register-button eco-button eco-button-primary"
                @click="handleRegister" 
                :disabled="isLoading || !canSubmit"
              >
                <ion-icon v-if="isLoading" :icon="refreshOutline" class="loading-icon" />
                {{ isLoading ? 'Создание аккаунта...' : 'Создать аккаунт' }}
      </ion-button>

              <div class="divider">
                <span class="divider-text">или</span>
              </div>
              
              <ion-button 
                expand="block" 
                fill="clear" 
                size="large"
                class="login-button eco-button eco-button-ghost"
                @click="goToLogin"
              >
        Уже есть аккаунт? Войти
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
  IonIcon,
  IonSegment,
  IonSegmentButton
} from '@ionic/vue';
import { 
  personAddOutline, 
  heartOutline, 
  businessOutline,
  refreshOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores';
import { getErrorMessage } from '../utils/network';

const router = useRouter();
const authStore = useAuthStore();
const userRole = ref<'USER' | 'ORGANIZATION'>('USER'); // По умолчанию волонтёр
const fullName = ref('');
const login = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const showError = ref(false);
const errorMessage = ref('');

const passwordStrength = computed(() => {
  const pass = password.value;
  if (!pass) return 0;
  if (pass.length < 6) return 1;
  if (pass.length < 8) return 2;
  if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return 4;
  return 3;
});

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'weak';
  if (strength <= 2) return 'fair';
  if (strength <= 3) return 'good';
  return 'strong';
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'Слабый пароль';
  if (strength <= 2) return 'Средний пароль';
  if (strength <= 3) return 'Хороший пароль';
  return 'Надёжный пароль';
});

const passwordsMatch = computed(() => {
  return password.value && confirmPassword.value && password.value === confirmPassword.value;
});

const canSubmit = computed(() => {
  return fullName.value.trim() && 
         login.value.trim() && 
         password.value && 
         confirmPassword.value &&
         passwordsMatch.value &&
         password.value.length >= 6;
});

const validateForm = () => {
  if (!fullName.value.trim()) {
    errorMessage.value = userRole.value === 'ORGANIZATION' ? 'Введите название организации' : 'Введите полное имя';
    return false;
  }

  if (!login.value.trim()) {
    errorMessage.value = 'Введите логин';
    return false;
  }

  if (!password.value) {
    errorMessage.value = 'Введите пароль';
    return false;
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Пароль должен содержать минимум 6 символов';
    return false;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Пароли не совпадают';
    return false;
  }

  return true;
};

const handleRegister = async () => {
  if (!validateForm()) {
    showError.value = true;
    return;
  }

  isLoading.value = true;
  try {
    await authStore.register({
      fullName: fullName.value.trim(),
      login: login.value.trim(),
      password: password.value,
      role: userRole.value,
      email: email.value.trim() || undefined,
      phoneNumber: undefined
    });
    router.push('/tabs/events-list');
  } catch (error) {
    console.error('Registration error:', error);
    errorMessage.value = getErrorMessage(error, 'register');
    showError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-page {
  --background: var(--eco-primary);
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-secondary) 100%);
}

.register-content {
  --background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--eco-space-6);
}

.register-container {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
}

.register-header {
  text-align: center;
  margin-bottom: var(--eco-space-8);
  margin-top: 48px; /* увеличенный отступ сверху */
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

.register-form-card {
  background: white;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-left: var(--eco-space-2);
  margin-right: var(--eco-space-2);
  margin-bottom: var(--eco-space-12);
}

.register-form-content {
  padding: var(--eco-space-6);
}

.form-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  text-align: center;
  margin: 0 0 var(--eco-space-6) 0;
}

.role-selector {
  margin-bottom: var(--eco-space-6);
}

.section-label {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-700);
  margin-bottom: var(--eco-space-3);
  display: block;
}

.role-segment {
  --background: var(--eco-gray-100);
  --border-radius: 8px;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.role-segment ion-segment-button {
  --indicator-color: var(--eco-gray-200);
}

.role-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--eco-space-1);
  padding: var(--eco-space-2) 0;
}

.role-option ion-icon {
  font-size: 18px;
}

.role-option span {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
}

.form-fields {
  margin-bottom: var(--eco-space-6);
}

.input-group {
  margin-bottom: var(--eco-space-5);
}

.input-label {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-700);
  margin-bottom: var(--eco-space-2);
  display: block;
}

.password-strength {
  margin-top: var(--eco-space-2);
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
}

.strength-indicator {
  width: 60px;
  height: 4px;
  background: var(--eco-gray-200);
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: all var(--eco-transition-normal);
  border-radius: 2px;
}

.strength-indicator.weak .strength-bar {
  width: 25%;
  background: var(--eco-error);
}

.strength-indicator.fair .strength-bar {
  width: 50%;
  background: var(--eco-warning);
}

.strength-indicator.good .strength-bar {
  width: 75%;
  background: var(--eco-secondary);
}

.strength-indicator.strong .strength-bar {
  width: 100%;
  background: var(--eco-success);
}

.strength-text {
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-500);
}

.password-match {
  margin-top: var(--eco-space-2);
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
}

.password-match ion-icon {
  font-size: 16px;
}

.password-match ion-icon.match {
  color: var(--eco-success);
}

.password-match ion-icon.no-match {
  color: var(--eco-error);
}

.password-match span {
  font-size: var(--eco-font-size-xs);
}

.text-success {
  color: var(--eco-success);
}

.text-error {
  color: var(--eco-error);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-3);
}

.register-button {
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

.login-button {
  height: 48px;
  font-size: var(--eco-font-size-base);
  color: var(--eco-primary) !important;
}



/* Отзывчивость */
@media (max-width: 480px) {
  .register-content {
    padding: var(--eco-space-4);
  }
  
  .register-form-content {
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
  --border-width: 1.5px;
  --border-radius: 12px;
  --padding-start: var(--eco-space-4);
  --padding-end: var(--eco-space-4);
  --padding-top: var(--eco-space-3);
  --padding-bottom: var(--eco-space-3);
  font-size: var(--eco-font-size-base);
  box-sizing: border-box;
}

.eco-input::part(native),
.eco-input::part(input) {
  border-radius: 12px !important;
  background: var(--eco-white) !important;
  border: 1.5px solid var(--eco-gray-300) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  color: var(--eco-gray-800) !important;
  outline: none !important;
}

.eco-input input {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  color: var(--eco-gray-800) !important;
  border-radius: 12px !important;
}

.eco-input:focus {
  --border-color: var(--eco-primary);
  box-shadow: 0 0 0 3px rgba(53, 90, 221, 0.1);
}
</style> 
