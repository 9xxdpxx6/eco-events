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
          <img :src="event.image || '/assets/default-event.jpg'" />
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
                <span>{{ formatDate(event.date) }}</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="locationOutline" color="primary" />
                <span>{{ event.location }}</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="businessOutline" color="primary" />
                <span>{{ event.organization }}</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="peopleOutline" color="primary" />
                <span>{{ event.participantsCount || 0 }} участников</span>
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
        <ion-card>
          <ion-card-header>
            <ion-card-title>Контакты</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-if="event.contactEmail">
                <ion-icon :icon="mailOutline" slot="start" color="primary" />
                <ion-label>{{ event.contactEmail }}</ion-label>
                <ion-button slot="end" fill="clear" @click="openEmail(event.contactEmail)">
                  <ion-icon :icon="openOutline" />
                </ion-button>
              </ion-item>
              <ion-item v-if="event.contactPhone">
                <ion-icon :icon="callOutline" slot="start" color="primary" />
                <ion-label>{{ event.contactPhone }}</ion-label>
                <ion-button slot="end" fill="clear" @click="openPhone(event.contactPhone)">
                  <ion-icon :icon="openOutline" />
                </ion-button>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Участники (для организаций) -->
        <ion-card v-if="isOrganization && isMyEvent">
          <ion-card-header>
            <ion-card-title>Участники</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="participants.length > 0">
              <ion-item v-for="participant in participants" :key="participant.id">
                <ion-avatar slot="start">
                  <ion-icon :icon="personCircleOutline" />
                </ion-avatar>
                <ion-label>
                  <h3>{{ participant.name || participant.email }}</h3>
                  <p>{{ formatDate(participant.registeredAt) }}</p>
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
    <ion-footer v-if="event && isVolunteer">
      <ion-toolbar>
        <ion-button 
          expand="block" 
          :color="event.isRegistered ? 'danger' : 'primary'"
          @click="toggleRegistration"
          :disabled="isRegistering"
        >
          <ion-icon 
            :icon="event.isRegistered ? closeOutline : checkmarkOutline" 
            slot="start" 
          />
          {{ isRegistering ? 'Обработка...' : (event.isRegistered ? 'Отменить участие' : 'Принять участие') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>

    <!-- Кнопки редактирования (для организаций) -->
    <ion-footer v-if="event && isOrganization && isMyEvent">
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
import { ApiService } from '../services/apiService';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const apiService = ApiService.getInstance();

const event = ref<any>(null);
const participants = ref<any[]>([]);
const isLoading = ref(false);
const isRegistering = ref(false);

const isVolunteer = computed(() => authStore.isVolunteer);
const isOrganization = computed(() => authStore.isOrganization);
const isMyEvent = computed(() => {
  // Здесь нужно проверить, принадлежит ли мероприятие текущей организации
  return true; // Временная заглушка
});

const loadEvent = async () => {
  isLoading.value = true;
  try {
    const eventId = route.params.id as string;
    const data = await apiService.getEventDetails(parseInt(eventId));
    event.value = data;
    
    if (isOrganization.value && isMyEvent.value) {
      // Загружаем участников для организации
      loadParticipants();
    }
  } catch (error) {
    console.error('Error loading event:', error);
  } finally {
    isLoading.value = false;
  }
};

const loadParticipants = async () => {
  try {
    // Здесь будет запрос на получение участников мероприятия
    participants.value = [];
  } catch (error) {
    console.error('Error loading participants:', error);
  }
};

const toggleRegistration = async () => {
  isRegistering.value = true;
  try {
    if (event.value.isRegistered) {
      await apiService.leaveEvent(event.value.id);
      event.value.isRegistered = false;
      event.value.participantsCount = Math.max(0, (event.value.participantsCount || 1) - 1);
      const toast = await toastController.create({
        message: 'Участие отменено',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
    } else {
      await apiService.joinEvent(event.value.id);
      event.value.isRegistered = true;
      event.value.participantsCount = (event.value.participantsCount || 0) + 1;
      const toast = await toastController.create({
        message: 'Вы зарегистрированы на мероприятие!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    }
  } catch (error) {
    console.error('Error toggling registration:', error);
    const toast = await toastController.create({
      message: 'Ошибка при регистрации',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isRegistering.value = false;
  }
};

const shareEvent = async () => {
  const toast = await toastController.create({
    message: 'Функция "Поделиться" будет доступна в следующих версиях',
    duration: 2000,
    color: 'primary'
  });
  await toast.present();
};

const editEvent = () => {
  router.push(`/edit-event/${event.value.id}`);
};

const deleteEvent = async () => {
  const alert = await alertController.create({
    header: 'Удалить мероприятие',
    message: `Вы уверены, что хотите удалить "${event.value.title}"?`,
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
            await apiService.deleteEvent(event.value.id);
            const toast = await toastController.create({
              message: 'Мероприятие удалено',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
            router.back();
          } catch (error) {
            console.error('Error deleting event:', error);
          }
        }
      }
    ]
  });
  await alert.present();
};

const openEmail = (email: string) => {
  window.open(`mailto:${email}`);
};

const openPhone = (phone: string) => {
  window.open(`tel:${phone}`);
};

const goBack = () => {
  router.back();
};

const getEventStatus = () => {
  if (!event.value) return '';
  const now = new Date();
  const eventDate = new Date(event.value.date);
  return eventDate > now ? 'Предстоящее' : 'Завершено';
};

const getEventStatusClass = () => {
  if (!event.value) return '';
  const now = new Date();
  const eventDate = new Date(event.value.date);
  return eventDate > now ? 'status-upcoming' : 'status-completed';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadEvent();
});
</script>

<style scoped>
.event-image {
  position: relative;
  height: 250px;
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
  padding: 8px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.8rem;
}

.status-upcoming {
  background: var(--ion-color-success);
  color: white;
}

.status-completed {
  background: var(--ion-color-medium);
  color: white;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-container,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: var(--ion-color-medium);
  padding: 20px;
}

.error-state h2 {
  margin: 16px 0 8px 0;
  color: var(--ion-color-dark);
}

.error-state p {
  margin-bottom: 20px;
}

.no-participants {
  text-align: center;
  color: var(--ion-color-medium);
  margin: 20px 0;
}

ion-card {
  margin: 16px;
}

ion-footer {
  padding: 16px;
}

ion-footer ion-button {
  margin: 0 8px;
}
</style> 