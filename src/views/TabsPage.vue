<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <!-- Вкладки для волонтёров -->
        <template v-if="isVolunteer">
          <ion-tab-button tab="events-list" href="/tabs/events-list">
            <ion-icon aria-hidden="true" :icon="listOutline" />
            <ion-label>Мероприятия</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="events-map" href="/tabs/events-map">
            <ion-icon aria-hidden="true" :icon="mapOutline" />
            <ion-label>Карта</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="volunteer-profile" href="/tabs/volunteer-profile">
            <ion-icon aria-hidden="true" :icon="personOutline" />
            <ion-label>Профиль</ion-label>
          </ion-tab-button>
        </template>

        <!-- Вкладки для организаций -->
        <template v-if="isOrganization">
          <ion-tab-button tab="events-management" href="/tabs/events-management">
            <ion-icon aria-hidden="true" :icon="calendarOutline" />
            <ion-label>Мои мероприятия</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="organization-profile" href="/tabs/organization-profile">
            <ion-icon aria-hidden="true" :icon="businessOutline" />
            <ion-label>Профиль</ion-label>
          </ion-tab-button>
        </template>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonTabBar, 
  IonTabButton, 
  IonTabs, 
  IonLabel, 
  IonIcon, 
  IonPage, 
  IonRouterOutlet 
} from '@ionic/vue';
import { 
  listOutline, 
  mapOutline, 
  personOutline, 
  calendarOutline, 
  businessOutline 
} from 'ionicons/icons';
import { computed, watchEffect } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const isVolunteer = computed(() => authStore.isVolunteer);
const isOrganization = computed(() => authStore.isOrganization);

// Отладочная информация
watchEffect(() => {
  console.log('📋 TabsPage состояние:', {
    isVolunteer: isVolunteer.value,
    isOrganization: isOrganization.value,
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated
  });
});
</script>
