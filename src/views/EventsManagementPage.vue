<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Мои мероприятия</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="createEvent">
            <ion-icon :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <!-- Поиск по ключевому слову -->
      <ion-searchbar v-model="searchText" placeholder="Поиск мероприятий..." clear-input></ion-searchbar>

      <!-- Статистика организации -->
      <ion-card>
        <ion-card-content>
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-number">{{ events.length }}</span>
              <span class="stat-label">Всего мероприятий</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ upcomingEventsCount }}</span>
              <span class="stat-label">Предстоящие</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Фильтры -->
      <ion-segment v-model="selectedFilter" @ionChange="filterEvents">
        <ion-segment-button value="all">
          <ion-label>Все</ion-label>
        </ion-segment-button>
        <ion-segment-button value="upcoming">
          <ion-label>Предстоящие</ion-label>
        </ion-segment-button>
        <ion-segment-button value="past">
          <ion-label>Прошедшие</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Список мероприятий -->
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Загружаем мероприятия...</p>
      </div>

      <ion-list v-else-if="filteredEvents.length > 0">
        <ion-item v-for="event in filteredEvents" :key="event.id ?? Math.random()" class="event-card-vertical" @click="viewEventDetails(Number(event.id))" button>
          <ion-thumbnail slot="start">
            <img :src="'/assets/default-event.jpg'" />
          </ion-thumbnail>
          <ion-label>
            <h2>{{ event.title }}</h2>
            <p>{{ formatDate(event.startTime) }}</p>
            <p>{{ event.location }}</p>
            <div class="event-stats">
              <ion-chip color="primary">
                <ion-icon :icon="peopleOutline" />
              </ion-chip>
              <ion-chip :color="getEventStatusColor(event)">
                <ion-label>{{ getEventStatus(event) }}</ion-label>
              </ion-chip>
            </div>
          </ion-label>
          <div class="event-actions-vertical" @click.stop>
            <ion-button fill="clear" @click="editEvent(Number(event.id))">
              <ion-icon :icon="createOutline" />
            </ion-button>
            <ion-button fill="clear" color="danger" @click="confirmDeleteEvent(event)">
              <ion-icon :icon="trashOutline" />
            </ion-button>
          </div>
        </ion-item>
      </ion-list>

      <!-- Пустое состояние -->
      <div v-else class="empty-state">
        <ion-icon :icon="calendarOutline" size="large" color="medium"></ion-icon>
        <h2>Нет мероприятий</h2>
        <p>Создайте своё первое мероприятие</p>
        <ion-button fill="outline" @click="createEvent">
          <ion-icon :icon="addOutline" slot="start" />
          Создать мероприятие
        </ion-button>
      </div>

      <!-- FAB теперь фиксирован -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="createEvent">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonButton,
  IonButtons,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonChip,
  IonFab,
  IonFabButton,
  alertController,
  toastController,
  IonSearchbar
} from '@ionic/vue';
import {
  addOutline,
  calendarOutline,
  peopleOutline,
  eyeOutline,
  createOutline,
  trashOutline,
  searchOutline
} from 'ionicons/icons';
import { useEventsStore, useAuthStore } from '../stores';
import type { EventDTO } from '../types/api';

const router = useRouter();
const eventsStore = useEventsStore();
const authStore = useAuthStore();

const events = ref<EventDTO[]>([]);
const filteredEvents = ref<EventDTO[]>([]);
const selectedFilter = ref('all');
const isLoading = ref(false);
const page = ref(0);
const size = 50;
const searchText = ref('');
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

const upcomingEventsCount = computed(() => {
  const now = new Date();
  return events.value.filter((event: EventDTO) => new Date(event.startTime) > now).length;
});

const loadEvents = async (hotSearch = false) => {
  isLoading.value = true;
  try {
    const organizerId = authStore.user?.id;
    await eventsStore.fetchEventsSearch(searchText.value, page.value, size);
    events.value = eventsStore.getEvents;
    filterEvents();
  } catch (error) {
    console.error('Error loading events:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки мероприятий',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const filterEvents = () => {
  let filtered = [...events.value];
  const now = new Date();
  switch (selectedFilter.value) {
    case 'upcoming':
      filtered = filtered.filter((event: EventDTO) => new Date(event.startTime) > now);
      break;
    case 'past':
      filtered = filtered.filter((event: EventDTO) => new Date(event.startTime) <= now);
      break;
  }
  filtered.sort((a: EventDTO, b: EventDTO) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  filteredEvents.value = filtered;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getEventStatus = (event: EventDTO) => {
  const now = new Date();
  const eventDate = new Date(event.startTime);
  
  if (eventDate < now) {
    return 'Завершено';
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'Скоро';
  } else {
    return 'Запланировано';
  }
};

const getEventStatusColor = (event: EventDTO) => {
  const now = new Date();
  const eventDate = new Date(event.startTime);
  
  if (eventDate < now) {
    return 'medium';
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'warning';
  } else {
    return 'success';
  }
};

const createEvent = () => {
  router.push('/create-event');
};

const editEvent = (eventId: number) => {
  router.push(`/edit-event/${eventId}`);
};

const viewEventDetails = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const deleteEvent = async (event: EventDTO) => {
  if (!event.id) return;
  const alert = await alertController.create({
    header: 'Удалить мероприятие',
    message: `Вы уверены, что хотите удалить "${event.title}"? Это действие нельзя отменить.`,
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Удалить',
        role: 'destructive',
        handler: async () => {
          try {
            if (!event.id) return;
            await eventsStore.deleteEvent(event.id);
            events.value = events.value.filter(e => e.id !== event.id);
            filterEvents();
            const toast = await toastController.create({
              message: 'Мероприятие удалено',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          } catch (error) {
            console.error('Error deleting event:', error);
            const toast = await toastController.create({
              message: 'Ошибка при удалении мероприятия',
              duration: 3000,
              color: 'danger'
            });
            await toast.present();
          }
        }
      }
    ]
  });
  
  await alert.present();
};

const confirmDeleteEvent = async (event: EventDTO) => {
  if (!event.id) return;
  const alert = await alertController.create({
    header: 'Удалить мероприятие?',
    message: `Вы уверены, что хотите удалить «${event.title}»? Это действие необратимо.`,
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Удалить',
        role: 'destructive',
        handler: async () => {
          await deleteEvent(event);
        }
      }
    ]
  });
  await alert.present();
};

watch(searchText, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    loadEvents(true);
  }, 400);
});

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.stats-row {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--ion-color-medium);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--ion-color-medium);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state h2 {
  margin: 16px 0 8px;
  color: var(--ion-color-dark);
}

.empty-state p {
  margin-bottom: 24px;
}

.event-stats {
  margin-top: 8px;
}

.event-card-vertical {
  flex-direction: column !important;
  align-items: flex-start !important;
  min-height: 180px;
}

.event-actions-vertical {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
}

ion-fab[slot="fixed"] {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 1000;
}

.search-bar {
  margin: 16px 16px 0 16px;
  border-radius: 8px;
  background: var(--ion-color-light, #222428);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  align-items: center;
}
</style> 