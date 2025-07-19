<template>
  <ion-page class="edit-profile-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/volunteer-profile" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="page-title">Редактировать профиль</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="handleSave" :disabled="isLoading" class="save-button">
            {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="profile-content">
      <!-- Hero секция -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-icon">
            <ion-icon :icon="user?.role === 'ORGANIZATION' ? businessOutline : personOutline" />
          </div>
                      <h1 class="hero-title">Редактирование профиля</h1>
          <p class="hero-subtitle">Управляйте своими личными данными</p>
        </div>
      </div>

      <div class="form-container">
        <form @submit.prevent="handleSave">
          <!-- Основная информация -->
          <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="informationCircleOutline" />
              <h2>Основная информация</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Полное имя *</label>
                <ion-input 
                  v-model="form.fullName" 
                  required 
                  placeholder="Иванов Иван Иванович"
                  class="eco-input"
                />
              </div>
              
              <div class="field-group">
                <label class="field-label">Логин *</label>
                <ion-input 
                  v-model="form.login" 
                  required 
                  placeholder="username"
                  class="eco-input"
                />
              </div>
            </div>
          </div>

          <!-- Контактная информация -->
          <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="mailOutline" />
              <h2>Контактная информация</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Email</label>
                <ion-input 
                  v-model="form.email" 
                  type="email" 
                  placeholder="example@email.com"
                  class="eco-input"
                />
              </div>
              
              <div class="field-group">
                <label class="field-label">Телефон</label>
                <ion-input 
                  v-model="form.phoneNumber" 
                  type="tel" 
                  placeholder="+7 (999) 123-45-67"
                  class="eco-input"
                />
              </div>
            </div>
          </div>

          <!-- Безопасность -->
          <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="lockClosedOutline" />
              <h2>Безопасность</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Новый пароль</label>
                <ion-input 
                  v-model="form.password" 
                  type="password" 
                  autocomplete="new-password"
                  placeholder="Оставьте пустым, если не меняете"
                  class="eco-input"
                />
                <div class="field-hint">
                  Минимум 6 символов, оставьте поле пустым если не хотите менять пароль
                </div>
              </div>
              
              <div class="field-group" v-if="form.password">
                <label class="field-label">Подтвердите пароль</label>
                <ion-input 
                  v-model="form.confirmPassword" 
                  type="password" 
                  autocomplete="new-password"
                  placeholder="Повторите новый пароль"
                  class="eco-input"
                  :class="{ 'error': form.confirmPassword && form.password !== form.confirmPassword }"
                />
                <div class="field-hint" v-if="form.confirmPassword && form.password !== form.confirmPassword">
                  Пароли не совпадают
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ion-content>

    <!-- Кнопка сохранения -->
    <ion-footer class="action-footer">
      <div class="footer-content">
        <ion-button 
          expand="block" 
          @click="handleSave" 
          :disabled="isLoading"
          class="save-button-main"
        >
          <ion-icon :icon="checkmarkOutline" slot="start" />
          {{ isLoading ? 'Сохранение...' : 'Сохранить изменения' }}
        </ion-button>
      </div>
    </ion-footer>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonFooter,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput
} from '@ionic/vue';
import { 
  personOutline, 
  informationCircleOutline, 
  mailOutline, 
  lockClosedOutline,
  checkmarkOutline,
  businessOutline
} from 'ionicons/icons';
import { useAuthStore } from '../stores/auth';
import { usersApi } from '../api/users';
import type { UserRegistrationRequestDto, UserRegistrationResponseDto } from '../types/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const form = ref<UserRegistrationRequestDto & { confirmPassword?: string }>({
  fullName: '',
  login: '',
  password: '',
  role: 'USER',
  email: '',
  phoneNumber: '',
  confirmPassword: '',
});

const isLoading = ref(false);

const loadUserData = async () => {
  try {
    console.log('Loading current user data');
    const userData = await usersApi.getMe();
    console.log('Received user data:', userData);
    
    // Обновляем форму с полученными данными
    form.value = {
      fullName: userData.fullName || '',
      login: userData.login || '',
      password: '', // Пароль не загружаем из соображений безопасности
      role: userData.role || 'USER',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      confirmPassword: ''
    };
    
    console.log('Form updated with:', form.value);
  } catch (error) {
    console.error('Error loading user data:', error);
    await showErrorToast('Ошибка при загрузке данных профиля', 3000);
  }
};

onMounted(loadUserData);

const handleSave = async () => {
  // Проверяем совпадение паролей
  if (form.value.password && form.value.password !== form.value.confirmPassword) {
    await showErrorToast('Пароли не совпадают', 3000);
    return;
  }
  
  isLoading.value = true;
  try {
    const payload: Partial<UserRegistrationRequestDto> = { ...form.value };
    if (!payload.password) {
      delete payload.password;
    }
    // Удаляем confirmPassword из payload, так как это поле только для проверки
    delete (payload as any).confirmPassword;
    
    console.log('🔄 EditProfilePage - Starting profile update');
    console.log('📋 Form Data:', JSON.stringify(form.value, null, 2));
    console.log('📤 Payload to send:', JSON.stringify(payload, null, 2));
    
    const updatedUser = await usersApi.updateMe(payload as UserRegistrationRequestDto);
    
    // Обновляем данные в хранилище
    authStore.updateUser(updatedUser);

    await showSuccessToast('Профиль успешно обновлён', 2000);
    
    // Очищаем поля паролей после успешного сохранения
    form.value.password = '';
    form.value.confirmPassword = '';
  } catch (e) {
    await showErrorToast('Ошибка при сохранении профиля', 3000);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.edit-profile-page {
  --background: var(--eco-background-secondary);
}

.edit-profile-page ion-header {
  box-shadow: none !important;
  --box-shadow: none !important;
}

.edit-profile-page ion-toolbar {
  box-shadow: none !important;
  --box-shadow: none !important;
}

.profile-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
}

.back-button,
.save-button {
  --color: var(--eco-gray-700);
}

/* Hero секция */
.hero-section {
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-secondary) 100%);
  padding: var(--eco-space-6) var(--eco-space-4) var(--eco-space-8);
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 400px;
  margin: 0 auto;
}

.hero-icon {
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--eco-space-4) auto;
}

.hero-icon ion-icon {
  font-size: 60px;
  color: white;
}

.hero-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-bold);
  color: white;
  margin: 0 0 var(--eco-space-2) 0;
  line-height: var(--eco-line-height-tight);
}

.hero-subtitle {
  font-size: var(--eco-font-size-base);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: var(--eco-line-height-normal);
}

/* Контейнер формы */
.form-container {
  padding: var(--eco-space-6) var(--eco-space-4);
  max-width: 600px;
  margin: 0 auto;
}

/* Секции формы */
.form-section {
  margin-bottom: var(--eco-space-6);
  background: var(--eco-white);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-6);
  border: 1px solid var(--eco-gray-200);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--eco-space-3);
  margin-bottom: var(--eco-space-6);
  padding-bottom: var(--eco-space-4);
  border-bottom: 1px solid var(--eco-gray-100);
}

.section-header ion-icon {
  font-size: 24px;
  color: var(--eco-primary);
}

.section-header h2 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
}

/* Поля формы */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-5);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-2);
}

.field-label {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-700);
  margin-bottom: var(--eco-space-1);
}

.field-hint {
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-500);
  margin-top: var(--eco-space-1);
  line-height: var(--eco-line-height-normal);
}

/* Стили input элементов */
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

.eco-input.error {
  --border-color: var(--eco-error);
  border-color: var(--eco-error);
}

/* Footer */
.action-footer {
  padding: var(--eco-space-4);
  background: var(--eco-white);
  border-top: 1px solid var(--eco-gray-200);
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
}

.save-button-main {
  --background: var(--eco-primary);
  --background-activated: var(--eco-primary-dark);
  --color: white;
  --border-radius: var(--eco-radius-lg);
  height: 56px;
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
}

.save-button-main:disabled {
  --opacity: 0.6;
}

/* Отзывчивость */
@media (max-width: 480px) {
  .hero-section {
    padding: var(--eco-space-4) var(--eco-space-3) var(--eco-space-6);
  }
  
  .hero-title {
    font-size: var(--eco-font-size-lg);
  }
  
  .form-container {
    padding: var(--eco-space-4) var(--eco-space-3);
  }
  
  .form-section {
    padding: var(--eco-space-4);
    margin-bottom: var(--eco-space-4);
  }
  
  .section-header {
    margin-bottom: var(--eco-space-4);
    padding-bottom: var(--eco-space-3);
  }
  
  .form-fields {
    gap: var(--eco-space-4);
  }
  
  .action-footer {
    padding: var(--eco-space-3);
  }
}
</style> 
