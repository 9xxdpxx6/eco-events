<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Регистрация</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Выбор роли -->
      <div class="role-selector">
        <ion-segment v-model="userRole" class="role-segment">
          <ion-segment-button value="USER">
            <ion-label>Волонтёр</ion-label>
          </ion-segment-button>
          <ion-segment-button value="ADMIN">
            <ion-label>Организатор</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <ion-list>
        <ion-item>
          <ion-label position="stacked">{{ userRole === 'ADMIN' ? 'Название организации *' : 'Полное имя *' }}</ion-label>
          <ion-input 
            type="text" 
            v-model="fullName" 
            :placeholder="userRole === 'ADMIN' ? 'Введите название организации' : 'Введите ФИО'"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Логин *</ion-label>
          <ion-input type="text" v-model="login" placeholder="Введите логин"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input type="email" v-model="email" placeholder="Введите email"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Пароль *</ion-label>
          <ion-input type="password" v-model="password" placeholder="Введите пароль"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Подтвердите пароль *</ion-label>
          <ion-input type="password" v-model="confirmPassword" placeholder="Повторите пароль"></ion-input>
        </ion-item>
      </ion-list>

      <ion-button expand="block" class="ion-margin-top" @click="handleRegister" :disabled="isLoading">
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </ion-button>

      <ion-button expand="block" fill="clear" @click="goToLogin">
        Уже есть аккаунт? Войти
      </ion-button>

      <ion-toast
        :is-open="showError"
        :message="errorMessage"
        :duration="3000"
        @didDismiss="showError = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
         IonList, IonItem, IonLabel, IonInput, IonButton,
         IonToast, IonSegment, IonSegmentButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores';

const router = useRouter();
const authStore = useAuthStore();
const userRole = ref<'USER' | 'ADMIN'>('USER'); // По умолчанию волонтёр
const fullName = ref('');
const login = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const showError = ref(false);
const errorMessage = ref('');

const validateForm = () => {
  if (!fullName.value.trim()) {
    errorMessage.value = userRole.value === 'ADMIN' ? 'Введите название организации' : 'Введите полное имя';
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
      role: userRole.value, // Используем выбранную роль
      email: email.value.trim() || undefined,
      phoneNumber: undefined
    });
    router.push('/tabs/events-list');
  } catch (error) {
    console.error('Registration error:', error);
    errorMessage.value = 'Ошибка регистрации. Проверьте данные и попробуйте снова.';
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
ion-content {
  --background: var(--ion-color-light);
}

.role-selector {
  margin-bottom: 20px;
  opacity: 0.8;
}

.role-segment {
  --background: var(--ion-color-light-shade);
  --border-radius: 8px;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  font-size: 0.9rem;
}

.role-segment ion-segment-button {
  --color: var(--ion-color-medium);
  --color-checked: var(--ion-color-primary);
  --indicator-color: var(--ion-color-primary);
  min-height: 36px;
}

.role-segment ion-label {
  font-size: 0.85rem;
  font-weight: 500;
}
</style> 