<template>
  <ion-page class="registrations-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title">Мои записи</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="registrations-content">
      <!-- Статистика -->
      <div class="stats-section">
        <div class="stats-card eco-card">
          <div class="stats-header">
            <div class="stats-icon">
              <ion-icon :icon="calendarOutline" />
            </div>
            <div class="stats-info">
              <h2>Мои мероприятия</h2>
              <p>{{ registrations.length }} записей всего</p>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value upcoming">{{ upcomingCount }}</div>
              <div class="stat-label">Предстоящие</div>
            </div>
            <div class="stat-item">
              <div class="stat-value completed">{{ completedCount }}</div>
              <div class="stat-label">Завершённые</div>
            </div>
            <div class="stat-item">
              <div class="stat-value cancelled">{{ cancelledCount }}</div>
              <div class="stat-label">Отменённые</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Поиск и фильтры -->
      <div class="search-filters-section">
        <div class="search-card eco-card">
          <ion-searchbar 
            v-model="searchText" 
            placeholder="Поиск мероприятий..."
            class="custom-searchbar"
            :clear-input="true"
          ></ion-searchbar>
        </div>
        
        <div class="filters-card eco-card">
          <div class="filters-header">
            <ion-icon :icon="filterOutline" />
            <span>Фильтр по дате записи</span>
          </div>
          
          <div class="filters-content">
            <div class="date-filter">
              <ion-label class="filter-label">С</ion-label>
              <div class="date-input-wrapper" @click="openDatePicker('from')">
                <ion-input
                :value="dateFromDisplay"
                readonly
                  class="date-input"
                  placeholder="Выберите дату"
                ></ion-input>
                <ion-icon :icon="calendarOutline" class="date-icon" />
            </div>
            <input type="date" ref="dateFromRef" v-model="dateFrom" @change="applyDateFilter" style="display:none" />
          </div>
            
            <div class="date-filter">
              <ion-label class="filter-label">По</ion-label>
              <div class="date-input-wrapper" @click="openDatePicker('to')">
                <ion-input
                :value="dateToDisplay"
                readonly
                  class="date-input"
                  placeholder="Выберите дату"
                ></ion-input>
                <ion-icon :icon="calendarOutline" class="date-icon" />
              </div>
              <input type="date" ref="dateToRef" v-model="dateTo" @change="applyDateFilter" style="display:none" />
            </div>
            
            <ion-button
              v-if="dateFrom || dateTo"
              fill="clear"
              size="small"
              class="clear-filter-button"
              @click="clearFilters"
            >
              <ion-icon :icon="closeOutline" slot="icon-only" />
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Список регистраций -->
      <div class="registrations-section">
        <!-- Лоадер -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>
          <p class="loading-text">Загружаем ваши записи...</p>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <ion-icon :icon="alertCircleOutline" />
          </div>
          <h3 class="error-title">Ошибка загрузки</h3>
          <p class="error-subtitle">{{ error.message }}</p>
          <ion-button fill="outline" @click="fetchRegistrations" class="retry-button">
            Попробовать снова
          </ion-button>
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="registrations.length === 0" class="empty-state">
          <div class="empty-icon">
            <ion-icon :icon="clipboardOutline" />
          </div>
          <h3 class="empty-title">Нет записей на мероприятия</h3>
          <p class="empty-subtitle">Найдите интересные экологические мероприятия и запишитесь на участие!</p>
          <ion-button fill="solid" @click="goToEvents" class="action-button">
            Найти мероприятия
          </ion-button>
        </div>

        <!-- Группированный список -->
        <div v-else-if="filteredRegistrations.length > 0" class="grouped-registrations">
          <!-- Предстоящие -->
          <div v-if="upcomingEvents.length > 0" class="event-group">
            <h3 class="group-title">
              <ion-icon :icon="timeOutline" />
              Предстоящие мероприятия
              <span class="group-count">({{ upcomingEvents.length }})</span>
            </h3>
            
            <div class="events-list">
              <div 
                v-for="reg in upcomingEvents" 
                :key="reg.event.id"
                class="event-card eco-card eco-list-item"
                @click="goToEvent(reg.event.id ?? 0)"
              >
                <div class="event-image">
                  <img :src="getEventPlaceholder(reg.event.id ?? 0)" alt="Event image" />
                  <div class="registration-status">
                    <RegistrationStatus :status="reg.status" />
                  </div>
                </div>
                
                <div class="event-content">
                  <div class="event-header">
                    <h4 class="event-title">{{ reg.event.title }}</h4>
                  </div>
                  
                  <div class="event-meta">
                    <div class="meta-item">
                      <ion-icon :icon="calendarOutline" />
                      <span>{{ formatEventDate(reg.event.startTime) }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="locationOutline" />
                      <span>{{ reg.event.location || 'Место не указано' }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="checkmarkCircleOutline" />
                      <span>Записан {{ formatDate(reg.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Завершённые -->
          <div v-if="completedEvents.length > 0" class="event-group">
            <h3 class="group-title">
              <ion-icon :icon="checkmarkCircleOutline" />
              Завершённые мероприятия
              <span class="group-count">({{ completedEvents.length }})</span>
            </h3>
            
            <div class="events-list">
              <div 
                v-for="reg in completedEvents" 
                :key="reg.event.id"
                class="event-card eco-card eco-list-item completed"
                @click="goToEvent(reg.event.id ?? 0)"
              >
                <div class="event-image">
                  <img :src="getEventPlaceholder(reg.event.id ?? 0)" alt="Event image" />
                  <div class="registration-status">
            <RegistrationStatus :status="reg.status" />
                  </div>
                </div>
                
                <div class="event-content">
                  <div class="event-header">
                    <h4 class="event-title">{{ reg.event.title }}</h4>
                  </div>
                  
                  <div class="event-meta">
                    <div class="meta-item">
              <ion-icon :icon="calendarOutline" />
                      <span>{{ formatEventDate(reg.event.startTime) }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="locationOutline" />
                      <span>{{ reg.event.location || 'Место не указано' }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="checkmarkCircleOutline" />
                      <span>Записан {{ formatDate(reg.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Отменённые -->
          <div v-if="cancelledEvents.length > 0" class="event-group">
            <h3 class="group-title">
              <ion-icon :icon="closeCircleOutline" />
              Отменённые мероприятия
              <span class="group-count">({{ cancelledEvents.length }})</span>
            </h3>

            <div class="events-list">
              <div 
                v-for="reg in cancelledEvents" 
                :key="reg.event.id"
                class="event-card eco-card eco-list-item cancelled"
                @click="goToEvent(reg.event.id ?? 0)"
              >
                <div class="event-image">
                  <img :src="getEventPlaceholder(reg.event.id ?? 0)" alt="Event image" />
                  <div class="registration-status">
                    <RegistrationStatus :status="reg.status" />
                  </div>
      </div>

                <div class="event-content">
                  <div class="event-header">
                    <h4 class="event-title">{{ reg.event.title }}</h4>
      </div>

                  <div class="event-meta">
                    <div class="meta-item">
                      <ion-icon :icon="calendarOutline" />
                      <span>{{ formatEventDate(reg.event.startTime) }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="locationOutline" />
                      <span>{{ reg.event.location || 'Место не указано' }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="checkmarkCircleOutline" />
                      <span>Записан {{ formatDate(reg.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Нет результатов фильтрации -->
        <div v-else class="no-results">
          <div class="no-results-icon">
            <ion-icon :icon="searchOutline" />
          </div>
          <h3 class="no-results-title">Записи не найдены</h3>
          <p class="no-results-subtitle">Попробуйте изменить критерии поиска или сбросить фильтр</p>
          <ion-button fill="outline" @click="clearFilters" class="clear-button">
            Сбросить фильтр
          </ion-button>
        </div>
      </div>
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
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
  IonSearchbar
} from '@ionic/vue';
import { 
  calendarOutline,
  filterOutline,
  closeOutline,
  alertCircleOutline,
  clipboardOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  locationOutline,
  searchOutline
} from 'ionicons/icons';
import { participantsApi } from '../../api/participants';
import { useAuthStore } from '../../stores/auth';
import type { EventParticipantDTO } from '../../types/api';
import RegistrationStatus from '../../components/RegistrationStatus.vue';
import { getEventPlaceholder } from '../../utils/eventImages';

const authStore = useAuthStore();
const router = useRouter();

const registrations = ref<EventParticipantDTO[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);

const searchText = ref('');
const dateFrom = ref<string>('');
const dateTo = ref<string>('');
const dateFromRef = ref<HTMLInputElement | null>(null);
const dateToRef = ref<HTMLInputElement | null>(null);

const dateFromDisplay = computed(() => dateFrom.value ? formatDateInput(dateFrom.value) : '');
const dateToDisplay = computed(() => dateTo.value ? formatDateInput(dateTo.value) : '');

const filteredRegistrations = computed(() => {
  return registrations.value.filter(reg => {
    // Поиск по названию
    const matchesSearch = reg.event.title?.toLowerCase().includes(searchText.value.toLowerCase());
    // Фильтр по дате
    let from = true, to = true;
    if (dateFrom.value && reg.createdAt) {
      const fromDate = new Date(dateFrom.value + 'T00:00:00');
      const regDate = new Date(reg.createdAt);
      from = regDate >= fromDate;
    }
    if (dateTo.value && reg.createdAt) {
      const toDate = new Date(dateTo.value + 'T23:59:59');
      const regDate = new Date(reg.createdAt);
      to = regDate <= toDate;
    }
    return matchesSearch && from && to;
  });
});

const upcomingEvents = computed(() => {
  const now = new Date();
  return filteredRegistrations.value.filter(reg => {
    const eventDate = new Date(reg.event.startTime);
    return eventDate > now && reg.status !== 'CANCELLED';
  });
});

const completedEvents = computed(() => {
  const now = new Date();
  return filteredRegistrations.value.filter(reg => {
    const eventDate = new Date(reg.event.startTime);
    return eventDate <= now && reg.status !== 'CANCELLED';
  });
});

const cancelledEvents = computed(() => {
  return filteredRegistrations.value.filter(reg => reg.status === 'CANCELLED');
});

const upcomingCount = computed(() => upcomingEvents.value.length);
const completedCount = computed(() => completedEvents.value.length);
const cancelledCount = computed(() => cancelledEvents.value.length);

function openDatePicker(type: 'from' | 'to') {
  if (type === 'from' && dateFromRef.value) dateFromRef.value.showPicker();
  if (type === 'to' && dateToRef.value) dateToRef.value.showPicker();
}

function formatDateInput(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU');
}

const clearFilters = () => {
  dateFrom.value = '';
  dateTo.value = '';
  searchText.value = '';
};

const applyDateFilter = () => {};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short'
  });
};

const formatEventDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const fetchRegistrations = async () => {
  if (!authStore.user?.id) {
    error.value = new Error('Пользователь не авторизован.');
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    registrations.value = await participantsApi.getByUser(authStore.user.id);
  } catch (e) {
    console.error('Ошибка при загрузке записей:', e);
    error.value = e as Error;
  } finally {
    isLoading.value = false;
  }
};

const goToEvent = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const goToEvents = () => {
  router.push('/tabs/events-list');
};

onMounted(fetchRegistrations);
</script>

<style scoped>
.registrations-page {
  --background: var(--eco-background-secondary);
}

.registrations-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
}

/* Статистика */
.stats-section {
  padding: var(--eco-space-4);
}

.stats-card {
  background: linear-gradient(135deg, var(--eco-secondary) 0%, var(--eco-primary) 100%);
  color: white;
  border: none;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: var(--eco-space-4);
  margin-bottom: var(--eco-space-6);
}

.stats-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-icon ion-icon {
  font-size: 28px;
  color: white;
}

.stats-info h2 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  margin: 0 0 var(--eco-space-1) 0;
  color: white;
}

.stats-info p {
  font-size: var(--eco-font-size-sm);
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--eco-space-4);
}

.stat-item {
  text-align: center;
  padding: var(--eco-space-4);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--eco-radius-lg);
  backdrop-filter: blur(8px);
}

.stat-value {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-2xl);
  font-weight: var(--eco-font-weight-bold);
  margin-bottom: var(--eco-space-2);
  line-height: 1;
  color: white;
}

.stat-label {
  font-size: var(--eco-font-size-xs);
  font-weight: var(--eco-font-weight-medium);
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Поиск и фильтры */
.search-filters-section {
  padding: 0 var(--eco-space-4) var(--eco-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.search-card,
.filters-card {
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
}

.custom-searchbar {
  --background: transparent;
  --border-radius: 0;
  --box-shadow: none;
  --icon-color: var(--eco-gray-500);
  --color: var(--eco-gray-800);
      --placeholder-color: var(--eco-gray-600);
  --clear-button-color: var(--eco-gray-500);
  margin: 0;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
  margin-bottom: var(--eco-space-4);
  color: var(--eco-gray-700);
  font-weight: var(--eco-font-weight-medium);
}

.filters-header ion-icon {
  font-size: 18px;
  color: var(--eco-primary);
}

.filters-content {
  display: flex;
  align-items: end;
  gap: var(--eco-space-3);
}

.date-filter {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-2);
}

.filter-label {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-600);
}

.date-input-wrapper {
  position: relative;
  cursor: pointer;
}

.date-input {
  --background: var(--eco-gray-50);
  --border-radius: var(--eco-radius-lg);
  --border-width: 2px;
  --border-color: var(--eco-gray-200);
  --border-color-focused: var(--eco-primary);
  --color: var(--eco-gray-800);
  --placeholder-color: var(--eco-gray-600);
  --padding-start: 16px;
  --padding-end: 48px;
  cursor: pointer;
}

.date-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--eco-gray-500);
  pointer-events: none;
}

.clear-filter-button {
  --color: var(--eco-gray-500);
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

/* Секция регистраций */
.registrations-section {
  padding: 0 var(--eco-space-4) var(--eco-space-4);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eco-space-12);
  text-align: center;
}

.loading-spinner {
  margin-bottom: var(--eco-space-4);
}

.loading-text {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-500);
  margin: 0;
}

.error-state,
.empty-state,
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eco-space-12) var(--eco-space-6);
  text-align: center;
}

.error-icon,
.empty-icon,
.no-results-icon {
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

.empty-icon ion-icon,
.no-results-icon ion-icon {
  font-size: 40px;
  color: var(--eco-gray-600);
}

.error-title,
.empty-title,
.no-results-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-700);
  margin: 0 0 var(--eco-space-2) 0;
}

.error-subtitle,
.empty-subtitle,
.no-results-subtitle {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-500);
  margin: 0 0 var(--eco-space-6) 0;
  max-width: 280px;
}

.retry-button,
.clear-button {
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
}

.action-button {
  --background: var(--eco-primary);
  --color: white;
  --border-radius: var(--eco-radius-lg);
}

/* Группированный список */
.grouped-registrations {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-8);
}

.event-group {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.group-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
}

.group-title ion-icon {
  font-size: 20px;
  color: var(--eco-primary);
}

.group-count {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-normal);
  color: var(--eco-gray-500);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-3);
}

.event-card {
  display: flex;
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  cursor: pointer;
  transition: all var(--eco-transition-normal);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--eco-shadow-lg);
  border-color: var(--eco-gray-300);
}

.event-card.completed {
  opacity: 0.8;
}

.event-card.cancelled {
  opacity: 0.6;
  border-color: var(--eco-error);
}

.event-image {
  position: relative;
  width: 120px;
  height: 100px;
  flex-shrink: 0;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.registration-status {
  position: absolute;
  top: var(--eco-space-2);
  left: var(--eco-space-2);
}

.event-content {
  flex: 1;
  padding: var(--eco-space-4);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-header {
  margin-bottom: var(--eco-space-3);
}

.event-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-800);
  margin: 0;
  line-height: var(--eco-line-height-tight);
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-1);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-500);
}

.meta-item ion-icon {
  font-size: 14px;
  color: var(--eco-gray-600);
  flex-shrink: 0;
}

/* Отзывчивость */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--eco-space-3);
  }
  
  .stat-value {
    font-size: var(--eco-font-size-xl);
  }
  
  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-filter {
    flex: none;
  }
  
  .clear-filter-button {
    align-self: center;
  }
  
  .event-card {
    flex-direction: column;
  }
  
  .event-image {
    width: 100%;
    height: 120px;
  }
  
  .event-meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--eco-space-3);
  }
  
  .meta-item {
    font-size: var(--eco-font-size-sm);
  }
}

.empty-state ion-icon {
  font-size: 64px;
  color: var(--eco-gray-600);
  margin-bottom: var(--eco-space-4);
}

.refresh-icon {
  color: var(--eco-gray-600);
}
</style> 
