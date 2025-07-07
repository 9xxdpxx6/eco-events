<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Мой профиль</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <!-- Информация о пользователе -->
      <ion-card class="profile-card">
        <ion-card-content>
          <div class="profile-header">
            <ion-avatar>
              <ion-icon :icon="personCircleOutline" size="large"></ion-icon>
            </ion-avatar>
            <div class="profile-info">
              <h2>{{ user?.fullName || '' }}</h2>
              <p>Волонтёр</p>
              <ion-chip color="success">
                <ion-icon :icon="checkmarkCircleOutline" />
                <ion-label>Активен</ion-label>
              </ion-chip>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Статистика -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Моя активность</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="stats-grid">
            <div class="stat-item">
              <ion-icon :icon="calendarOutline" color="primary"></ion-icon>
              <span class="stat-number">{{ statistics.eventsAttended }}</span>
              <span class="stat-label">Мероприятий посещено</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="trophyOutline" color="warning"></ion-icon>
              <span class="stat-number">{{ statistics.points }}</span>
              <span class="stat-label">Баллов заработано</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="timeOutline" color="success"></ion-icon>
              <span class="stat-number">{{ statistics.hoursVolunteered }}</span>
              <span class="stat-label">Часов волонтёрства</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- История мероприятий -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Мои мероприятия</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-segment v-model="selectedTab">
            <ion-segment-button value="upcoming">
              <ion-label>Предстоящие</ion-label>
            </ion-segment-button>
            <ion-segment-button value="past">
              <ion-label>Прошедшие</ion-label>
            </ion-segment-button>
          </ion-segment>

          <div v-if="selectedTab === 'upcoming'">
            <ion-list v-if="upcomingEvents.length > 0">
              <ion-item v-for="event in upcomingEvents" :key="event.id" button @click="openEventDetails(event.id!)" @click.stop="leaveEvent(event)">
                <ion-icon :icon="calendarOutline" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h3>{{ event.title }}</h3>
                  <p>{{ formatDate(event.startTime) }}</p>
                  <p>{{ event.location }}</p>
                </ion-label>
                <ion-button slot="end" fill="clear" color="danger" @click.stop="leaveEvent(event)">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-item>
            </ion-list>
            <div v-else class="empty-state">
              <ion-icon :icon="calendarOutline" size="large" color="medium"></ion-icon>
              <p>Нет предстоящих мероприятий</p>
            </div>
          </div>

          <div v-if="selectedTab === 'past'">
            <ion-list v-if="pastEvents.length > 0">
              <ion-item v-for="event in pastEvents" :key="event.id" button @click="openEventDetails(event.id!)" @click.stop="leaveEvent(event)">
                <ion-icon :icon="checkmarkCircleOutline" slot="start" color="success"></ion-icon>
                <ion-label>
                  <h3>{{ event.title }}</h3>
                  <p>{{ formatDate(event.startTime) }}</p>
                  <p>{{ event.location }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
            <div v-else class="empty-state">
              <ion-icon :icon="trophyOutline" size="large" color="medium"></ion-icon>
              <p>Нет завершённых мероприятий</p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Настройки -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Настройки</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item button @click="editProfile">
              <ion-icon :icon="createOutline" slot="start"></ion-icon>
              <ion-label>Редактировать профиль</ion-label>
            </ion-item>
            <ion-item button @click="showNotificationSettings">
              <ion-icon :icon="notificationsOutline" slot="start"></ion-icon>
              <ion-label>Уведомления</ion-label>
            </ion-item>
            <ion-item button @click="showAbout">
              <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
              <ion-label>О приложении</ion-label>
            </ion-item>
            <ion-item button @click="logout">
              <ion-icon :icon="logOutOutline" slot="start" color="danger"></ion-icon>
              <ion-label color="danger">Выйти</ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
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
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonButtons,
  IonIcon,
  IonAvatar,
  IonChip,
  IonLabel,
  IonList,
  IonItem,
  IonSegment,
  IonSegmentButton,
  alertController,
  toastController
} from '@ionic/vue';
import {
  personCircleOutline,
  logOutOutline,
  checkmarkCircleOutline,
  calendarOutline,
  trophyOutline,
  timeOutline,
  closeOutline,
  createOutline,
  notificationsOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { useAuthStore } from '../../stores';
import { useEventsStore } from '../../stores';
import { useParticipantsStore } from '../../stores';
import type { EventResponseMediumDTO } from '../../types/api';
import { usersApi } from '../../api/users';

const router = useRouter();
const authStore = useAuthStore();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();

const user = computed(() => authStore.getUser);
const statistics = ref({
  eventsAttended: 0,
  points: 0,
  hoursVolunteered: 0
});
const selectedTab = ref('upcoming');
const upcomingEvents = ref<EventResponseMediumDTO[]>([]);
const pastEvents = ref<EventResponseMediumDTO[]>([]);

const loadStatistics = async () => {
  const userId = user.value?.id;
  if (!userId) return;
  try {
    await participantsStore.fetchUserParticipants(userId);
    const participants = participantsStore.getUserParticipants;
    statistics.value = {
      eventsAttended: participants.length,
      points: 0,
      hoursVolunteered: 0
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const toast = await toastController.create({
        message: 'Не авторизован',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } else if (error?.response?.status !== 404) {
      const toast = await toastController.create({
        message: 'Ошибка загрузки статистики',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
};

const loadUserEvents = async () => {
  const userId = user.value?.id;
  if (!userId) return;
  try {
    await participantsStore.fetchUserParticipants(userId);
    const participants = participantsStore.getUserParticipants;
    const now = new Date();
    const eventIds = participants.map(p => p.event.id);
    const uniqueEventIds = Array.from(new Set(eventIds));
    const events: EventResponseMediumDTO[] = [];
    for (const eventId of uniqueEventIds) {
      try {
        const event = eventsStore.getEvents.find(e => e.id === eventId);
        if (!event) return;
        events.push(event);
      } catch (e) {}
    }
    upcomingEvents.value = events.filter(event => new Date(event.startTime) > now);
    pastEvents.value = events.filter(event => new Date(event.startTime) <= now);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const toast = await toastController.create({
        message: 'Не авторизован',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } else if (error?.response?.status !== 404) {
      const toast = await toastController.create({
        message: 'Ошибка загрузки мероприятий',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
};

const openEventDetails = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const leaveEvent = async (event: EventResponseMediumDTO) => {
  if (!event.id) return;
  const alert = await alertController.create({
    header: 'Отменить участие',
    message: `Вы уверены, что хотите отменить участие в "${event.title}"?`,
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Да, отменить',
        handler: async () => {
          try {
            const userId = user.value?.id;
            if (!userId || !event.id) return;
            await participantsStore.unregisterFromEvent(userId, event.id);
            upcomingEvents.value = upcomingEvents.value.filter(e => e.id !== event.id);
            
            const toast = await toastController.create({
              message: 'Участие отменено',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          } catch (error) {
            console.error('Error leaving event:', error);
            const toast = await toastController.create({
              message: 'Ошибка при отмене участия',
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

const editProfile = () => {
  router.push('/edit-profile');
};

const showNotificationSettings = () => {
  router.push('/notification-settings');
};

const showAbout = async () => {
  const alert = await alertController.create({
    header: 'О приложении',
    message: 'EcoEvents - приложение для организации и участия в экологических мероприятиях. Версия 1.0.0',
    buttons: ['Закрыть']
  });
  await alert.present();
};

const logout = async () => {
  const alert = await alertController.create({
    header: 'Выйти',
    message: 'Вы уверены, что хотите выйти из аккаунта?',
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Выйти',
        handler: async () => {
          try {
            await authStore.logout();
            router.push('/login');
          } catch (error) {
            console.error('Error logging out:', error);
            const toast = await toastController.create({
              message: 'Ошибка при выходе из аккаунта',
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(async () => {
  // Если нет ФИО или логина, подгружаем пользователя по id
  if (!user.value?.fullName || !user.value?.login) {
    const id = user.value?.id;
    if (id) {
      try {
        const freshUser = await usersApi.getById(id);
        authStore.user = { ...freshUser, token: authStore.token ?? '' };
      } catch (e) {
        // ignore
      }
    }
  }
  await loadStatistics();
  await loadUserEvents();
});
</script>

<style scoped>
.profile-card {
  margin: 16px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0 0 4px;
  font-size: 1.2rem;
  font-weight: 600;
}

.profile-info p {
  margin: 0 0 8px;
  color: var(--ion-color-medium);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--ion-color-dark);
}

.stat-label {
  font-size: 14px;
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

.empty-state p {
  margin-top: 16px;
}

ion-segment-button {
  font-size: 14px;
}
</style> 