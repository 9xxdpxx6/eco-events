<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Редактировать профиль</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="handleSave">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Полное имя</ion-label>
            <ion-input v-model="form.fullName" required placeholder="Иванов Иван Иванович" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Логин</ion-label>
            <ion-input v-model="form.login" required />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input v-model="form.email" type="email" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Телефон</ion-label>
            <ion-input v-model="form.phoneNumber" type="tel" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Пароль (оставьте пустым, если не меняете)</ion-label>
            <ion-input v-model="form.password" type="password" autocomplete="new-password" />
          </ion-item>
        </ion-list>
        <ion-button expand="block" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Сохраняем...' : 'Сохранить' }}
        </ion-button>
      </form>
      <ion-toast :is-open="showToast" :message="toastMessage" :duration="3000" @didDismiss="showToast = false" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonToast } from '@ionic/vue';
import { useAuthStore } from '../stores/auth';
import { usersApi } from '../api/users';
import type { UserRegistrationRequestDto } from '../types/api';

const authStore = useAuthStore();
const user = authStore.user;

const form = ref<UserRegistrationRequestDto>({
  fullName: user?.fullName || '',
  login: user?.login || '',
  password: '',
  role: user?.role || 'USER',
  email: '',
  phoneNumber: '',
});

const isLoading = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

const handleSave = async () => {
  if (!user) return;
  isLoading.value = true;
  try {
    // Если пароль не введён, не отправляем его
    const payload: any = { ...form.value };
    if (!payload.password) {
      delete payload.password;
    }
    await usersApi.update(user.id, payload);
    toastMessage.value = 'Профиль успешно обновлён';
    showToast.value = true;
  } catch (e) {
    toastMessage.value = 'Ошибка при сохранении профиля';
    showToast.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script> 