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
              <h2>{{ user?.email || 'Пользователь' }}</h2>
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
              <span class="stat-number">{{ statistics.eventsAttended || 0 }}</span>
              <span class="stat-label">Мероприятий посещено</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="trophyOutline" color="warning"></ion-icon>
              <span class="stat-number">{{ statistics.points || 0 }}</span>
              <span class="stat-label">Баллов заработано</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="timeOutline" color="success"></ion-icon>
              <span class="stat-number">{{ statistics.hoursVolunteered || 0 }}</span>
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
              <ion-item v-for="event in upcomingEvents" :key="event.id" button @click="openEventDetails(event.id)">
                <ion-icon :icon="calendarOutline" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h3>{{ event.title }}</h3>
                  <p>{{ formatDate(event.date) }}</p>
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
              <ion-item v-for="event in pastEvents" :key="event.id" button @click="openEventDetails(event.id)">
                <ion-icon :icon="checkmarkCircleOutline" slot="start" color="success"></ion-icon>
                <ion-label>
                  <h3>{{ event.title }}</h3>
                  <p>{{ formatDate(event.date) }}</p>
                  <p>{{ event.location }}</p>
                </ion-label>
                <ion-chip slot="end" color="success">
                  +{{ event.points || 10 }} баллов
                </ion-chip>
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
import { useAuthStore } from '../stores/auth';
import { ApiService } from '../services/apiService';

const router = useRouter();
const authStore = useAuthStore();
const apiService = ApiService.getInstance();

const user = computed(() => authStore.getUser);
const statistics = ref({
  eventsAttended: 0,
  points: 0,
  hoursVolunteered: 0
});
const selectedTab = ref('upcoming');
const upcomingEvents = ref<any[]>([]);
const pastEvents = ref<any[]>([]);

const loadStatistics = async () => {
  try {
    const data = await apiService.getStatistics();
    statistics.value = data as any;
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
};

const loadUserEvents = async () => {
  try {
    // Здесь будет запрос на получение мероприятий пользователя
    // Пока заглушка
    upcomingEvents.value = [];
    pastEvents.value = [];
  } catch (error) {
    console.error('Error loading user events:', error);
  }
};

const openEventDetails = (eventId: number) => {
  router.push(`/event-details/${eventId}`);
};

const leaveEvent = async (event: any) => {
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
            await apiService.leaveEvent(event.id);
            upcomingEvents.value = upcomingEvents.value.filter(e => e.id !== event.id);
            const toast = await toastController.create({
              message: 'Участие отменено',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          } catch (error) {
            console.error('Error leaving event:', error);
          }
        }
      }
    ]
  });
  await alert.present();
};

const editProfile = async () => {
  const toast = await toastController.create({
    message: 'Редактирование профиля будет доступно в следующих версиях',
    duration: 2000,
    color: 'primary'
  });
  await toast.present();
};

const showNotificationSettings = async () => {
  const alert = await alertController.create({
    header: 'Настройки уведомлений',
    message: 'Здесь вы сможете настроить push-уведомления о новых мероприятиях и напоминания.',
    buttons: ['Понятно']
  });
  await alert.present();
};

const showAbout = async () => {
  const alert = await alertController.create({
    header: 'О приложении',
    message: 'Эко-мероприятия v1.0\n\nПриложение для поиска и участия в экологических мероприятиях.\n\nРазработано для объединения волонтёров и экологических организаций.',
    buttons: ['Закрыть']
  });
  await alert.present();
};

const logout = async () => {
  const alert = await alertController.create({
    header: 'Выход',
    message: 'Вы уверены, что хотите выйти из аккаунта?',
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Выйти',
        handler: () => {
          authStore.logout();
          router.push('/login');
        }
      }
    ]
  });
  await alert.present();
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
  loadStatistics();
  loadUserEvents();
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

.profile-info h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
}

.profile-info p {
  margin: 0 0 8px 0;
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
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state p {
  margin: 16px 0 0 0;
}

ion-segment {
  margin-bottom: 16px;
}

ion-card {
  margin: 16px;
}
</style> 