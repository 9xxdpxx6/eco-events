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
            <div class="stat-item">
              <span class="stat-number">{{ totalParticipants }}</span>
              <span class="stat-label">Участников</span>
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
        <ion-item v-for="event in filteredEvents" :key="event.id">
          <ion-thumbnail slot="start">
            <img :src="event.image || '/assets/default-event.jpg'" />
          </ion-thumbnail>
          
          <ion-label>
            <h2>{{ event.title }}</h2>
            <p>{{ formatDate(event.date) }}</p>
            <p>{{ event.location }}</p>
            
            <div class="event-stats">
              <ion-chip color="primary">
                <ion-icon :icon="peopleOutline" />
                <ion-label>{{ event.participantsCount || 0 }} участников</ion-label>
              </ion-chip>
              <ion-chip :color="getEventStatusColor(event)">
                <ion-label>{{ getEventStatus(event) }}</ion-label>
              </ion-chip>
            </div>
          </ion-label>
          
          <div slot="end" class="event-actions">
            <ion-button fill="clear" @click="viewEventDetails(event.id)">
              <ion-icon :icon="eyeOutline" />
            </ion-button>
            <ion-button fill="clear" @click="editEvent(event.id)">
              <ion-icon :icon="createOutline" />
            </ion-button>
            <ion-button fill="clear" color="danger" @click="deleteEvent(event)">
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

      <!-- Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end">
        <ion-fab-button @click="createEvent">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
  toastController
} from '@ionic/vue';
import {
  addOutline,
  calendarOutline,
  peopleOutline,
  eyeOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { ApiService } from '../services/apiService';

const router = useRouter();
const apiService = ApiService.getInstance();

const events = ref<any[]>([]);
const filteredEvents = ref<any[]>([]);
const selectedFilter = ref('all');
const isLoading = ref(false);

const upcomingEventsCount = computed(() => {
  const now = new Date();
  return events.value.filter(event => new Date(event.date) > now).length;
});

const totalParticipants = computed(() => {
  return events.value.reduce((sum, event) => sum + (event.participantsCount || 0), 0);
});

const loadEvents = async () => {
  isLoading.value = true;
  try {
    // Здесь будет запрос на получение мероприятий организации
    const data = await apiService.getEvents();
    events.value = Array.isArray(data) ? data : [];
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
      filtered = filtered.filter(event => new Date(event.date) > now);
      break;
    case 'past':
      filtered = filtered.filter(event => new Date(event.date) <= now);
      break;
  }

  // Сортировка по дате
  filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  filteredEvents.value = filtered;
};

const createEvent = () => {
  router.push('/create-event');
};

const editEvent = (eventId: number) => {
  router.push(`/edit-event/${eventId}`);
};

const viewEventDetails = (eventId: number) => {
  router.push(`/event-details/${eventId}`);
};

const deleteEvent = async (event: any) => {
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
            await apiService.deleteEvent(event.id);
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

const getEventStatus = (event: any) => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  if (eventDate > now) {
    return 'Предстоящее';
  } else {
    return 'Завершено';
  }
};

const getEventStatusColor = (event: any) => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  return eventDate > now ? 'success' : 'medium';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
  gap: 4px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}

.event-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.event-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  height: 400px;
  text-align: center;
  color: var(--ion-color-medium);
  padding: 20px;
}

.empty-state h2 {
  margin: 16px 0 8px 0;
  color: var(--ion-color-dark);
}

.empty-state p {
  margin-bottom: 20px;
}

ion-segment {
  margin: 8px 16px;
}

ion-card {
  margin: 16px;
}
</style> 