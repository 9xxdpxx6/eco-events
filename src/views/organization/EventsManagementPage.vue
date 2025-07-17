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
              <h5>Всего мероприятий: {{ allEvents.length }}</h5>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ upcomingEventsCount }}</div>
              <div class="stat-label">Предстоящие</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ activeEventsCount }}</div>
              <div class="stat-label">Активные</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ completedEventsCount }}</div>
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
              <div v-if="filter.count > 0" class="chip-count">{{ filter.count }}</div>
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
        <div v-else-if="allEvents.length === 0" class="empty-state">
          <div class="empty-icon">
            <ion-icon :icon="calendarOutline" />
          </div>
          <h3 class="empty-title">Нет созданных мероприятий</h3>
          <p class="empty-subtitle">Создайте своё первое экологическое мероприятие и начните привлекать волонтёров!</p>
          <ion-button fill="solid" @click="createEvent" class="action-button">
            <ion-icon :icon="addOutline" slot="start" />
            Создать мероприятие
          </ion-button>
      </div>

        <!-- Нет результатов поиска -->
        <div v-else-if="filteredEvents.length === 0" class="no-results">
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
            v-for="event in paginatedEvents" 
            :key="event.id ?? Math.random()"
            class="event-card eco-card eco-list-item"
            @click="viewEventDetails(Number(event.id))"
          >
            <div class="event-image">
              <img 
                :src="event.preview ? `${IMAGE_BASE_URL}/${event.preview}` : getEventPlaceholder(event.id ?? 0)" 
                alt="Event image" 
                :style="{ 
                  'width': event.preview ? '100%' : 'auto'
                }"
              />
              <div class="event-status">
                <span :class="['status-badge', 'eco-status', getEventStatusClass(event)]">
                  {{ getEventStatus(event) }}
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
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
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
  alertController,
  toastController,
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
import EventListLoader from '../EventListLoader.vue';
import DateRangeFilter from '../../components/DateRangeFilter.vue';
import { IMAGE_BASE_URL } from '../../api/client';

const router = useRouter();
const eventsStore = useEventsStore();
const authStore = useAuthStore();

const allEvents = ref<EventResponseMediumDTO[]>([]);
const filteredEvents = ref<EventResponseMediumDTO[]>([]);
const selectedFilter = ref('all');
const isLoading = ref(false);
const page = ref(1);
const size = 15; // Количество отображаемых за раз
const searchText = ref('');
const dateRange = ref({ from: '', to: '' });
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const contentRef = ref();
const filtersVisible = ref(true);
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
  await loadAllEvents(true);
  event.target.complete();
};

const paginatedEvents = computed(() => {
  return filteredEvents.value.slice(0, page.value * size);
});

const hasMore = computed(() => {
  return paginatedEvents.value.length < filteredEvents.value.length;
});

const loadMoreEvents = (event: any) => {
  if (hasMore.value) {
    page.value++;
  }
  event.target.complete();
};

const filters = computed(() => [
  { value: 'all', label: 'Все', count: allEvents.value.length },
  { value: 'upcoming', label: 'Предстоящие', count: upcomingEventsCount.value },
  { value: 'active', label: 'Активные', count: activeEventsCount.value },
  { value: 'past', label: 'Завершённые', count: completedEventsCount.value },
]);

const setFilter = (value: string) => {
  selectedFilter.value = value;
  page.value = 1; // Сбрасываем пагинацию при смене фильтра
};

const selectSort = (value: string) => {
  sortBy.value = value;
  page.value = 1;
  filterAndSearchEvents();
};

const upcomingEventsCount = computed(() => {
  const now = new Date();
  return allEvents.value.filter((event: EventResponseMediumDTO) => {
    const eventDate = new Date(event.startTime);
    return eventDate > now;
  }).length;
});

const activeEventsCount = computed(() => {
  const now = new Date();
  return allEvents.value.filter((event: EventResponseMediumDTO) => {
    const eventDate = new Date(event.startTime);
    const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000); // +4 часа
    return eventDate <= now && eventEndTime > now;
  }).length;
});

const completedEventsCount = computed(() => {
  const now = new Date();
  return allEvents.value.filter((event: EventResponseMediumDTO) => {
    const eventDate = new Date(event.startTime);
    const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000); // +4 часа
    return eventEndTime <= now;
  }).length;
});

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

const loadAllEvents = async (forceRefresh = false) => {
  isLoading.value = true;
  page.value = 1; // Сброс пагинации
  try {
    const userId = authStore.user?.id;
    if (!userId) {
      allEvents.value = [];
      return;
    }
    
    // Загружаем ВСЕ события, игнорируя пагинацию
    await eventsStore.fetchEventsSearch({
      userId: userId,
      sortBy: 'id',
      sortOrder: 'DESC',
      size: 1000 // Устанавливаем большой размер страницы для получения всех
    });
    
    allEvents.value = eventsStore.getEvents;
    
  } catch (error) {
    console.error('Error loading all events:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки мероприятий',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const filterAndSearchEvents = () => {
  let filtered = [...allEvents.value];
  const now = new Date();
  
  // 1. Фильтрация по статусу
  switch (selectedFilter.value) {
    case 'upcoming':
      filtered = filtered.filter((event: EventResponseMediumDTO) => new Date(event.startTime) > now);
      break;
    case 'active':
      filtered = filtered.filter((event: EventResponseMediumDTO) => {
        const eventDate = new Date(event.startTime);
        const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
        return eventDate <= now && eventEndTime > now;
      });
      break;
    case 'past':
      filtered = filtered.filter((event: EventResponseMediumDTO) => {
        const eventDate = new Date(event.startTime);
        const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
        return eventEndTime <= now;
      });
      break;
  }

  // 2. Фильтрация по дате
  if (dateRange.value.from) {
    const fromDate = new Date(dateRange.value.from + 'T00:00:00');
    filtered = filtered.filter((event: EventResponseMediumDTO) => {
      const eventDate = new Date(event.startTime);
      return eventDate >= fromDate;
    });
  }
  
  if (dateRange.value.to) {
    const toDate = new Date(dateRange.value.to + 'T23:59:59');
    filtered = filtered.filter((event: EventResponseMediumDTO) => {
      const eventDate = new Date(event.startTime);
      return eventDate <= toDate;
    });
  }

  // 3. Поиск по текстовому полю
  if (searchText.value.trim()) {
    const searchLower = searchText.value.trim().toLowerCase();
    filtered = filtered.filter((event: EventResponseMediumDTO) =>
      event.title.toLowerCase().includes(searchLower) ||
      (event.description && event.description.toLowerCase().includes(searchLower))
    );
  }
  
  // 4. Сортировка
  const [sortField, sortOrder] = sortBy.value.split('_');
  
  filtered.sort((a: EventResponseMediumDTO, b: EventResponseMediumDTO) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'id':
        aValue = a.id ?? 0;
        bValue = b.id ?? 0;
        break;
      case 'startTime':
        aValue = new Date(a.startTime).getTime();
        bValue = new Date(b.startTime).getTime();
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        aValue = a.id ?? 0;
        bValue = b.id ?? 0;
    }
    
    if (sortOrder === 'DESC') {
      return typeof aValue === 'string' ? bValue.localeCompare(aValue) : bValue - aValue;
    } else {
      return typeof aValue === 'string' ? aValue.localeCompare(bValue) : aValue - bValue;
    }
  });
  
  filteredEvents.value = filtered;
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

const confirmDeleteEvent = async (event: EventResponseMediumDTO) => {
  if (!event.id) return;
  
  const alert = await alertController.create({
    header: 'Удалить мероприятие?',
    message: `Вы уверены, что хотите удалить «${event.title}»? Это действие необратимо.`,
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
            if (!event.id) return;
            await eventsStore.deleteEvent(event.id);
            // Обновляем allEvents и filteredEvents
            allEvents.value = allEvents.value.filter(e => e.id !== event.id);
            filterAndSearchEvents();
            
            const toast = await toastController.create({
              message: 'Мероприятие удалено',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
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

const clearSearch = () => {
  searchText.value = '';
  selectedFilter.value = 'all';
  dateRange.value = { from: '', to: '' };
};

const onDateRangeChange = () => {
  page.value = 1;
  filterAndSearchEvents();
};

watch(searchText, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    page.value = 1;
    filterAndSearchEvents();
  }, 400);
});

watch(selectedFilter, filterAndSearchEvents);

watch(allEvents, filterAndSearchEvents);

onMounted(() => {
  loadAllEvents();
});
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
}

.events-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  text-align: left;
  cursor: pointer;
}

.page-title:hover {
  color: var(--eco-primary);
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
  background: linear-gradient(135deg, var(--eco-warning) 0%, var(--eco-primary) 100%);
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

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--eco-shadow-lg);
  border-color: var(--eco-gray-300);
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

.action-btn:hover {
  --background: var(--eco-gray-100);
}

.edit-btn:hover {
  --color: var(--eco-primary);
}

.delete-btn:hover {
  --color: var(--eco-error);
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
</style> 
