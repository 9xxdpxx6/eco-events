<template>
  <ion-page class="event-details-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="goBack" class="back-button">
            <ion-icon :icon="arrowBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title class="page-title" @click="scrollToTop">Детали мероприятия</ion-title>
        <ion-buttons slot="end">
          <div class="spacer-button"></div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content ref="contentRef" class="event-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-text="Потяните для обновления"
          refreshing-text="Обновляем данные..."
        ></ion-refresher-content>
      </ion-refresher>
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
        <div class="event-hero" :class="{ 'has-image': event.preview }">
          <div class="hero-image" @click="openGallery">
            <template v-if="!brokenImage">
              <img 
                :src="event.preview
                  ? (event.preview.startsWith('uploads/')
                      ? API_URL + '/' + event.preview
                      : IMAGE_BASE_URL + '/' + event.preview)
                  : getEventPlaceholder(event.id ?? 0)" 
                alt="Event image"
                :style="{
                  'object-fit': event.preview ? 'cover' : 'contain',
                  'width': event.preview ? '100%' : 'auto'
                }"
                draggable="false"
                @error="handleImgError"
              />
            </template>
            <template v-else>
              <BrokenImagePlaceholder />
            </template>
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
              
              <div class="info-item" v-if="eventDuration">
                <div class="info-icon">
                  <ion-icon :icon="hourglassOutline" />
                </div>
                <div class="info-content">
                  <span class="info-label">Продолжительность</span>
                  <span class="info-value">{{ eventDuration }}</span>
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
              
              <div class="info-item" v-if="!isOrganization && event && typeof event.totalVisitors === 'number'">
                <div class="info-icon">
                  <ion-icon :icon="peopleOutline" />
                </div>
                <div class="info-content">
                  <span class="info-label">Участников</span>
                  <span class="info-value">{{ event.totalVisitors }}</span>
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
          <div v-if="isOrganization && isMyEvent" class="participants-card eco-card">
            <div class="card-header">
              <ion-icon :icon="peopleOutline" />
              <h2>Участники</h2>
              <span class="participants-count">{{ event.totalVisitors ?? participants.length }}</span>
            </div>
            
            <div class="participants-content" v-if="participants.length > 0">
              <div class="participants-list">
                <div 
                  v-for="participant in displayedParticipants" 
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
              <div v-if="event && event.totalVisitors && event.totalVisitors > 5" class="participants-summary">
                Показаны последние {{ displayedParticipants.length }} из {{ event.totalVisitors }} участников.
              </div>
            </div>
            
            <div v-else class="no-participants">
              <ion-icon :icon="peopleOutline" />
              <p>Пока нет участников</p>
            </div>
          </div>

          <!-- Кнопки управления (для организаций) -->
          <div v-if="event && isOrganization && isMyEvent" class="admin-controls-card">
            <div class="admin-actions">
              <ion-button
                v-if="getEventStatus() === 'Проведено'"
                color="warning"
                class="admin-button conduct-button"
                expand="block"
                style="grid-column: span 2; margin-bottom: 12px;"
                @click="showCancelConductDialog = true"
              >
                <ion-icon :icon="closeOutline" slot="start" />
                Отменить проведение
              </ion-button>
              <ion-button
                v-else-if="!event.conducted"
                color="success"
                class="admin-button conduct-button"
                expand="block"
                style="grid-column: span 2; margin-bottom: 12px;"
                @click="showConductDialog = true"
              >
                <ion-icon :icon="checkmarkOutline" slot="start" />
                Провести мероприятие
              </ion-button>
              <ion-button
                color="danger"
                class="admin-button"
                expand="block"
                @click="deleteEvent"
              >
                <ion-icon :icon="trashOutline" slot="start" />
                Удалить
              </ion-button>
              <ion-button
                fill="outline"
                class="admin-button"
                expand="block"
                @click="editEvent"
              >
                <ion-icon :icon="createOutline" slot="start" />
                Редактировать
              </ion-button>
            </div>
          </div>

          <!-- Статус участия (для зарегистрированных волонтёров) -->
          <div v-if="event && !isOrganization && isUserRegistered && !event.conducted">
            <!-- Отмена участия (если мероприятие не завершено) -->
            <div v-if="!isEventFinished" class="cancel-card eco-card">
              <div class="cancel-content">
                <ion-button 
                  fill="clear" 
                  expand="block"
                  class="cancel-button"
                  @click="toggleRegistration"
                  :disabled="isRegistering"
                >
                  <ion-icon :icon="closeOutline" slot="start" />
                  {{ isRegistering ? 'Обработка...' : 'Отменить участие' }}
                </ion-button>
              </div>
            </div>
            <!-- Статус "Посещено" (если мероприятие завершено) -->
            <div v-else class="attended-card eco-card">
              <div class="attended-content">
                <ion-icon :icon="checkmarkCircleOutline" class="attended-icon" />
                <span class="attended-text">Вы посетили это мероприятие</span>
              </div>
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

    <!-- Кнопка регистрации (только для незарегистрированных волонтёров) -->
    <ion-footer v-if="event && !isOrganization && !isUserRegistered && !isEventFinished && !event.conducted" class="action-footer">
      <div class="footer-content">
        <ion-button 
          expand="block" 
          size="large"
          class="action-button primary"
          @click="toggleRegistration"
          :disabled="isRegistering"
        >
          <ion-icon :icon="addOutline" slot="start" />
          {{ isRegistering ? 'Обработка...' : 'Принять участие' }}
        </ion-button>
      </div>
    </ion-footer>

    <!-- Eco Delete Dialog -->
    <EcoDialog
      :is-open="showDeleteDialog"
      title="Подтверждение"
      message="Вы уверены, что хотите удалить это мероприятие?"
      confirm-text="Удалить"
      cancel-text="Отмена"
      :is-destructive="true"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
      @dismiss="handleDeleteCancel"
    />

    <!-- EcoDialog для подтверждения проведения -->
    <EcoDialog
      :is-open="showConductDialog"
      title="Провести мероприятие?"
      message="Вы уверены, что хотите отметить мероприятие как проведённое? Это действие нельзя отменить."
      confirm-text="Провести"
      cancel-text="Отмена"
      :is-destructive="false"
      @confirm="handleConductConfirm"
      @cancel="handleConductCancel"
      @dismiss="handleConductCancel"
    />

    <!-- EcoDialog для подтверждения отмены проведения -->
    <EcoDialog
      :is-open="showCancelConductDialog"
      title="Отменить проведение?"
      message="Вы уверены, что хотите отменить проведение мероприятия? Это действие можно будет вернуть."
      confirm-text="Отменить проведение"
      cancel-text="Отмена"
      :is-destructive="true"
      @confirm="handleCancelConductConfirm"
      @cancel="handleCancelConductCancel"
      @dismiss="handleCancelConductCancel"
    />

    <!-- Кастомная галерея (реализация ниже) -->
    <CustomGallery
      v-model="galleryVisible"
      :images="eventImages"
      :startIndex="galleryIndex"
      @change="galleryIndex = $event"
    />
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
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import {
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
  addOutline,
  closeOutline,
  createOutline,
  trashOutline,
  informationCircleOutline,
  documentTextOutline,
  personOutline,
  checkmarkCircleOutline,
  checkmarkOutline, // добавляем иконку без круга
  hourglassOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { useAuthStore } from '../stores/auth';
import { useEventsStore } from '../stores';
import { useParticipantsStore } from '../stores';
import type { EventResponseMediumDTO } from '../types/api';
import type { EventParticipantDTO } from '../types/api';
import { getEventPlaceholder } from '../utils/eventImages';
import { IMAGE_BASE_URL, API_URL } from '../api/client';
import EcoDialog from '../components/EcoDialog.vue';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import BrokenImagePlaceholder from '../components/BrokenImagePlaceholder.vue';
import CustomGallery from '../components/CustomGallery.vue';
import { clearFileUrlCache } from '../utils/imageUploaderCache';
import { eventsApi } from '../api/events';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();

const contentRef = ref();
const event = ref<EventResponseMediumDTO | null>(null);
const participants = ref<EventParticipantDTO[]>([]);
const isLoading = ref(false);
const isRegistering = ref(false);

// Dialog state
const showDeleteDialog = ref(false);
const showConductDialog = ref(false);
const showCancelConductDialog = ref(false);

const galleryVisible = ref(false);
const galleryIndex = ref(0);
const eventImages = computed(() => {
  if (!event.value) return [];
  const images: string[] = [];
  // Добавляем превью первой, если есть
  if (event.value.preview) {
    const previewUrl = event.value.preview.startsWith('uploads/')
      ? `${API_URL}/${event.value.preview}`
      : `${IMAGE_BASE_URL}/${event.value.preview}`;
    images.push(previewUrl);
  }
  // Добавляем остальные картинки из event.images, если они не совпадают с превью
  if (Array.isArray(event.value.images)) {
    event.value.images.forEach(img => {
      if (img.filePath) {
        const url = img.filePath.startsWith('uploads/')
          ? `${API_URL}/${img.filePath}`
          : `${IMAGE_BASE_URL}/${img.filePath}`;
        if (!images.includes(url)) {
          images.push(url);
        }
      }
    });
  }
  if (images.length === 0) {
    images.push(getEventPlaceholder(event.value.id ?? 0));
  }
  return images;
});

const displayedParticipants = computed(() => {
  return [...participants.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

const isAdmin = computed(() => authStore.isAdmin);
const isOrganization = computed(() => authStore.isOrganization);
const isMyEvent = computed(() => {
  if (!event.value || !authStore.user) return false;
  // Проверяем по owner.id
  return event.value.owner?.id === authStore.user.id;
});

const isUserRegistered = computed(() => {
  if (!event.value || !authStore.user) return false;
  return participants.value.some(p => 
    p.user.id === authStore.user?.id && p.membershipStatus === 'VALID'
  );
});

const isEventFinished = computed(() => {
  if (!event.value) return false;
  const now = new Date();
  const eventDate = new Date(event.value.startTime);
  return eventDate < now;
});

const eventDuration = computed(() => {
  if (!event.value || !event.value.startTime || !event.value.endTime) return null;

  const getHourWord = (h: number) => {
    if (h % 10 === 1 && h % 100 !== 11) return 'час';
    if ([2, 3, 4].includes(h % 10) && ![12, 13, 14].includes(h % 100)) return 'часа';
    return 'часов';
  };

  const getMinuteWord = (m: number) => {
    if (m % 10 === 1 && m % 100 !== 11) return 'минута';
    if ([2, 3, 4].includes(m % 10) && ![12, 13, 14].includes(m % 100)) return 'минуты';
    return 'минут';
  };

  const start = new Date(event.value.startTime);
  const end = new Date(event.value.endTime);
  const diff = end.getTime() - start.getTime();

  if (diff <= 0) return null;

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} ${getHourWord(hours)}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${getMinuteWord(minutes)}`);
  }

  return parts.length > 0 ? parts.join(' ') : null;
});

const loadEvent = async () => {
  isLoading.value = true;
  try {
    const eventId = parseInt(route.params.id as string);
    await eventsStore.fetchEventById(eventId);
    event.value = eventsStore.getCurrentEvent;
    // ЛОГ для отладки
    console.log('API event response:', event.value);
    // Загружаем участников
    await participantsStore.fetchEventParticipants(eventId);
    participants.value = participantsStore.getEventParticipants;
    if (isOrganization.value && isMyEvent.value) {
      // Дополнительные данные для организаторов
    }
    clearFileUrlCache();
  } catch (error) {
    console.error('Error loading event:', error);
    await showErrorToast('Ошибка загрузки мероприятия', 3000);
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
    await showErrorToast('Ошибка при регистрации на мероприятие', 3000);
  } finally {
    isRegistering.value = false;
  }
};

const editEvent = () => {
  if (event.value) {
    router.push(`/edit-event/${event.value.id}`);
  }
};

const deleteEvent = () => {
  if (!event.value) return;
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  if (!event.value?.id) return;
  
  showDeleteDialog.value = false;
  
  try {
    await eventsStore.deleteEvent(event.value.id);
    await showSuccessToast('Мероприятие удалено', 2000);
    router.push('/tabs/events-list');
  } catch (error) {
    console.error('Error deleting event:', error);
    await showErrorToast('Ошибка при удалении мероприятия', 3000);
  }
};

const handleDeleteCancel = () => {
  showDeleteDialog.value = false;
};

const openEmail = (email: string) => {
  window.location.href = `mailto:${email}`;
};

const openPhone = (phone: string) => {
  window.location.href = `tel:${phone}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const currentYear = new Date().getFullYear();
  const eventYear = date.getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  };
  if (eventYear !== currentYear) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('ru-RU', options);
};

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  const currentYear = new Date().getFullYear();
  const eventYear = date.getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  };
  if (eventYear !== currentYear) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('ru-RU', options);
};

const getEventStatus = () => {
  if (!event.value) return '';
  const now = new Date();
  const eventStart = new Date(event.value.startTime);
  const eventEnd = event.value.endTime ? new Date(event.value.endTime) : new Date(event.value.startTime);

  if (event.value.conducted && eventEnd < now) {
    return 'Проведено';
  }
  if (eventEnd < now) {
    return 'Завершено';
  } else if (eventStart <= now && eventEnd > now) {
    return 'Активно';
  } else if (eventStart.getTime() - now.getTime() < 24 * 60 * 60 * 1000 && eventStart > now) {
    return 'Скоро';
  } else {
    return 'Запланировано';
  }
};

const getEventStatusClass = () => {
  if (!event.value) return '';
  const now = new Date();
  const eventStart = new Date(event.value.startTime);
  const eventEnd = event.value.endTime ? new Date(event.value.endTime) : new Date(event.value.startTime);

  if (event.value.conducted && eventEnd < now) {
    return 'eco-status-conducted';
  }
  if (eventEnd < now) {
    return 'eco-status-finished';
  } else if (eventStart <= now && eventEnd > now) {
    return 'eco-status-active';
  } else if (eventStart.getTime() - now.getTime() < 24 * 60 * 60 * 1000 && eventStart > now) {
    return 'eco-status-soon';
  } else {
    return 'eco-status-upcoming';
  }
};

const goBack = () => {
  // Просто используем router.back() - Vue Router сам разберется
  router.back();
};

const scrollToTop = async () => {
  if (contentRef.value) {
    await contentRef.value.$el.scrollToTop(300);
  }
};

// Для hero-image
const brokenImage = ref(false);
function handleImgError() {
  brokenImage.value = true;
}

function openGallery(e?: MouseEvent) {
  if (typeof e === 'object') e.preventDefault();
  galleryVisible.value = true;
}

const handleRefresh = async (event: any) => {
  await loadEvent();
  event.target.complete();
};

const conductEvent = async () => {
  if (!event.value?.id) return;
  try {
    await eventsStore.updateEventConducted(event.value.id);
    await showSuccessToast('Мероприятие отмечено как проведённое', 2000);
    await loadEvent();
  } catch (error) {
    console.error('Ошибка при проведении мероприятия:', error);
    await showErrorToast('Ошибка при проведении мероприятия', 3000);
  }
};

const cancelConductEvent = async () => {
  if (!event.value?.id) return;
  try {
    await eventsStore.cancelEventConducted(event.value.id);
    await showSuccessToast('Проведение мероприятия отменено', 2000);
    await loadEvent();
  } catch (error) {
    console.error('Ошибка при отмене проведения:', error);
    await showErrorToast('Ошибка при отмене проведения', 3000);
  }
};

const handleConductConfirm = async () => {
  showConductDialog.value = false;
  await conductEvent();
};
const handleConductCancel = () => {
  showConductDialog.value = false;
};

const handleCancelConductConfirm = async () => {
  showCancelConductDialog.value = false;
  await cancelConductEvent();
};
const handleCancelConductCancel = () => {
  showCancelConductDialog.value = false;
};

onMounted(() => {
  loadEvent();
});

defineExpose({
  handleRefresh,
  conductEvent
});
</script>

<style scoped>
.event-details-page {
  --background: var(--eco-background-secondary);
}

/* Убираем тень у header */
.event-details-page ion-header {
  box-shadow: none !important;
  --box-shadow: none !important;
  position: relative;
  z-index: 1000;
}

.event-details-page ion-toolbar {
  box-shadow: none !important;
  --box-shadow: none !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.event-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  text-align: center !important;
  cursor: pointer;
  transition: color var(--eco-transition-fast);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.back-button {
  --color: var(--eco-gray-700);
}

.spacer-button {
  width: 44px;
  height: 44px;
  visibility: hidden;
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
  max-height: 500px;
  overflow: hidden;
}

.event-hero.has-image {
  height: 500px;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  background-color: var(--eco-gray-100);
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Стили для заглушки */
.event-hero:not(.has-image) .hero-image img {
  object-fit: contain;
  padding: var(--eco-space-4);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
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
  width: 64px;
  height: 64px;
  background: none;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.organizer-avatar ion-icon {
  font-size: 48px;
  color: var(--eco-primary);
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
  --background: var(--eco-gray-50);
  --background-activated: var(--eco-gray-100);
  --background-hover: var(--eco-gray-100);
  --color: var(--eco-gray-700);
  --border-width: 0;
  --border-radius: var(--eco-radius-lg);
  --box-shadow: none;
  height: 48px;
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
}



.contact-button:active {
  transform: translateY(0);
}

.contact-button.disabled {
  --background: var(--eco-gray-100);
  --color: var(--eco-gray-600);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Участники */
.participants-list {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.participants-summary {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-500);
  text-align: center;
  margin-top: var(--eco-space-4);
  padding: var(--eco-space-2);
  background: var(--eco-gray-50);
  border-radius: var(--eco-radius-md);
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
  color: var(--eco-gray-600);
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

/* Карточка управления */
.admin-controls-card {
  background: var(--eco-white);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-4);
  border: 1px solid var(--eco-gray-200);
}

.admin-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--eco-space-3);
}

/* Новая кнопка проведения */
.conduct-button {
  font-weight: var(--eco-font-weight-semibold);
  font-size: var(--eco-font-size-base);
  margin-bottom: var(--eco-space-3);
}

/* Footer действий */
.action-footer {
  padding: var(--eco-space-2);
  background: var(--eco-white);
  border-top: 1px solid var(--eco-gray-200);
}

.footer-content {
  display: flex;
  justify-content: center;
  gap: var(--eco-space-3);
}

.action-button {
  height: 56px;
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
  --border-radius: var(--eco-radius-lg);
  --border-width: 0;
  --box-shadow: none;
  max-width: 320px;
  transition: all var(--eco-transition-fast);
}

.action-button.primary {
  --background: var(--eco-primary);
  --background-activated: var(--eco-primary);
  --color: white;
}



.action-button.primary:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(53, 90, 221, 0.2);
}

.action-button.danger {
  --background: var(--eco-error);
  --background-activated: var(--eco-error);
  --color: white;
}



.action-button.danger:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.admin-button {
  height: 48px;
  font-weight: var(--eco-font-weight-medium);
  --border-radius: var(--eco-radius-lg);
  --border-width: 0;
  --box-shadow: none;
  transition: all var(--eco-transition-fast);
}

.admin-button[fill="outline"] {
  --background: var(--eco-gray-50);
  --background-activated: var(--eco-gray-100);
  --color: var(--eco-gray-700);
}



.admin-button[color="danger"] {
  --background: var(--eco-error);
  --background-activated: var(--eco-error);
  --color: white;
}



.admin-button:active {
  transform: translateY(0);
}

/* Карточка отмены участия */
.cancel-card {
  background: var(--eco-white);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-4);
  border: 1px solid var(--eco-gray-200);
}

.cancel-content {
  display: flex;
  justify-content: center;
}

.cancel-button {
  --color: var(--eco-error);
  --background: var(--eco-gray-50);
  --background-hover: var(--eco-gray-100);
  --background-activated: rgba(239, 68, 68, 0.1);
  --border-width: 0;
  --box-shadow: none;
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-medium);
  height: 48px;
  width: 100%;
  transition: all var(--eco-transition-normal);
}



.cancel-button:active {
  transform: translateY(0);
}

.cancel-button ion-icon {
  font-size: 18px;
  margin-right: var(--eco-space-2);
  color: var(--eco-error);
}

/* Карточка посещенного мероприятия */
.attended-card {
  background: var(--eco-white);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-4);
  border: 1px solid var(--eco-gray-200);
}

.attended-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--eco-space-3);
  text-align: center;
}

.attended-icon {
  font-size: 24px;
  color: var(--eco-success);
}

.attended-text {
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-700);
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
  
  .cancel-card {
    padding: var(--eco-space-3);
  }
}
/* Кастомизация фона модалки галереи */
:deep(.vel-modal) {
  background: rgba(10, 10, 10, 0.9) !important;
  z-index: 99999 !important;
}
:deep(.vel-img-wrap) { cursor: default !important; }
:deep(.vel-img) { pointer-events: none !important; user-select: none; }
:deep(.vel-chevron) {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  padding: 0;
}
:deep(.vel-chevron-left) { left: 0; }
:deep(.vel-chevron-right) { right: 0; }
:deep(.vel-chevron::before) {
  content: '';
  display: block;
  width: 18px;
  height: 18px;
  border-style: solid;
  border-width: 0 0 3px 3px;
  border-color: transparent transparent #fff #fff;
  border-radius: 4px;
  transform: rotate(45deg);
  margin: 0 16px;
}
:deep(.vel-chevron-right::before) {
  transform: rotate(-135deg);
}
:deep(.vel-chevron-left::before) {
  transform: rotate(45deg);
}
:deep(.vel-chevron:active), :deep(.vel-chevron:focus) {
  background: none;
}
.status-badge.eco-status-conducted {
  background: #b3c2d1;
  color: #234;
  border: 1px solid #a0b0c0;
}
</style> 
