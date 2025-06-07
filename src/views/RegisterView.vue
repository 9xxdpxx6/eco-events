<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Регистрация</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Тип пользователя</ion-label>
          <ion-select v-model="userType" placeholder="Выберите тип пользователя">
            <ion-select-option value="volunteer">Волонтёр</ion-select-option>
            <ion-select-option value="organization">Организация</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item v-if="userType === 'organization'">
          <ion-label position="stacked">Название организации</ion-label>
          <ion-input v-model="organizationName" placeholder="Введите название организации"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input type="email" v-model="email" placeholder="Введите email"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Пароль</ion-label>
          <ion-input type="password" v-model="password" placeholder="Введите пароль"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Подтвердите пароль</ion-label>
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

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
         IonList, IonItem, IonLabel, IonInput, IonButton,
         IonSelect, IonSelectOption, IonToast } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export default defineComponent({
  name: 'RegisterView',
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonInput, IonButton,
    IonSelect, IonSelectOption, IonToast
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const userType = ref('');
    const organizationName = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const isLoading = ref(false);
    const showError = ref(false);
    const errorMessage = ref('');

    const validateForm = () => {
      if (!userType.value) {
        errorMessage.value = 'Выберите тип пользователя';
        return false;
      }

      if (userType.value === 'organization' && !organizationName.value) {
        errorMessage.value = 'Введите название организации';
        return false;
      }

      if (!email.value) {
        errorMessage.value = 'Введите email';
        return false;
      }

      if (!password.value) {
        errorMessage.value = 'Введите пароль';
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
        const userData = {
          email: email.value,
          password: password.value,
          type: userType.value as 'volunteer' | 'organization',
          ...(userType.value === 'organization' && { organizationName: organizationName.value })
        };

        const success = await authStore.register(userData);
        if (success) {
          router.push('/home');
        } else {
          errorMessage.value = 'Ошибка регистрации. Попробуйте позже.';
          showError.value = true;
        }
      } catch (error) {
        console.error('Registration error:', error);
        errorMessage.value = 'Ошибка регистрации. Попробуйте позже.';
        showError.value = true;
      } finally {
        isLoading.value = false;
      }
    };

    const goToLogin = () => {
      router.push('/login');
    };

    return {
      userType,
      organizationName,
      email,
      password,
      confirmPassword,
      isLoading,
      showError,
      errorMessage,
      handleRegister,
      goToLogin
    };
  }
});
</script>

<style scoped>
ion-content {
  --background: var(--ion-color-light);
}
</style> 