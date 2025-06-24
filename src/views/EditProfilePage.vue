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
            <ion-label position="stacked">Имя</ion-label>
            <ion-input v-model="form.firstName" required />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Фамилия</ion-label>
            <ion-input v-model="form.lastName" required />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Отчество</ion-label>
            <ion-input v-model="form.patronymic" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Логин</ion-label>
            <ion-input v-model="form.login" required />
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
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  patronymic: user?.patronymic || '',
  login: user?.login || '',
  password: '',
  role: user?.role || 'USER',
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