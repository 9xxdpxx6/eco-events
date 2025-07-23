<template>
  <ion-page class="events-management-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title" @click="scrollToTop">Мои мероприятия</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="create-button" @click="createEvent">
            <ion-icon :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content ref="contentRef" class="events-content" :scroll-events="true" @ionScroll="onScroll">
      <!-- Pull-to-refresh -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-text="Потяните для обновления"
          refreshing-text="Загружаем мероприятия..."
        ></ion-refresher-content>
      </ion-refresher>
      
      <!-- Hero секция со статистикой -->
      <div class="stats-hero">
        <div class="hero-background"></div>
        <div class="hero-content">
          <div class="stats-header">
            <div class="stats-icon">
              <ion-icon :icon="businessOutline" />
            </div>
            <div class="stats-info">
              <h2>Управление мероприятиями</h2>
              <h5>Всего мероприятий: {{ statistics.totalEvents }}</h5>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.upcomingEvents }}</div>
              <div class="stat-label">Предстоящие</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ statistics.activeEvents }}</div>
              <div class="stat-label">Активные</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ statistics.completedEvents }}</div>
              <div class="stat-label">Завершённые</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Поиск и фильтры -->
      <div :class="['search-filters-container', { 'filters-hidden': !filtersVisible }]">
        <EcoSearchBar
          v-model="searchText"
          placeholder="Поиск мероприятий..."
          :show-view-toggle="false"
          :show-sort-select="true"
          :sort-options="sortOptions"
          :sort-value="sortBy"
          @update:sort-value="selectSort"
        />
        <div class="filters-section">
          <div class="filters-scroll">
            <ion-chip
              v-for="filter in filters"
              :key="filter.value"
              :class="['filter-chip', { 'active': selectedFilter === filter.value }]"
              @click="setFilter(filter.value)"
            >
              <ion-label>{{ filter.label }}</ion-label>
              <!-- <div v-if="filter.count > 0" class="chip-count">{{ filter.count }}</div> -->
            </ion-chip>
          </div>
        </div>
        
        <!-- Фильтры по дате -->
        <DateRangeFilter
          v-model="dateRange"
          title="Фильтр по дате события"
          from-placeholder="С: дата начала"
          to-placeholder="По: дата начала"
          @change="onDateRangeChange"
        />
      </div>

      <!-- Список мероприятий -->
      <div class="events-section">
        <!-- Лоадер -->
        <div v-if="isLoading" class="loader-container">
          <EventListLoader />
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="events.length === 0" class="empty-state">
          <div class="empty-icon">
            <ion-icon :icon="calendarOutline" />
          </div>
          <h3 class="empty-title">Нет созданных мероприятий</h3>
          <p class="empty-subtitle">Создайте своё первое экологическое мероприятие и начните привлекать волонтёров!</p>
          <ion-button fill="solid" @click="createEvent" class="main-create-btn">
            <ion-icon :icon="addOutline" slot="start" class="main-create-btn__icon" />
            Создать мероприятие
          </ion-button>
      </div>

        <!-- Нет результатов поиска -->
        <div v-else-if="events.length === 0" class="no-results">
          <div class="no-results-icon">
            <ion-icon :icon="searchOutline" />
            </div>
          <h3 class="no-results-title">Мероприятия не найдены</h3>
          <p class="no-results-subtitle">Попробуйте изменить критерии поиска или создать новое мероприятие</p>
          <div class="no-results-actions">
            <ion-button fill="outline" @click="clearSearch" class="clear-button">
              Сбросить поиск
            </ion-button>
            <ion-button fill="solid" @click="createEvent" class="action-button">
              <ion-icon :icon="addOutline" slot="start" />
              Создать мероприятие
            </ion-button>
          </div>
        </div>

        <!-- Список мероприятий -->
        <div v-else class="events-list">
          <div 
            v-for="event in events" 
            :key="event.id ?? Math.random()"
            class="event-card eco-card eco-list-item"
            @click="viewEventDetails(Number(event.id))"
          >
            <div class="event-image">
              <template v-if="!brokenImages[event.id]">
                <img 
                  :src="event.preview
                    ? (event.preview.startsWith('uploads/')
                        ? API_URL + '/' + event.preview
                        : IMAGE_BASE_URL + '/' + event.preview)
                    : getEventPlaceholder(event.id ?? 0)" 
                  alt="Event image" 
                  :style="{ 
                    'width': event.preview ? '100%' : 'auto'
                  }"
                  @error="handleImgError(event.id)"
                />
              </template>
              <template v-else>
                <BrokenImagePlaceholder class="broken-image-full" />
              </template>
              <div class="event-status">
                <span :class="['status-badge', 'eco-status', getEventStatusClass(event)]">
                  {{ event.conducted ? 'Проведено' : getEventStatus(event) }}
                </span>
              </div>
            </div>
            
            <div class="event-content">
              <div class="event-header">
                <h3 class="event-title">{{ event.title }}</h3>
              </div>
              
              <div class="event-meta">
                <div class="meta-item">
                  <ion-icon :icon="calendarOutline" />
                  <span>{{ formatDate(event.startTime) }}</span>
                </div>
                <div class="meta-item">
                  <ion-icon :icon="locationOutline" />
                  <span>{{ event.location || 'Место не указано' }}</span>
                </div>
                <div class="meta-item">
                  <ion-icon :icon="layersOutline" />
                  <span>{{ event.eventType?.name || 'Тип не указан' }}</span>
                </div>
              </div>
              
              <div class="event-stats">
                <div class="stat-chip">
                  <ion-icon :icon="peopleOutline" />
                  <span>Участников: {{ getParticipantsCount(event) }}</span>
                </div>
                <div class="event-actions" @click.stop>
                  <ion-button 
                    fill="clear" 
                    size="small"
                    class="action-btn delete-btn" 
                    @click="confirmDeleteEvent(event)"
                  >
                    <ion-icon :icon="trashOutline" />
                  </ion-button>
                  <ion-button 
                    fill="clear" 
                    size="small"
                    class="action-btn edit-btn" 
                    @click="editEvent(Number(event.id))"
                  >
                    <ion-icon :icon="createOutline" />
                  </ion-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Бесконечная прокрутка -->
      <ion-infinite-scroll 
        @ionInfinite="loadMoreEvents" 
        :disabled="!hasMore"
        threshold="100px"
      >
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="Загрузка..."
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <!-- FAB кнопка -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="createEvent" class="create-fab">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Eco Delete Dialog -->
    <EcoDialog
      :is-open="showDeleteDialog"
      title="Удалить мероприятие?"
      :message="`Вы уверены, что хотите удалить «${eventToDelete?.title}»? Это действие необратимо.`"
      confirm-text="Удалить"
      cancel-text="Отмена"
      :is-destructive="true"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
      @dismiss="handleDeleteCancel"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { onIonViewWillEnter } from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonChip,
  IonLabel,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/vue';
import {
  addOutline,
  calendarOutline,
  peopleOutline,
  createOutline,
  trashOutline,
  searchOutline,
  businessOutline,
  locationOutline,
  layersOutline,
  listOutline,
  arrowUpOutline,
  arrowDownOutline,
  textOutline
} from 'ionicons/icons';
import { useEventsStore, useAuthStore } from '../../stores';
import type { EventResponseMediumDTO } from '../../types/api';
import { getEventPlaceholder } from '../../utils/eventImages';
import EcoSearchBar from '../../components/EcoSearchBar.vue';
import EventListLoader from '../../components/EventListLoader.vue';
import DateRangeFilter from '../../components/DateRangeFilter.vue';
import { IMAGE_BASE_URL } from '../../api/client';
import { API_URL } from '../../api/client';
import EcoDialog from '../../components/EcoDialog.vue';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { ref as vueRef } from 'vue';
import BrokenImagePlaceholder from '../../components/BrokenImagePlaceholder.vue';
import { clearFileUrlCache } from '@/utils/imageUploaderCache';
import { usersApi } from '../../api/users';
import type { OrganizationStatsDTO } from '../../types/api';

const router = useRouter();
const eventsStore = useEventsStore();
const authStore = useAuthStore();

const events = ref<EventResponseMediumDTO[]>([]);
const page = ref(0);
const size = 100;
const hasMore = ref(true);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const selectedFilter = ref('all');
const searchText = ref('');
const dateRange = ref({ from: '', to: '' });
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const contentRef = ref();
const filtersVisible = ref(true);

// Dialog state
const showDeleteDialog = ref(false);
const eventToDelete = ref<EventResponseMediumDTO | null>(null);
const lastScrollY = ref(0);

const sortBy = ref('id_DESC');

const sortOptions = [
  { value: 'id_DESC', label: 'По умолчанию', icon: 'listOutline' },
  { value: 'startTime_DESC', label: 'По убыванию даты', icon: 'arrowDownOutline' },
  { value: 'startTime_ASC', label: 'По возрастанию даты', icon: 'arrowUpOutline' },
  { value: 'title_ASC', label: 'По названию А-Я', icon: 'textOutline' },
  { value: 'title_DESC', label: 'По названию Я-А', icon: 'textOutline' }
];

const scrollToTop = async () => {
  if (contentRef.value) {
    await contentRef.value.$el.scrollToTop(300);
  }
};

const handleRefresh = async (event: any) => {
  await loadEvents(true);
  event.target.complete();
};

const loadMoreEvents = async (event: any) => {
  if (isLoading.value || isLoadingMore.value || !hasMore.value) {
    event.target.complete();
    return;
  }
  await loadEvents(false);
  event.target.complete();
};

const setFilter = (value: string) => {
  selectedFilter.value = value;
  loadEvents(true);
};

const selectSort = (value: string) => {
  sortBy.value = value;
  loadEvents(true);
};

const onDateRangeChange = () => {
  if (dateRange.value.from || dateRange.value.to) {
    selectedFilter.value = 'all'; // Сбросить вкладку на "Все" при выборе диапазона дат
  }
  loadEvents(true);
};

watch(searchText, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    loadEvents(true);
  }, 400);
});

const filters = computed(() => [
  { value: 'all', label: 'Все', count: events.value.length },
  { value: 'upcoming', label: 'Предстоящие', count: 0 },
  { value: 'active', label: 'Активные', count: 0 },
  { value: 'past', label: 'Завершённые', count: 0 },
]);

const onScroll = (event: any) => {
  const currentScrollY = event.detail.scrollTop;
  
  if (currentScrollY > lastScrollY.value + 20 && currentScrollY > 50) {
    // Скролл вниз - скрываем фильтры
    filtersVisible.value = false;
  } else if (currentScrollY < lastScrollY.value - 20) {
    // Скролл вверх - показываем фильтры
    filtersVisible.value = true;
  }
  
  lastScrollY.value = currentScrollY;
};

const loadEvents = async (reset = true) => {
  if (reset) {
    isLoading.value = true;
    page.value = 0;
    events.value = [];
    hasMore.value = true;
  } else {
    page.value += 1;
    isLoadingMore.value = true;
  }
  try {
    const [sortField, sortOrder] = sortBy.value.split('_');
    const params: any = {
      userId: authStore.user?.id,
      page: page.value,
      size: size,
      sortBy: sortField,
      sortOrder: sortOrder,
    };
    if (searchText.value) {
      params.keyword = searchText.value;
    }
    // --- Исправленная логика ---
    if (dateRange.value.from) {
      const fromDate = new Date(dateRange.value.from + 'T00:00:00');
      params.startDateFrom = fromDate.toISOString().replace('Z', '');
    }
    if (dateRange.value.to) {
      const toDate = new Date(dateRange.value.to + 'T23:59:59');
      params.startDateTo = toDate.toISOString().replace('Z', '');
    }
    // Если диапазон дат НЕ выбран — применяем фильтр по статусу
    if (!dateRange.value.from && !dateRange.value.to) {
      switch (selectedFilter.value) {
        case 'upcoming':
          params.startDateFrom = new Date().toISOString().replace('Z', '');
          break;
        case 'active': {
          const now = new Date();
          const nowStr = now.toISOString().replace('Z', '');
          params.startDateFrom = nowStr;
          params.endDateTo = nowStr;
          break;
        }
        case 'past':
          params.startDateTo = new Date().toISOString().replace('Z', '');
          break;
      }
    }
    // --- конец исправления ---
    const query = new URLSearchParams(params).toString();
    const fullURL = `/api/events/search?${query}`;
    console.log('API Request:', {
      method: 'get',
      url: '/api/events/search',
      baseURL: 'http://192.168.31.250:8080',
      fullURL,
      params
    });
    await eventsStore.fetchEventsSearch(params);
    const newEvents = eventsStore.getEvents;
    if (reset) {
      events.value = newEvents;
    } else {
      // Добавляем только уникальные
      const existingIds = new Set(events.value.map(e => e.id));
      events.value = [...events.value, ...newEvents.filter(e => !existingIds.has(e.id))];
    }
    hasMore.value = newEvents.length === size;
    clearFileUrlCache();
  } catch (error) {
    console.error('Error loading events:', error);
    await showErrorToast('Ошибка загрузки мероприятий', 3000);
  } finally {
    if (reset) {
      isLoading.value = false;
    } else {
      isLoadingMore.value = false;
    }
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getEventStatus = (event: EventResponseMediumDTO) => {
  const now = new Date();
  const eventDate = new Date(event.startTime);
  const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000); // +4 часа
  
  if (eventEndTime < now) {
    return 'Завершено';
  } else if (eventDate <= now && eventEndTime > now) {
    return 'Активно';
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'Скоро';
  } else {
    return 'Запланировано';
  }
};

const getEventStatusClass = (event: EventResponseMediumDTO) => {
  if (event.conducted) return 'eco-status-conducted';
  const now = new Date();
  const eventDate = new Date(event.startTime);
  const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
  
  if (eventEndTime < now) {
    return 'eco-status-finished';
  } else if (eventDate <= now && eventEndTime > now) {
    return 'eco-status-active';
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'eco-status-soon';
  } else {
    return 'eco-status-upcoming';
  }
};

const getParticipantsCount = (event: EventResponseMediumDTO) => {
  return event.totalVisitors?.toString() ?? '0';
};

const createEvent = () => {
  router.push('/create-event');
};

const editEvent = (eventId: number) => {
  router.push(`/edit-event/${eventId}`);
};

const viewEventDetails = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const confirmDeleteEvent = (event: EventResponseMediumDTO) => {
  if (!event.id) return;
  eventToDelete.value = event;
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  const event = eventToDelete.value;
  if (!event?.id) return;
  
  showDeleteDialog.value = false;
  
  try {
    await eventsStore.deleteEvent(event.id);
    // Обновляем allEvents и filteredEvents
    events.value = events.value.filter(e => e.id !== event.id);
    // hasMore.value = events.value.length === size; // This line is no longer needed as loadEvents handles pagination
    loadEvents(true); // Reload all events to update stats
    
    await showSuccessToast('Мероприятие удалено', 2000);
  } catch (error) {
    console.error('Error deleting event:', error);
    await showErrorToast('Ошибка при удалении мероприятия', 3000);
  }
};

const handleDeleteCancel = () => {
  showDeleteDialog.value = false;
  eventToDelete.value = null;
};

const clearSearch = () => {
  searchText.value = '';
  selectedFilter.value = 'all';
  dateRange.value = { from: '', to: '' };
};

// Удаляю все вычисления и методы, связанные с client-side фильтрацией и сортировкой (filteredEvents, filterAndSearchEvents, paginatedEvents и т.д.)
// Вместо allEvents/filteredEvents используем только events.value

watch(events, () => {
  // This watcher is no longer needed as filtering and sorting are server-side
});

// Для отслеживания битых картинок в списке
const brokenImages = vueRef<{ [key: number]: boolean }>({});
function handleImgError(idx: number) {
  brokenImages.value[idx] = true;
}

const statistics = ref<OrganizationStatsDTO & { activeEvents?: number; upcomingEvents?: number; completedEvents?: number }>({
  totalEvents: 0,
  totalBonusesAccrued: 0,
  conductedEvents: 0,
  totalParticipants: 0,
  eventTypes: [],
  activeEvents: 0,
  upcomingEvents: 0,
  completedEvents: 0,
});
const isLoadingStats = ref(false);

const loadStatistics = async () => {
  isLoadingStats.value = true;
  try {
    const userId = authStore.user?.id;
    if (!userId) return;
    const stats = await usersApi.getOrganizationStats(userId);
    statistics.value = {
      ...stats,
      activeEvents: stats.activeEvents ?? 0,
      upcomingEvents: stats.upcomingEvents ?? 0,
      completedEvents: stats.completedEvents ?? 0,
    };
  } catch (e) {
    console.error('Ошибка загрузки статистики:', e);
    await showErrorToast('Ошибка загрузки статистики', 3000);
  } finally {
    isLoadingStats.value = false;
  }
};

onMounted(() => {
  loadStatistics();
  loadEvents();
});

onIonViewWillEnter(() => {
  loadStatistics();
  loadEvents();
});

defineExpose({ statistics });
</script>

<style scoped>
.events-management-page {
  --background: var(--eco-background-secondary);
}

.events-management-page ion-header {
  box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  --box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  position: relative;
  z-index: 1000;
}

.events-management-page ion-toolbar {
  box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  --box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  display: flex;
  justify-content: flex-start;
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  text-align: center;
  justify-content: center;
  display: flex;
  width: 100%;
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;
}

.events-management-page ion-title {
  width: 100%;
  text-align: center;
  justify-content: center;
  display: flex;
  pointer-events: none;
}

.events-management-page ion-buttons[slot="end"] {
  z-index: 2;
}

.create-button {
  --color: var(--eco-gray-700);
}

/* Hero секция */
.stats-hero {
  position: relative;
  padding: var(--eco-space-8) var(--eco-space-4) var(--eco-space-6);
  margin-bottom: var(--eco-space-4);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-secondary) 100%);
  border-radius: 0 0 var(--eco-radius-xl) var(--eco-radius-xl);
}

.hero-content {
  position: relative;
  color: white;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: var(--eco-space-4);
  margin-bottom: var(--eco-space-6);
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-icon ion-icon {
  font-size: 48px;
  color: white;
}

.stats-info h2 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  margin: 0 0 var(--eco-space-1) 0;
  color: white;
}

.stats-info h5 {
  font-weight: var(--eco-font-weight-regular);
  font-size: var(--eco-font-size-md);
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.stats-info p {
  font-size: var(--eco-font-size-sm);
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--eco-space-2);
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
.search-filters-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--eco-white);
  border-bottom: 1px solid var(--eco-gray-200);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-4);
  transform: translateY(0);
  transition: transform var(--eco-transition-normal), opacity var(--eco-transition-normal);
  opacity: 1;
  margin-bottom: var(--eco-space-4);
  margin-left: var(--eco-space-4);
  margin-right: var(--eco-space-4);
}

.search-filters-container.filters-hidden {
  transform: translateY(-200px);
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

.filters-section {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  margin-top: var(--eco-space-3);
}

.filters-section::-webkit-scrollbar {
  display: none;
}

.filters-scroll {
  display: flex;
  gap: var(--eco-space-2);
}

.filter-chip {
  flex-shrink: 0;
  --background: var(--eco-gray-100);
  --color: var(--eco-gray-600);
  border-radius: var(--eco-radius-lg);
  font-weight: var(--eco-font-weight-medium);
  font-size: var(--eco-font-size-sm);
  transition: all var(--eco-transition-normal);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
}

.filter-chip.active {
  --background: var(--eco-primary);
  --color: white;
  transform: scale(1.05);
}

.chip-count {
  background: var(--eco-gray-500);
  color: white;
  font-size: var(--eco-font-size-xs);
  font-weight: var(--eco-font-weight-bold);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

.filter-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.9);
  color: var(--eco-primary);
}

/* События */
.events-section {
  padding: 0 var(--eco-space-4) var(--eco-space-6);
}

.loader-container {
  padding: var(--eco-space-6);
}

.empty-state,
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eco-space-12) var(--eco-space-6);
  text-align: center;
}

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

.empty-icon ion-icon,
.no-results-icon ion-icon {
  font-size: 40px;
  color: var(--eco-gray-600);
}

.empty-title,
.no-results-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-700);
  margin: 0 0 var(--eco-space-2) 0;
}

.empty-subtitle,
.no-results-subtitle {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-500);
  margin: 0 0 var(--eco-space-6) 0;
  max-width: 280px;
}

.no-results-actions {
  display: flex;
  gap: var(--eco-space-3);
  flex-wrap: wrap;
  justify-content: center;
}

.clear-button {
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
}

.action-button {
  --background: var(--eco-primary);
  --color: white;
  --border-radius: var(--eco-radius-lg);
}

/* Список событий */
.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.event-card {
  display: flex;
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  cursor: pointer;
  transition: all var(--eco-transition-normal);
}



.event-image {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-height: 300px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--eco-radius-lg);
  text-align: center;
}

.event-image img {
  height: 100%;
}

.event-status {
  position: absolute;
  top: var(--eco-space-2);
  left: var(--eco-space-2);
  z-index: 99;
}

.event-content {
  flex: 1;
  padding: var(--eco-space-4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--eco-space-3);
}

.event-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
  flex: 1;
  margin-right: var(--eco-space-3);
  line-height: var(--eco-line-height-tight);
}

.event-actions {
  display: flex;
  gap: var(--eco-space-1);
  flex-shrink: 0;
}

.action-btn {
  --color: var(--eco-gray-500);
  font-size: 16px;
}



.event-meta {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-1);
  margin-bottom: var(--eco-space-3);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-500);
}

.meta-item ion-icon {
  font-size: 14px;
  color: var(--eco-gray-600);
  flex-shrink: 0;
}

.event-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--eco-space-2);
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: var(--eco-space-1);
  padding: var(--eco-space-1) var(--eco-space-2);
  background: var(--eco-gray-100);
  border-radius: var(--eco-radius-md);
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-600);
}

.stat-chip ion-icon {
  font-size: 12px;
  color: var(--eco-gray-500);
}

/* FAB */
.create-fab {
  --background: var(--eco-primary);
  --background-activated: var(--eco-primary-dark);
  --color: white;
}

/* Отзывчивость */
@media (max-width: 480px) {
  .stat-value {
    font-size: var(--eco-font-size-xl);
  }
  
  .no-results-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .event-card {
    flex-direction: column;
  }

  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--eco-space-2);
  }
  
  .event-actions {
    align-self: flex-end;
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

.search-input {
  --background: var(--eco-gray-50);
  --border-radius: var(--eco-radius-lg);
  --border-width: 2px;
  --border-color: var(--eco-gray-200);
  --border-color-focused: var(--eco-primary);
  --color: var(--eco-gray-800);
  --placeholder-color: var(--eco-gray-600);
  --padding-start: 16px;
  --padding-end: 48px;
}

.empty-state ion-icon {
  font-size: 64px;
  color: var(--eco-gray-600);
  margin-bottom: var(--eco-space-4);
}

.main-create-btn {
  width: 80%;
  max-width: 320px;
  margin: var(--eco-space-4) auto 0 auto;
  border-radius: var(--eco-radius-xl);
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  --background: var(--eco-primary);
  --color: white;
  --background-activated: var(--eco-primary-dark);
  transition: box-shadow 0.2s;
  height: 40px;
  min-height: 40px;
  padding: 0 18px;
}
.main-create-btn__icon {
  font-size: 28px !important;
  color: white !important;
  margin-top: 12px;
  margin-right: 8px;
  display: flex;
  align-items: center;
}
.main-create-btn:hover, .main-create-btn:active {
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.12);
}
.broken-image-full {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.eco-status-conducted {
  background: #b3c2d1;
  color: #234;
  border: 1px solid #a0b0c0;
}
</style> 
