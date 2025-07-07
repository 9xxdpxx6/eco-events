<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/events-list"></ion-back-button>
        </ion-buttons>
        <ion-title>Детали мероприятия</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="shareEvent" v-if="event">
            <ion-icon :icon="shareOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Загружаем информацию...</p>
      </div>

      <div v-else-if="event">
        <!-- Изображение мероприятия -->
        <div class="event-image">
          <img :src="eventImagePlaceholder" />
          <div class="event-status" :class="getEventStatusClass()">
            {{ getEventStatus() }}
          </div>
        </div>

        <!-- Основная информация -->
        <ion-card>
          <ion-card-content>
            <h1>{{ event.title }}</h1>
            
            <div class="event-meta">
              <div class="meta-item">
                <ion-icon :icon="calendarOutline" color="primary" />
                <span>{{ formatDate(event.startTime) }}</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="locationOutline" color="primary" />
                <span>{{ event.location }}</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="businessOutline" color="primary" />
                <span>{{ event.eventType?.name }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Описание -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Описание</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>{{ event.description || 'Описание отсутствует' }}</p>
          </ion-card-content>
        </ion-card>

        <!-- Контактная информация -->
        <ion-card v-if="event.owner && (event.owner.phoneNumber || event.owner.email)">
          <ion-card-header>
            <ion-card-title>Контакты организатора</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-if="event.owner.email" button @click="openEmail(event.owner.email)">
                <ion-icon :icon="mailOutline" slot="start" color="primary" />
                <ion-label>
                  <h3>Email</h3>
                  <p>{{ event.owner.email }}</p>
                </ion-label>
              </ion-item>
              
              <ion-item v-if="event.owner.phoneNumber" button @click="openPhone(event.owner.phoneNumber)">
                <ion-icon :icon="callOutline" slot="start" color="primary" />
                <ion-label>
                  <h3>Телефон</h3>
                  <p>{{ event.owner.phoneNumber }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Участники (для организаций) -->
        <ion-card v-if="isAdmin && isMyEvent">
          <ion-card-header>
            <ion-card-title>Участники</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="participants.length > 0">
              <ion-item v-for="participant in participants" :key="participant.user.id">
                <ion-avatar slot="start">
                  <ion-icon :icon="personCircleOutline" />
                </ion-avatar>
                <ion-label>
                  <h3>{{ participant.user.fullName }}</h3>
                  <p>{{ formatDate(participant.createdAt) }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
            <p v-else class="no-participants">Пока нет участников</p>
          </ion-card-content>
        </ion-card>
      </div>

      <div v-else class="error-state">
        <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
        <h2>Мероприятие не найдено</h2>
        <p>Возможно, оно было удалено или у вас нет доступа</p>
        <ion-button fill="outline" @click="goBack">
          Вернуться назад
        </ion-button>
      </div>
    </ion-content>

    <!-- Кнопка регистрации/отмены (для волонтёров) -->
    <ion-footer v-if="event && !isAdmin">
      <ion-toolbar>
        <ion-button 
          expand="block" 
          :color="isUserRegistered ? 'danger' : 'primary'"
          @click="toggleRegistration"
          :disabled="isRegistering"
        >
          <ion-icon 
            :icon="isUserRegistered ? closeOutline : checkmarkOutline" 
            slot="start" 
          />
          {{ isRegistering ? 'Обработка...' : (isUserRegistered ? 'Отменить участие' : 'Принять участие') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>

    <!-- Кнопки редактирования (для организаций) -->
    <ion-footer v-if="event && isAdmin && isMyEvent">
      <ion-toolbar>
        <ion-button fill="outline" @click="editEvent">
          <ion-icon :icon="createOutline" slot="start" />
          Редактировать
        </ion-button>
        <ion-button color="danger" @click="deleteEvent">
          <ion-icon :icon="trashOutline" slot="start" />
          Удалить
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonSpinner,
  alertController,
  toastController
} from '@ionic/vue';
import {
  shareOutline,
  calendarOutline,
  locationOutline,
  businessOutline,
  peopleOutline,
  mailOutline,
  callOutline,
  openOutline,
  personCircleOutline,
  alertCircleOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { useAuthStore } from '../stores/auth';
import { useEventsStore } from '../stores';
import { useParticipantsStore } from '../stores';
import type { EventResponseMediumDTO } from '../types/api';
import type { EventParticipantDTO } from '../types/api';
import eventImagePlaceholder from '../assets/event-no-image.png';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();

const event = ref<EventResponseMediumDTO | null>(null);
const participants = ref<EventParticipantDTO[]>([]);
const isLoading = ref(false);
const isRegistering = ref(false);

const isAdmin = computed(() => authStore.isAdmin);
const isMyEvent = computed(() => {
  if (!event.value || !authStore.user) return false;
  // Нет organizerId в EventDTO, всегда false
  return false;
});

const isUserRegistered = computed(() => {
  if (!event.value || !authStore.user) return false;
  return participants.value.some(p => p.user.id === authStore.user?.id);
});

const loadEvent = async () => {
  isLoading.value = true;
  try {
    const eventId = parseInt(route.params.id as string);
    await eventsStore.fetchEventById(eventId);
    event.value = eventsStore.getCurrentEvent;

    // Загружаем участников
    await participantsStore.fetchEventParticipants(eventId);
    participants.value = participantsStore.getEventParticipants;

    // Проверяем регистрацию пользователя: убираю isRegistered

    if (isAdmin.value && isMyEvent.value) {
      // ... (остальное)
    }
  } catch (error) {
    console.error('Error loading event:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки мероприятия',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const toggleRegistration = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  isRegistering.value = true;
  try {
    if (event.value) {
      const userId = authStore.user?.id;
      if (!userId) throw new Error('Нет userId');
      if (!event.value?.id) return;
      
      // Правильная логика: проверяем статус регистрации
      if (isUserRegistered.value) {
        await participantsStore.unregisterFromEvent(userId, event.value.id);
      } else {
        await participantsStore.registerForEvent(userId, event.value.id);
      }
      
      await loadEvent();
    }
  } catch (error) {
    console.error('Error toggling registration:', error);
    const toast = await toastController.create({
      message: 'Ошибка при регистрации на мероприятие',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isRegistering.value = false;
  }
};

const editEvent = () => {
  if (event.value) {
    router.push(`/event/${event.value.id}/edit`);
  }
};

const deleteEvent = async () => {
  if (!event.value) return;

  const alert = await alertController.create({
    header: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить это мероприятие?',
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
            if (!event.value?.id) return;
            await eventsStore.deleteEvent(event.value.id);
            const toast = await toastController.create({
              message: 'Мероприятие удалено',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
            router.push('/tabs/events-list');
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

const shareEvent = async () => {
  if (!event.value) return;

  try {
    await navigator.share({
      title: event.value.title,
      text: event.value.description,
      url: window.location.href
    });
  } catch (error) {
    console.error('Error sharing event:', error);
  }
};

const openEmail = (email: string) => {
  window.location.href = `mailto:${email}`;
};

const openPhone = (phone: string) => {
  window.location.href = `tel:${phone}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getEventStatus = () => {
  if (!event.value) return '';
  
  const now = new Date();
  const eventDate = new Date(event.value.startTime);
  
  if (eventDate < now) {
    return 'Завершено';
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'Скоро';
  } else {
    return 'Предстоящее';
  }
};

const getEventStatusClass = () => {
  if (!event.value) return '';
  
  const now = new Date();
  const eventDate = new Date(event.value.startTime);
  
  if (eventDate < now) {
    return 'status-finished';
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'status-soon';
  } else {
    return 'status-upcoming';
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadEvent();
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--ion-color-medium);
}

.event-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-status {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  border-radius: 16px;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.status-finished {
  background-color: var(--ion-color-medium);
}

.status-soon {
  background-color: var(--ion-color-warning);
}

.status-upcoming {
  background-color: var(--ion-color-success);
}

.event-meta {
  margin-top: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--ion-color-medium);
}

.meta-item ion-icon {
  font-size: 20px;
}

.no-participants {
  text-align: center;
  color: var(--ion-color-medium);
  padding: 16px;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: var(--ion-color-medium);
}

.error-state ion-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-state h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 500;
}

.error-state p {
  margin: 0 0 16px;
  font-size: 16px;
}
</style> 