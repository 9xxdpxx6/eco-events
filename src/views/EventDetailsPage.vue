<template>
  <ion-page class="event-details-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/events-list" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="page-title">Детали мероприятия</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="shareEvent" v-if="event" class="share-button">
            <ion-icon :icon="shareOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="event-content">
      <!-- Лоадер -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>
        <p class="loading-text">Загружаем информацию...</p>
      </div>

      <!-- Основной контент -->
      <div v-else-if="event" class="event-container">
        <!-- Hero секция с изображением -->
        <div class="event-hero">
          <div class="hero-image">
            <img :src="getEventPlaceholder(event.id ?? 0)" alt="Event image" />
            <div class="hero-overlay"></div>
          </div>
          
          <div class="hero-content">
            <div class="status-badge-container">
              <span :class="['status-badge', 'eco-status', getEventStatusClass()]">
                {{ getEventStatus() }}
              </span>
            </div>
            
            <h1 class="event-title">{{ event.title }}</h1>
            
            <div class="event-quick-meta">
              <div class="quick-meta-item">
                <ion-icon :icon="calendarOutline" />
                <span>{{ formatDateShort(event.startTime) }}</span>
              </div>
              <div class="quick-meta-item">
                <ion-icon :icon="locationOutline" />
                <span>{{ event.location || 'Место не указано' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Основная информация -->
        <div class="content-section">
          <div class="info-card eco-card">
            <div class="card-header">
              <ion-icon :icon="informationCircleOutline" />
              <h2>Основная информация</h2>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-icon">
                  <ion-icon :icon="timeOutline" />
                </div>
                <div class="info-content">
                  <span class="info-label">Дата и время</span>
                  <span class="info-value">{{ formatDate(event.startTime) }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-icon">
                  <ion-icon :icon="locationOutline" />
                </div>
                <div class="info-content">
                  <span class="info-label">Место проведения</span>
                  <span class="info-value">{{ event.location || 'Место не указано' }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-icon">
                  <ion-icon :icon="layersOutline" />
                </div>
                <div class="info-content">
                  <span class="info-label">Категория</span>
                  <span class="info-value">{{ event.eventType?.name || 'Не указана' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Описание -->
          <div class="description-card eco-card">
            <div class="card-header">
              <ion-icon :icon="documentTextOutline" />
              <h2>Описание</h2>
            </div>
            <div class="description-content">
              <p>{{ event.description || 'Описание отсутствует' }}</p>
            </div>
          </div>

          <!-- Контактная информация -->
          <div v-if="event.owner && (event.owner.phoneNumber || event.owner.email)" class="contacts-card eco-card">
            <div class="card-header">
              <ion-icon :icon="personOutline" />
              <h2>Организатор</h2>
            </div>
            
            <div class="contacts-content">
              <div class="organizer-info">
                <div class="organizer-avatar">
                  <ion-icon :icon="businessOutline" />
                </div>
                <div class="organizer-details">
                  <h3>{{ event.owner.fullName }}</h3>
                  <p>Организатор мероприятия</p>
                </div>
              </div>
              
              <div class="contact-buttons">
                <ion-button 
                  v-if="event.owner.email" 
                  expand="block" 
                  fill="outline" 
                  class="contact-button"
                  @click="openEmail(event.owner.email)"
                >
                  <ion-icon :icon="mailOutline" slot="start" />
                  {{ event.owner.email }}
                </ion-button>
                
                <ion-button 
                  v-if="event.owner.phoneNumber" 
                  expand="block" 
                  fill="outline" 
                  class="contact-button"
                  @click="openPhone(event.owner.phoneNumber)"
                >
                  <ion-icon :icon="callOutline" slot="start" />
                  {{ event.owner.phoneNumber }}
                </ion-button>
              </div>
            </div>
          </div>

          <!-- Участники (для организаций) -->
          <div v-if="isAdmin && isMyEvent" class="participants-card eco-card">
            <div class="card-header">
              <ion-icon :icon="peopleOutline" />
              <h2>Участники</h2>
              <span class="participants-count">{{ participants.length }}</span>
            </div>
            
            <div class="participants-content" v-if="participants.length > 0">
              <div class="participants-list">
                <div 
                  v-for="participant in participants" 
                  :key="participant.user.id"
                  class="participant-item"
                >
                  <div class="participant-avatar">
                    <ion-icon :icon="personCircleOutline" />
                  </div>
                  <div class="participant-info">
                    <h4>{{ participant.user.fullName }}</h4>
                    <p>{{ formatDateShort(participant.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-participants">
              <ion-icon :icon="peopleOutline" />
              <p>Пока нет участников</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Состояние ошибки -->
      <div v-else class="error-state">
        <div class="error-icon">
          <ion-icon :icon="alertCircleOutline" />
        </div>
        <h2 class="error-title">Мероприятие не найдено</h2>
        <p class="error-subtitle">Возможно, оно было удалено или у вас нет доступа</p>
        <ion-button fill="outline" @click="goBack" class="error-button">
          Вернуться назад
        </ion-button>
      </div>
    </ion-content>

    <!-- Кнопка регистрации/отмены (для волонтёров) -->
    <ion-footer v-if="event && !isAdmin" class="action-footer">
      <div class="footer-content">
        <ion-button 
          expand="block" 
          size="large"
          :class="['action-button', isUserRegistered ? 'danger' : 'primary']"
          @click="toggleRegistration"
          :disabled="isRegistering"
        >
          <ion-icon 
            :icon="isUserRegistered ? closeOutline : addCircleOutline" 
            slot="start" 
          />
          {{ isRegistering ? 'Обработка...' : (isUserRegistered ? 'Отменить участие' : 'Принять участие') }}
        </ion-button>
      </div>
    </ion-footer>

    <!-- Кнопки управления (для организаций) -->
    <ion-footer v-if="event && isAdmin && isMyEvent" class="admin-footer">
      <div class="admin-actions">
        <ion-button 
          fill="outline" 
          size="large" 
          class="admin-button"
          @click="editEvent"
        >
          <ion-icon :icon="createOutline" slot="start" />
          Редактировать
        </ion-button>
        <ion-button 
          color="danger" 
          size="large" 
          class="admin-button"
          @click="deleteEvent"
        >
          <ion-icon :icon="trashOutline" slot="start" />
          Удалить
        </ion-button>
      </div>
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
  IonSpinner,
  alertController,
  toastController
} from '@ionic/vue';
import {
  shareOutline,
  calendarOutline,
  locationOutline,
  layersOutline,
  timeOutline,
  businessOutline,
  peopleOutline,
  mailOutline,
  callOutline,
  personCircleOutline,
  alertCircleOutline,
  addCircleOutline,
  closeOutline,
  createOutline,
  trashOutline,
  informationCircleOutline,
  documentTextOutline,
  personOutline
} from 'ionicons/icons';
import { useAuthStore } from '../stores/auth';
import { useEventsStore } from '../stores';
import { useParticipantsStore } from '../stores';
import type { EventResponseMediumDTO } from '../types/api';
import type { EventParticipantDTO } from '../types/api';
import { getEventPlaceholder } from '../utils/eventImages';

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
  // Проверяем по owner.id
  return event.value.owner?.id === authStore.user.id;
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

    if (isAdmin.value && isMyEvent.value) {
      // Дополнительные данные для организаторов
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

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
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
    return 'eco-status-finished';
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'eco-status-soon';
  } else {
    return 'eco-status-upcoming';
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
.event-details-page {
  --background: var(--eco-background-secondary);
}

.event-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
}

.back-button,
.share-button {
  --color: var(--eco-gray-700);
}

/* Лоадер */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  padding: var(--eco-space-6);
}

.loading-spinner {
  margin-bottom: var(--eco-space-4);
}

.loading-text {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-500);
  margin: 0;
}

/* Hero секция */
.event-hero {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.2) 0%, 
    rgba(0, 0, 0, 0.6) 100%
  );
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--eco-space-6);
  color: white;
  z-index: 2;
}

.status-badge-container {
  margin-bottom: var(--eco-space-3);
}

.status-badge {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.event-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-2xl);
  font-weight: var(--eco-font-weight-bold);
  color: white;
  margin: 0 0 var(--eco-space-4) 0;
  line-height: var(--eco-line-height-tight);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.event-quick-meta {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-2);
}

.quick-meta-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
  font-size: var(--eco-font-size-sm);
  color: rgba(255, 255, 255, 0.9);
}

.quick-meta-item ion-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

/* Контент секции */
.content-section {
  padding: var(--eco-space-6) var(--eco-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-6);
}

/* Карточки */
.info-card,
.description-card,
.contacts-card,
.participants-card {
  background: var(--eco-white);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-6);
  border: 1px solid var(--eco-gray-200);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--eco-space-3);
  margin-bottom: var(--eco-space-6);
}

.card-header ion-icon {
  font-size: 24px;
  color: var(--eco-primary);
}

.card-header h2 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
  flex: 1;
}

.participants-count {
  background: var(--eco-primary);
  color: white;
  padding: var(--eco-space-1) var(--eco-space-3);
  border-radius: var(--eco-radius-md);
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
}

/* Информационная сетка */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-5);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--eco-space-4);
}

.info-icon {
  width: 48px;
  height: 48px;
  background: var(--eco-gray-50);
  border-radius: var(--eco-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon ion-icon {
  font-size: 24px;
  color: var(--eco-primary);
}

.info-content {
  flex: 1;
  padding-top: var(--eco-space-1);
}

.info-label {
  display: block;
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-500);
  margin-bottom: var(--eco-space-1);
}

.info-value {
  display: block;
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-800);
  font-weight: var(--eco-font-weight-medium);
}

/* Описание */
.description-content p {
  font-size: var(--eco-font-size-base);
  line-height: var(--eco-line-height-relaxed);
  color: var(--eco-gray-700);
  margin: 0;
}

/* Контакты */
.contacts-content {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-6);
}

.organizer-info {
  display: flex;
  align-items: center;
  gap: var(--eco-space-4);
}

.organizer-avatar {
  width: 56px;
  height: 56px;
  background: var(--eco-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.organizer-avatar ion-icon {
  font-size: 28px;
  color: white;
}

.organizer-details h3 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-1) 0;
}

.organizer-details p {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-500);
  margin: 0;
}

.contact-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-3);
}

.contact-button {
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
  height: 48px;
  font-size: var(--eco-font-size-sm);
}

.contact-button:hover {
  --background: var(--eco-gray-50);
}

/* Участники */
.participants-list {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.participant-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-3);
  padding: var(--eco-space-3);
  background: var(--eco-gray-50);
  border-radius: var(--eco-radius-lg);
}

.participant-avatar {
  width: 40px;
  height: 40px;
  background: var(--eco-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.participant-avatar ion-icon {
  font-size: 20px;
  color: white;
}

.participant-info h4 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-1) 0;
}

.participant-info p {
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-500);
  margin: 0;
}

.no-participants {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--eco-space-3);
  padding: var(--eco-space-8);
  color: var(--eco-gray-500);
  text-align: center;
}

.no-participants ion-icon {
  font-size: 48px;
  color: var(--eco-gray-300);
}

.no-participants p {
  margin: 0;
  font-size: var(--eco-font-size-base);
}

/* Состояние ошибки */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eco-space-12) var(--eco-space-6);
  text-align: center;
}

.error-icon {
  width: 80px;
  height: 80px;
  background: var(--eco-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-6);
}

.error-icon ion-icon {
  font-size: 40px;
  color: var(--eco-error);
}

.error-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-700);
  margin: 0 0 var(--eco-space-2) 0;
}

.error-subtitle {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-500);
  margin: 0 0 var(--eco-space-6) 0;
  max-width: 280px;
}

.error-button {
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
}

/* Footer действий */
.action-footer,
.admin-footer {
  padding: var(--eco-space-2);
  background: var(--eco-white);
  border-top: 1px solid var(--eco-gray-200);
}

.footer-content {
  display: flex;
  justify-content: center;
  gap: var(--eco-space-3);
}

.admin-actions {
  display: flex;
  gap: var(--eco-space-3);
}

.action-button {
  height: 48px;
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
  --border-radius: var(--eco-radius-lg);
  max-width: 280px;
}

.action-button.primary {
  --background: var(--eco-success);
  --background-activated: var(--eco-success-dark);
  --color: white;
}

.admin-button {
  flex: 1;
  height: 48px;
  font-weight: var(--eco-font-weight-medium);
  --border-radius: var(--eco-radius-lg);
}

/* Отзывчивость */
@media (max-width: 480px) {
  .hero-content {
    padding: var(--eco-space-4);
  }
  
  .event-title {
    font-size: var(--eco-font-size-xl);
  }
  
  .content-section {
    padding: var(--eco-space-4) var(--eco-space-3);
    gap: var(--eco-space-4);
  }
  
  .info-card,
  .description-card,
  .contacts-card,
  .participants-card {
    padding: var(--eco-space-4);
  }
  
  .card-header {
    margin-bottom: var(--eco-space-4);
  }
  
  .info-grid {
    gap: var(--eco-space-4);
  }
  
  .admin-actions {
    flex-direction: column;
  }
}
</style> 