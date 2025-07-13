<template>
  <ion-page class="registrations-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title">Мои записи</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="registrations-content">
      <!-- Pull-to-refresh -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-text="Потяните для обновления"
          refreshing-text="Обновляем записи..."
        ></ion-refresher-content>
      </ion-refresher>

      <!-- Статистика -->
      <div class="stats-section">
        <div class="stats-card eco-card">
          <div class="stats-header">
            <div class="stats-icon">
              <ion-icon :icon="calendarOutline" />
            </div>
            <div class="stats-info">
              <h2>Мои мероприятия</h2>
              <p>{{ allUserRegistrations.length }} записей всего</p>
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
          <EcoSearchBar
            v-model="searchText"
            placeholder="Поиск мероприятий..."
          />
        </div>
        
        <div class="filters-card eco-card">
          <div class="filters-header">
            <ion-icon :icon="funnelOutline" />
            <span>Фильтр по дате записи</span>
          </div>
          
          <div class="filters-content">
            <div class="date-filter">
              <div class="date-input-wrapper" @click="openDatePicker('from')">
                <ion-input
                :value="dateFromDisplay"
                readonly
                  class="date-input"
                  placeholder="С: выберите дату"
                ></ion-input>
                <ion-icon :icon="calendarOutline" class="date-icon" />
                <ion-button 
                  v-if="dateFrom"
                  fill="clear" 
                  size="small" 
                  class="clear-date-button"
                  @click.stop="clearDateFrom"
                >
                  <ion-icon :icon="closeOutline" slot="icon-only" />
                </ion-button>
            </div>
          </div>
            
            <div class="date-filter">
              <div class="date-input-wrapper" @click="openDatePicker('to')">
                <ion-input
                :value="dateToDisplay"
                readonly
                  class="date-input"
                  placeholder="По: выберите дату"
                ></ion-input>
                <ion-icon :icon="calendarOutline" class="date-icon" />
                <ion-button 
                  v-if="dateTo"
                  fill="clear" 
                  size="small" 
                  class="clear-date-button"
                  @click.stop="clearDateTo"
                >
                  <ion-icon :icon="closeOutline" slot="icon-only" />
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Календарь -->
    <EcoCalendar 
      :show="showDatePicker" 
      :title="currentDateType === 'from' ? 'Выберите дату начала' : 'Выберите дату окончания'"
      @update:show="showDatePicker = $event"
      @select="onDateSelect"
    />

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
        <ErrorState
          v-else-if="error"
          :message="error.message"
          @retry="loadRegistrations(true)"
        />

        <!-- Пустое состояние -->
        <div v-else-if="filteredRegistrations.length === 0" class="empty-state">
          <div class="empty-icon">
            <ion-icon :icon="clipboardOutline" />
          </div>
          <h3 class="empty-title">Нет записей на мероприятия</h3>
          <p class="empty-subtitle">Найдите интересные экологические мероприятия и запишитесь на участие!</p>
          <ion-button fill="solid" @click="goToEvents" class="action-button">
            Найти мероприятия
          </ion-button>
        </div>

        <!-- ОДИН СПЛОШНОЙ СПИСОК -->
        <div v-else class="all-registrations-list">
          <div 
            v-for="reg in filteredRegistrations" 
            :key="reg.event.id + '-' + reg.createdAt"
            class="event-card eco-card eco-list-item"
            @click="goToEvent(reg.event.id ?? 0)"
          >
            <div class="event-content">
              <div class="event-header">
                <h4 class="event-title">{{ reg.event.title }}</h4>
              </div>
              <div class="event-meta">
                <div class="meta-row">
                  <span :class="['status-label', reg.membershipStatus === 'VALID' ? 'status-green' : 'status-red']">
                    {{ reg.membershipStatus === 'VALID' ? 'Записан' : 'Отменён' }}
                  </span>
                  <span class="created-at-label">Запись: {{ formatEventDate(reg.createdAt) }}</span>
                </div>
                <div class="event-start-time">
                  <span class="start-time-label">Начало: {{ (reg.event as any).startTime ? formatEventDate((reg.event as any).startTime) : 'Не указано' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ion-infinite-scroll @ionInfinite="loadMoreRegistrations" :disabled="!hasMore">
        <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Загрузка..."></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import { 
  calendarOutline,
  funnelOutline,
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
import ErrorState from '../../components/ErrorState.vue';
import { getEventPlaceholder } from '../../utils/eventImages';
import EcoCalendar from '../../components/EcoCalendar.vue';
import EcoSearchBar from '../../components/EcoSearchBar.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const registrations = ref<EventParticipantDTO[]>([]);
const allUserRegistrations = ref<EventParticipantDTO[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);

const searchText = ref('');
const dateFrom = ref<string>('');
const dateTo = ref<string>('');
const showDatePicker = ref(false);
const currentDateType = ref<'from' | 'to'>('from');

const page = ref(0);
const size = 50;
const hasMore = ref(true);

const dateFromDisplay = computed(() => dateFrom.value ? formatDateInput(dateFrom.value) : '');
const dateToDisplay = computed(() => dateTo.value ? formatDateInput(dateTo.value) : '');

const filteredRegistrations = computed(() => {
  // Если нет активных фильтров, показываем все записи
  const hasActiveFilters = searchText.value || dateFrom.value || dateTo.value;
  
  if (!hasActiveFilters) {
    return registrations.value;
  }
  
  return registrations.value.filter(reg => {
    // Поиск по названию
    const matchesSearch = !searchText.value || reg.event.title?.toLowerCase().includes(searchText.value.toLowerCase());
    
    // Фильтр по дате
    let matchesDateFrom = true;
    let matchesDateTo = true;
    
    if (dateFrom.value && reg.createdAt) {
      const fromDate = new Date(dateFrom.value + 'T00:00:00');
      const regDate = new Date(reg.createdAt);
      matchesDateFrom = regDate >= fromDate;
    }
    
    if (dateTo.value && reg.createdAt) {
      const toDate = new Date(dateTo.value + 'T23:59:59');
      const regDate = new Date(reg.createdAt);
      matchesDateTo = regDate <= toDate;
    }
    
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });
});

const upcomingEvents = computed(() => {
  const now = new Date();
  const result = filteredRegistrations.value.filter(reg => {
    const eventStartTime = (reg.event as any).startTime;
    // Если нет startTime, не считаем предстоящим
    if (!eventStartTime) return false;
    const eventDate = new Date(eventStartTime);
    // Показываем только VALID регистрации
    return eventDate > now && reg.status !== 'CANCELLED' && (reg.membershipStatus !== 'INVALID');
  });
  return result;
});

const completedEvents = computed(() => {
  const now = new Date();
  const result = filteredRegistrations.value.filter(reg => {
    const eventStartTime = (reg.event as any).startTime;
    // Если нет startTime, считаем завершённым (или показываем в завершённых)
    if (!eventStartTime) {
      return reg.status !== 'CANCELLED' && (reg.membershipStatus !== 'INVALID');
    }
    const eventDate = new Date(eventStartTime);
    // Показываем только VALID регистрации
    return eventDate <= now && reg.status !== 'CANCELLED' && (reg.membershipStatus !== 'INVALID');
  });
  return result;
});

const cancelledEvents = computed(() => {
  // Показываем события со статусом CANCELLED или с membershipStatus INVALID
  const result = filteredRegistrations.value.filter(reg => 
    reg.status === 'CANCELLED' || reg.membershipStatus === 'INVALID'
  );
  return result;
});

const upcomingCount = computed(() => {
  const now = new Date();
  return allUserRegistrations.value.filter(reg => {
    const eventStartTime = (reg.event as any).startTime;
    if (!eventStartTime) return false;
    const eventDate = new Date(eventStartTime);
    return eventDate > now && reg.status !== 'CANCELLED' && reg.membershipStatus !== 'INVALID';
  }).length;
});

const completedCount = computed(() => {
  const now = new Date();
  return allUserRegistrations.value.filter(reg => {
    const eventStartTime = (reg.event as any).startTime;
    if (!eventStartTime) {
      return reg.status !== 'CANCELLED' && reg.membershipStatus !== 'INVALID';
    }
    const eventDate = new Date(eventStartTime);
    return eventDate <= now && reg.status !== 'CANCELLED' && reg.membershipStatus !== 'INVALID';
  }).length;
});

const cancelledCount = computed(() => {
  return allUserRegistrations.value.filter(reg => 
    reg.status === 'CANCELLED' || reg.membershipStatus === 'INVALID'
  ).length;
});

const hasActiveFilters = computed(() => {
  const result = !!(searchText.value || dateFrom.value || dateTo.value);
  return result;
});

function formatDateInput(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU');
}

function openDatePicker(type: 'from' | 'to') {
  currentDateType.value = type;
  showDatePicker.value = true;
}

function onDateSelect(dateString: string) {
  if (currentDateType.value === 'from') {
    dateFrom.value = dateString;
  } else {
    dateTo.value = dateString;
  }
  loadRegistrations(true); // Применяем фильтр и загружаем заново
}

const clearDateFrom = () => {
  dateFrom.value = '';
  loadRegistrations(true); // Перезагружаем данные
};

const clearDateTo = () => {
  dateTo.value = '';
  loadRegistrations(true); // Перезагружаем данные
};

const clearFilters = () => {
  dateFrom.value = '';
  dateTo.value = '';
  searchText.value = '';
  loadRegistrations(true); // Сбрасываем фильтр и загружаем заново
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

const loadRegistrations = async (reset = false) => {
  if (!authStore.user?.id) {
    error.value = new Error('Пользователь не авторизован.');
    isLoading.value = false;
    return;
  }
  if (reset) {
    page.value = 0;
    registrations.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;
  isLoading.value = true;
  error.value = null;
  const filter: any = {
    userId: authStore.user.id,
    status: 'CONFIRMED',
    page: page.value,
    size,
  };
  
  // Добавляем пользовательские фильтры только если они заданы
  if (dateFrom.value) filter.createdAtFrom = dateFrom.value + 'T00:00:00';
  if (dateTo.value) filter.createdAtTo = dateTo.value + 'T23:59:59';
  
  // Поиск по названию (если поддерживается API)
  // if (searchText.value) filter.title = searchText.value;
  try {
    const result = await participantsApi.search(filter) as { content: any[]; last: boolean };
    const items = result?.content ?? [];
    if (items.length > 0) {
      registrations.value = [...registrations.value, ...items];
      hasMore.value = !result.last;
      page.value += 1;
    } else {
      hasMore.value = false;
    }
  } catch (e) {
    error.value = e as Error;
    hasMore.value = false;
  } finally {
    isLoading.value = false;
  }
};

const loadMoreRegistrations = async (event: any) => {
  await loadRegistrations();
  event.target.complete();
};

const loadUserStats = async () => {
  if (!authStore.user?.id) return;
  
  try {
    const result = await participantsApi.getByUser(authStore.user.id) as EventParticipantDTO[];
    allUserRegistrations.value = result || [];
  } catch (e) {
    console.error('Ошибка загрузки статистики:', e);
  }
};

const goToEvent = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const goToEvents = () => {
  router.push('/tabs/events-list');
};

const handleRefresh = async (event: any) => {
  await Promise.all([
    loadUserStats(),
    loadRegistrations(true)
  ]);
  event.target.complete();
};

// Обновляем данные при каждом переходе на эту страницу
watch(
  () => route.fullPath,
  async (newPath) => {
    if (newPath === '/tabs/my-registrations') {
      await Promise.all([
        loadUserStats(),
        loadRegistrations(true)
      ]);
    }
  }
);

onMounted(() => {
  loadUserStats();
  loadRegistrations(true);
});
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
  padding: var(--eco-space-3);
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
  padding: 0 var(--eco-space-3);
  margin-bottom: var(--eco-space-3);
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.search-card,
.filters-card {
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  margin-bottom: var(--eco-space-2);
}

.search-section {
  margin-bottom: 0 !important;
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
  --padding-end: 80px;
  cursor: pointer;
  border-radius: var(--eco-radius-lg);
}

.date-icon {
  position: absolute;
  right: 48px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--eco-gray-500);
  pointer-events: none;
}

.clear-date-button {
  position: absolute;
  right: 8px;
  top: 40%;
  transform: translateY(-50%);
  --color: var(--eco-gray-500);
  --background: transparent;
  --border-radius: var(--eco-radius-lg);
  width: 32px;
  height: 32px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-date-button:hover {
  --background: var(--eco-gray-100);
}

.clear-date-button ion-icon {
  font-size: 32px;
}

/* Список регистраций */
.registrations-section {
  padding: 0 var(--eco-space-3) var(--eco-space-3);
}

.all-registrations-list {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-2);
}

.event-card {
  display: flex;
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  cursor: pointer;
  transition: all var(--eco-transition-normal);
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
  min-height: 80px;
}

.event-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--eco-shadow-md);
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
  border-radius: var(--eco-radius-lg) 0 0 var(--eco-radius-lg);
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
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-header {
  margin-bottom: var(--eco-space-1);
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
  align-items: flex-start;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-1);
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-500);
}

.meta-item ion-icon {
  font-size: 14px;
  color: var(--eco-gray-600);
  flex-shrink: 0;
}

.event-start-time {
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-600);
}

.start-time-label {
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-600);
}

/* Отзывчивость */
@media (max-width: 480px) {
  .stats-section {
    padding: var(--eco-space-3);
  }
  
  .search-filters-section {
    padding: 0 var(--eco-space-3) var(--eco-space-3);
  }
  
  .registrations-section {
    padding: 0 var(--eco-space-3) var(--eco-space-4);
  }
  
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
    gap: var(--eco-space-4);
  }
  
  .date-filter {
    flex: none;
  }
  
  .clear-date-button {
    width: 28px;
    height: 28px;
  }
  
  .event-card {
    flex-direction: column;
    border-radius: var(--eco-radius-lg);
  }
  
  .event-image {
    width: 100%;
    height: auto;
    /* max-height: 320px; */
    border-radius: var(--eco-radius-lg) var(--eco-radius-lg) 0 0;
  }
  
  .event-meta {
    flex-direction: column;
    gap: var(--eco-space-2);
  }
  
  .meta-item {
    font-size: var(--eco-font-size-sm);
  }
  
  .eco-card {
    margin-bottom: var(--eco-space-2);
    padding: var(--eco-space-3);
  }
  
  /* Адаптивные стили для мобильных устройств */
  
  .eco-card {
    margin-bottom: var(--eco-space-2);
    padding: var(--eco-space-3);
  }
}

/* Дополнительные стили для общих элементов */
.eco-card {
  margin-bottom: var(--eco-space-3);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-4);
  box-shadow: var(--eco-shadow-sm);
  transition: all var(--eco-transition-normal);
}

.search-card {
  padding: var(--eco-space-2);
  box-shadow: var(--eco-shadow-sm);
}

.filters-card {
  box-shadow: var(--eco-shadow-sm);
}

/* Улучшения для empty state */
.empty-state ion-icon {
  font-size: 64px;
  color: var(--eco-gray-600);
  margin-bottom: var(--eco-space-4);
}

/* Дополнительные стили кнопок */
.retry-button {
  --color: var(--eco-primary);
  --border-color: var(--eco-primary);
  font-weight: var(--eco-font-weight-medium);
}

.clear-button {
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
  border-radius: var(--eco-radius-lg);
  margin-top: var(--eco-space-2);
}

.action-button {
  --background: var(--eco-primary);
  --color: white;
  border-radius: var(--eco-radius-lg);
  margin-top: var(--eco-space-2);
}

.status-label {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  display: inline-block;
}
.status-green {
  background: #e6f9e6;
  color: #1a8a1a;
}
.status-red {
  background: #ffeaea;
  color: #d32f2f;
}
.created-at-label {
  color: #888;
  font-size: 12px;
  margin-left: 0;
}
</style> 
