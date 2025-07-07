<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <!-- Вкладки для волонтёров -->
        <template v-if="isVolunteer">
          <ion-tab-button tab="events-list" href="/tabs/events-list">
            <ion-icon :icon="listOutline" />
            <ion-label>События</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="my-registrations" href="/tabs/my-registrations">
            <ion-icon :icon="readerOutline" />
            <ion-label>Мои записи</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="bonuses" href="/tabs/bonuses">
            <ion-icon :icon="trophyOutline" />
            <ion-label>Бонусы</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="volunteer-profile" href="/tabs/volunteer-profile">
            <ion-icon :icon="personOutline" />
            <ion-label>Профиль</ion-label>
          </ion-tab-button>
        </template>

        <!-- Вкладки для организаций -->
        <template v-if="isOrganization">
          <ion-tab-button tab="events-management" href="/tabs/events-management">
            <ion-icon :icon="calendarOutline" />
            <ion-label>Мои мероприятия</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="organization-profile" href="/tabs/organization-profile">
            <ion-icon :icon="businessOutline" />
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
  personOutline, 
  calendarOutline, 
  businessOutline,
  readerOutline,
  trophyOutline
} from 'ionicons/icons';
import { computed, watchEffect } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const isVolunteer = computed(() => authStore.isVolunteer);
const isOrganization = computed(() => authStore.isOrganization);

// Отладочная информация (только в development)
if (import.meta.env.DEV) {
  watchEffect(() => {
    console.log('📋 TabsPage состояние:', {
      isVolunteer: isVolunteer.value,
      isOrganization: isOrganization.value,
      userRole: authStore.user?.role,
      isAuthenticated: authStore.isAuthenticated
    });
  });
}
</script>
