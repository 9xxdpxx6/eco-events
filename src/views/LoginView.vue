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
          <ion-label position="stacked">Email</ion-label>
          <ion-input type="email" v-model="email" placeholder="Введите email"></ion-input>
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

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
         IonList, IonItem, IonLabel, IonInput, IonButton,
         IonToast } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export default defineComponent({
  name: 'LoginView',
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonInput, IonButton,
    IonToast
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const email = ref('');
    const password = ref('');
    const isLoading = ref(false);
    const showError = ref(false);

    const handleLogin = async () => {
      if (!email.value || !password.value) {
        showError.value = true;
        return;
      }

      isLoading.value = true;
      try {
        const success = await authStore.login(email.value, password.value);
        if (success) {
          // Перенаправляем на соответствующую главную страницу в зависимости от роли
          if (authStore.isVolunteer) {
            router.push('/tabs/events-list');
          } else if (authStore.isOrganization) {
            router.push('/tabs/events-management');
          } else {
            // Если роль не определена, перенаправляем на базовый tabs
            router.push('/tabs/');
          }
        } else {
          showError.value = true;
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

    return {
      email,
      password,
      isLoading,
      showError,
      handleLogin,
      goToRegister
    };
  }
});
</script>

<style scoped>
ion-content {
  --background: var(--ion-color-light);
}
</style> 