<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Карта мероприятий</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="refreshEvents">
            <ion-icon :icon="refreshOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <!-- Временная заглушка карты -->
      <div class="map-container">
        <div class="map-placeholder">
          <ion-icon :icon="mapOutline" size="large" color="primary"></ion-icon>
          <h2>Карта мероприятий</h2>
          <p>Здесь будет отображаться интерактивная карта с мероприятиями</p>
          <ion-button fill="outline" @click="showMapInfo">
            <ion-icon :icon="informationCircleOutline" slot="start" />
            Подробнее
          </ion-button>
        </div>
      </div>

      <!-- Список мероприятий внизу -->
      <div class="events-list-container">
        <ion-item-divider>
          <ion-label>Ближайшие мероприятия</ion-label>
        </ion-item-divider>
        
        <ion-list v-if="events.length > 0">
          <ion-item 
            v-for="event in events.slice(0, 3)" 
            :key="event.id"
            button
            @click="openEventDetails(Number(event.id))"
          >
            <ion-icon :icon="locationOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>{{ event.title }}</h3>
              <p>{{ event.location }}</p>
              <p>{{ formatDate(event.startTime) }}</p>
            </ion-label>
            <ion-button slot="end" fill="clear" size="small">
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>

        <div v-else class="empty-events">
          <p>Нет доступных мероприятий</p>
        </div>
      </div>

      <!-- Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end">
        <ion-fab-button @click="centerMapOnUser">
          <ion-icon :icon="locateOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonItemDivider,
  IonFab,
  IonFabButton,
  alertController,
  toastController
} from '@ionic/vue';
import {
  mapOutline,
  refreshOutline,
  locationOutline,
  informationCircleOutline,
  chevronForwardOutline,
  locateOutline
} from 'ionicons/icons';
import { useEventsStore } from '../stores';
import type { EventDTO } from '../types/api';

const router = useRouter();
const eventsStore = useEventsStore();

const events = ref<EventDTO[]>([]);

const loadEvents = async () => {
  try {
    await eventsStore.fetchEvents();
    events.value = eventsStore.getEvents;
  } catch (error) {
    console.error('Error loading events:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки мероприятий',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }
};

const refreshEvents = async () => {
  await loadEvents();
  const toast = await toastController.create({
    message: 'Карта обновлена',
    duration: 1500,
    color: 'success'
  });
  await toast.present();
};

const openEventDetails = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const showMapInfo = async () => {
  const alert = await alertController.create({
    header: 'Карта мероприятий',
    message: 'В будущих версиях здесь будет интерактивная карта с отображением всех экологических мероприятий в вашем регионе. Вы сможете:\n\n• Просматривать мероприятия по геолокации\n• Строить маршруты до места проведения\n• Фильтровать по расстоянию\n• Видеть популярность мероприятий',
    buttons: ['Понятно']
  });
  await alert.present();
};

const centerMapOnUser = async () => {
  const toast = await toastController.create({
    message: 'Определение местоположения...',
    duration: 2000,
    color: 'primary'
  });
  await toast.present();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.map-container {
  height: 60vh;
  position: relative;
  background: var(--ion-color-light);
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
  color: var(--ion-color-medium);
}

.map-placeholder h2 {
  margin: 16px 0 8px;
  color: var(--ion-color-dark);
}

.map-placeholder p {
  margin-bottom: 20px;
  max-width: 280px;
}

.events-list-container {
  background: white;
  border-radius: 16px 16px 0 0;
  margin-top: -16px;
  position: relative;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.empty-events {
  padding: 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

ion-item-divider {
  --background: var(--ion-color-light);
  font-weight: 600;
}
</style> 