<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Профиль организации</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <!-- Информация об организации -->
      <ion-card class="profile-card">
        <ion-card-content>
          <div class="profile-header">
            <ion-avatar>
              <ion-icon :icon="businessOutline" size="large"></ion-icon>
            </ion-avatar>
            <div class="profile-info">
              <h2>{{ user?.login || 'Организация' }}</h2>
              <p>Экологическая организация</p>
              <ion-chip color="primary">
                <ion-icon :icon="checkmarkCircleOutline" />
                <ion-label>Верифицирована</ion-label>
              </ion-chip>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Статистика организации -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Статистика</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="stats-grid">
            <div class="stat-item">
              <ion-icon :icon="calendarOutline" color="primary"></ion-icon>
              <span class="stat-number">{{ statistics.eventsCreated || 0 }}</span>
              <span class="stat-label">Мероприятий создано</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="peopleOutline" color="success"></ion-icon>
              <span class="stat-number">{{ statistics.totalParticipants || 0 }}</span>
              <span class="stat-label">Всего участников</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="trophyOutline" color="warning"></ion-icon>
              <span class="stat-number">{{ statistics.rating || 0 }}</span>
              <span class="stat-label">Рейтинг</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Быстрые действия -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Быстрые действия</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="actions-grid">
            <ion-button expand="block" fill="outline" @click="createEvent">
              <ion-icon :icon="addOutline" slot="start" />
              Создать мероприятие
            </ion-button>
            <ion-button expand="block" fill="outline" @click="viewEvents">
              <ion-icon :icon="listOutline" slot="start" />
              Мои мероприятия
            </ion-button>
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
            <ion-item button @click="manageDocuments">
              <ion-icon :icon="documentOutline" slot="start"></ion-icon>
              <ion-label>Документы верификации</ion-label>
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
  alertController,
  toastController
} from '@ionic/vue';
import {
  businessOutline,
  logOutOutline,
  checkmarkCircleOutline,
  calendarOutline,
  peopleOutline,
  trophyOutline,
  addOutline,
  listOutline,
  createOutline,
  documentOutline,
  notificationsOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { useAuthStore } from '../stores';
import { useEventsStore } from '../stores';
import { useParticipantsStore } from '../stores';

const router = useRouter();
const authStore = useAuthStore();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();

const user = computed(() => authStore.getUser);
const statistics = ref({
  eventsCreated: 0,
  totalParticipants: 0,
  rating: 4.8
});

const loadStatistics = async () => {
  try {
    const userId = user.value?.id;
    if (!userId) return;
    // Получаем все мероприятия, созданные этой организацией
    await eventsStore.fetchEvents();
    const allEvents = eventsStore.getEvents;
    const userEvents = allEvents.filter(event => event.eventType?.name === user.value?.login); // или другой критерий, если есть
    // Получаем участников только этих мероприятий
    const { useParticipantsStore } = await import('../stores/participants');
    const participantsStore = useParticipantsStore();
    let totalParticipants = 0;
    for (const event of userEvents) {
      if (event.id) {
        await participantsStore.fetchEventParticipants(event.id);
        totalParticipants += participantsStore.getEventParticipants.length;
      }
    }
    statistics.value = {
      eventsCreated: userEvents.length,
      totalParticipants,
      rating: 4.8 // фиксированное значение
    };
  } catch (error) {
    console.error('Error loading statistics:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки статистики',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }
};

const createEvent = () => {
  router.push('/create-event');
};

const viewEvents = () => {
  router.push('/tabs/events-management');
};

const editProfile = () => {
  router.push('/edit-profile');
};

const manageDocuments = async () => {
  const alert = await alertController.create({
    header: 'Документы верификации',
    message: 'Здесь вы сможете загружать и управлять документами для подтверждения статуса организации.',
    buttons: ['Понятно']
  });
  await alert.present();
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

onMounted(() => {
  loadStatistics();
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

.actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
</style> 