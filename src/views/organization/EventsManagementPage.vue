<template>
  <ion-page class="events-management-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title">Мои мероприятия</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="create-button" @click="createEvent">
            <ion-icon :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content ref="contentRef" class="events-content" :scroll-events="true" @ionScroll="onScroll">
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
              <p>{{ events.length }} мероприятий создано</p>
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
          :show-sort-select="false"
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
      </div>

      <!-- Список мероприятий -->
      <div class="events-section">
        <!-- Лоадер -->
      <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>
          <p class="loading-text">Загружаем мероприятия...</p>
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="events.length === 0" class="empty-state">
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
            v-for="event in filteredEvents" 
            :key="event.id ?? Math.random()"
            class="event-card eco-card eco-list-item"
            @click="viewEventDetails(Number(event.id))"
          >
            <div class="event-image">
              <img :src="event.preview ? `${IMAGE_BASE_URL}/${event.preview}` : getEventPlaceholder(event.id ?? 0)" alt="Event image" />
              <div class="event-status">
                <span :class="['status-badge', 'eco-status', getEventStatusClass(event)]">
                  {{ getEventStatus(event) }}
                </span>
              </div>
            </div>
            
            <div class="event-content">
              <div class="event-header">
                <h3 class="event-title">{{ event.title }}</h3>
                <div class="event-actions" @click.stop>
                  <ion-button 
                    fill="clear" 
                    size="small"
                    class="action-btn edit-btn" 
                    @click="editEvent(Number(event.id))"
                  >
                    <ion-icon :icon="createOutline" />
                  </ion-button>
                  <ion-button 
                    fill="clear" 
                    size="small"
                    class="action-btn delete-btn" 
                    @click="confirmDeleteEvent(event)"
                  >
                    <ion-icon :icon="trashOutline" />
        </ion-button>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>

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
  IonSpinner,
  IonFab,
  IonFabButton,
  alertController,
  toastController
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
  layersOutline
} from 'ionicons/icons';
import { useEventsStore, useAuthStore } from '../../stores';
import type { EventResponseMediumDTO } from '../../types/api';
import { getEventPlaceholder } from '../../utils/eventImages';
import EcoSearchBar from '../../components/EcoSearchBar.vue';
import { IMAGE_BASE_URL } from '../../api/client';

const router = useRouter();
const eventsStore = useEventsStore();
const authStore = useAuthStore();

const events = ref<EventResponseMediumDTO[]>([]);
const filteredEvents = ref<EventResponseMediumDTO[]>([]);
const selectedFilter = ref('all');
const isLoading = ref(false);
const page = ref(0);
const size = 50;
const searchText = ref('');
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const contentRef = ref();
const filtersVisible = ref(true);
const lastScrollY = ref(0);

const filters = computed(() => [
  { value: 'all', label: 'Все', count: events.value.length },
  { value: 'upcoming', label: 'Предстоящие', count: upcomingEventsCount.value },
  { value: 'active', label: 'Активные', count: activeEventsCount.value },
  { value: 'past', label: 'Завершённые', count: completedEventsCount.value },
]);

const setFilter = (value: string) => {
  selectedFilter.value = value;
};

const upcomingEventsCount = computed(() => {
  const now = new Date();
  return events.value.filter((event: EventResponseMediumDTO) => {
    const eventDate = new Date(event.startTime);
    return eventDate > now;
  }).length;
});

const activeEventsCount = computed(() => {
  const now = new Date();
  return events.value.filter((event: EventResponseMediumDTO) => {
    const eventDate = new Date(event.startTime);
    const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000); // +4 часа
    return eventDate <= now && eventEndTime > now;
  }).length;
});

const completedEventsCount = computed(() => {
  const now = new Date();
  return events.value.filter((event: EventResponseMediumDTO) => {
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

const loadEvents = async (hotSearch = false) => {
  isLoading.value = true;
  try {
    await eventsStore.fetchEventsSearch({
      keyword: searchText.value,
      page: page.value,
      size: size
    });
    
    // Фильтруем только свои мероприятия
    const userId = authStore.user?.id;
    const allEvents = eventsStore.getEvents;
    events.value = allEvents.filter(event => event.owner?.id === userId);
    
    filterEvents();
  } catch (error) {
    console.error('Error loading events:', error);
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

const filterEvents = () => {
  let filtered = [...events.value];
  const now = new Date();
  
  switch (selectedFilter.value) {
    case 'upcoming':
      filtered = filtered.filter((event: EventResponseMediumDTO) => {
        const eventDate = new Date(event.startTime);
        return eventDate > now;
      });
      break;
    case 'active':
      filtered = filtered.filter((event: EventResponseMediumDTO) => {
        const eventDate = new Date(event.startTime);
        const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000); // +4 часа
        return eventDate <= now && eventEndTime > now;
      });
      break;
    case 'past':
      filtered = filtered.filter((event: EventResponseMediumDTO) => {
        const eventDate = new Date(event.startTime);
        const eventEndTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000); // +4 часа
        return eventEndTime <= now;
      });
      break;
  }
  
  // Сортировка: предстоящие по возрастанию даты, прошедшие по убыванию
  filtered.sort((a: EventResponseMediumDTO, b: EventResponseMediumDTO) => {
    const aDate = new Date(a.startTime);
    const bDate = new Date(b.startTime);
    
    if (selectedFilter.value === 'past') {
      return bDate.getTime() - aDate.getTime(); // убывание для прошедших
    } else {
      return aDate.getTime() - bDate.getTime(); // возрастание для предстоящих/активных
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
  // Заглушка, пока нет данных об участниках в EventResponseMediumDTO
  return '0';
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
            events.value = events.value.filter(e => e.id !== event.id);
            filterEvents();
            
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
};

watch(searchText, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    loadEvents(true);
  }, 400);
});

watch(selectedFilter, filterEvents);

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.events-management-page {
  --background: var(--eco-background-secondary);
}

.events-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
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
.search-filters-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--eco-white);
  border-bottom: 1px solid var(--eco-gray-200);
  padding: var(--eco-space-4);
  transform: translateY(0);
  transition: transform var(--eco-transition-normal), opacity var(--eco-transition-normal);
  opacity: 1;
  margin-bottom: var(--eco-space-4);
}

.search-filters-container.filters-hidden {
  transform: translateY(-120px);
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
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  width: 32px;
  height: 32px;
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
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--eco-space-3);
  }
  
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
