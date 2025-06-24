<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Вход в систему</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Логин</ion-label>
          <ion-input type="text" v-model="login" placeholder="Введите логин"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Пароль</ion-label>
          <ion-input type="password" v-model="password" placeholder="Введите пароль"></ion-input>
        </ion-item>
      </ion-list>
      
      <ion-button expand="block" class="ion-margin-top" @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? 'Вход...' : 'Войти' }}
      </ion-button>
      
      <ion-button expand="block" fill="clear" @click="goToRegister">
        Зарегистрироваться
      </ion-button>

      <ion-toast
        :is-open="showError"
        message="Ошибка входа. Проверьте данные и попробуйте снова."
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
         IonToast } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores';

const router = useRouter();
const authStore = useAuthStore();
const login = ref('');
const password = ref('');
const isLoading = ref(false);
const showError = ref(false);

const handleLogin = async () => {
  if (!login.value || !password.value) {
    showError.value = true;
    return;
  }

  isLoading.value = true;
  try {
    await authStore.login({ login: login.value, password: password.value });
    // Перенаправляем на соответствующую главную страницу в зависимости от роли
    if (authStore.isAdmin) {
      router.push('/tabs/events-management');
    } else {
      router.push('/tabs/events-list');
    }
  } catch (error) {
    console.error('Login error:', error);
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
ion-content {
  --background: var(--ion-color-light);
}
</style> 