<template>
  <ion-page class="events-list-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title">Мероприятия</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="events-content">
      <!-- Pull-to-refresh -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-text="Потяните для обновления"
          refreshing-text="Загружаем мероприятия..."
        ></ion-refresher-content>
      </ion-refresher>

      <!-- Поиск и фильтры -->
      <div class="search-filters-container">
        <!-- Поиск -->
        <div class="search-section">
          <div class="search-wrapper">
          <ion-searchbar 
            v-model="searchText" 
            placeholder="Поиск мероприятий..."
              class="custom-searchbar"
              :clear-input="true"
          ></ion-searchbar>
            <ion-button 
              fill="clear" 
              class="view-toggle-button"
              @click="toggleViewMode"
            >
              <ion-icon :icon="viewMode === 'grid' ? listOutline : gridOutline" />
            </ion-button>
            <ion-button 
              fill="clear" 
              class="sort-button"
              id="sortBtn" 
              @click="openSortPopover"
            >
            <ion-icon :icon="swapVerticalOutline" />
          </ion-button>
          </div>
        </div>

        <!-- Фильтры категорий -->
        <div class="filters-section">
          <div class="filters-scroll">
          <ion-chip
            v-for="filter in filters"
            :key="filter.value"
              :class="['filter-chip', { 'active': selectedFilter === filter.value }]"
            @click="setFilter(filter.value)"
          >
              <ion-icon v-if="selectedFilter === filter.value" :icon="filter.icon" />
              <ion-label>{{ filter.label }}</ion-label>
          </ion-chip>
          </div>
        </div>
      </div>

      <!-- Прелоадер -->
      <div v-if="isLoading" class="loader-container">
        <EventListLoader />
      </div>

      <!-- Список мероприятий -->
      <div v-else-if="filteredEvents.length > 0" :class="['events-container', `events-${viewMode}`]">
        <div 
          v-for="event in filteredEvents" 
          :key="event.id ?? Math.random()"
          class="event-card eco-card eco-list-item"
          @click="openEventDetails(Number(event.id))"
        >
          <div class="event-image">
            <img :src="getEventPlaceholder(event.id ?? 0)" alt="Event image" />
            <div class="event-status">
              <span :class="['status-badge', getEventStatus(event.startTime)]">
                {{ getEventStatusText(event.startTime) }}
              </span>
            </div>
          </div>

          <div class="event-content">
            
            
            <div class="event-header">
              <h3 class="event-title" lang="ru">{{ event.title }}</h3>
          <ion-button 
            fill="clear" 
                size="small"
                class="register-button"
            @click.stop="toggleEventRegistration(event)"
            :disabled="isRegistering"
          >
                <ion-icon :icon="addOutline" />
          </ion-button>
            </div>

            <!-- Статус для списочного режима -->
            <div v-if="viewMode === 'list'" class="event-status-text">
              <span :class="['status-badge-text', getEventStatus(event.startTime)]">
                {{ getEventStatusText(event.startTime) }}
              </span>
            </div>

            <div class="event-meta">
              <div class="meta-item">
                <ion-icon :icon="timeOutline" />
                <span>{{ formatDate(event.startTime) }}</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="locationOutline" />
                <span>{{ event.location || 'Место не указано' }}</span>
              </div>
              <!-- Участники будут добавлены когда появятся в API -->
              <!--<div class="meta-item">
                <ion-icon :icon="peopleOutline" />
                <span>Участники: -</span>
              </div>-->
            </div>

            <p class="event-description" v-if="event.description">
              {{ truncateText(event.description, viewMode === 'grid' ? 60 : 120) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <ion-icon :icon="calendarOutline" />
        </div>
        <h2 class="empty-title">Мероприятий не найдено</h2>
        <p class="empty-subtitle">
          {{ searchText ? 'Попробуйте изменить критерии поиска' : 'Пока нет доступных мероприятий' }}
        </p>
      </div>

      <!-- Popover для сортировки -->
      <ion-popover 
        :is-open="showSortPopover" 
        @didDismiss="showSortPopover = false" 
        trigger="sortBtn" 
        trigger-action="click"
      >
        <ion-content>
          <ion-list class="sort-options">
            <ion-item 
              v-for="option in sortOptions" 
              :key="option.value" 
              button 
              @click="selectSort(option.value)"
              class="sort-option-item"
            >
              <ion-icon :icon="option.icon" slot="start" />
              <ion-label :class="{ 'selected': sortBy === option.value }">
                {{ option.label }}
              </ion-label>
              <ion-icon 
                v-if="sortBy === option.value" 
                :icon="checkmarkOutline" 
                slot="end" 
                color="primary" 
              />
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  IonPopover,
  toastController
} from '@ionic/vue';
import {
  calendarOutline,
  addOutline,
  swapVerticalOutline,
  checkmarkOutline,
  timeOutline,
  locationOutline,
  peopleOutline,
  todayOutline,
  rocketOutline,
  calendarNumberOutline,
  checkmarkCircleOutline,
  listOutline,
  arrowUpOutline,
  arrowDownOutline,
  peopleCircleOutline,
  textOutline,
  gridOutline
} from 'ionicons/icons';
import { useEventsStore } from '../../stores';
import { useParticipantsStore } from '../../stores';
import { useAuthStore } from '../../stores';
import EventListLoader from '../EventListLoader.vue';
import type { EventResponseMediumDTO } from '../../types/api';
import { getEventPlaceholder } from '../../utils/eventImages';

const router = useRouter();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();
const authStore = useAuthStore();

const events = ref<EventResponseMediumDTO[]>([]);
const filteredEvents = ref<EventResponseMediumDTO[]>([]);
const searchText = ref('');
const selectedFilter = ref('all');
const isLoading = ref(false);
const isRegistering = ref(false);
const showSortPopover = ref(false);
const sortBy = ref('newest');
const viewMode = ref('grid');

const sortOptions = [
  { value: 'newest', label: 'Сначала новые', icon: arrowDownOutline },
  { value: 'oldest', label: 'Сначала старые', icon: arrowUpOutline },
  { value: 'participants', label: 'По участникам', icon: peopleCircleOutline },
  { value: 'title', label: 'По алфавиту', icon: textOutline }
];

const filters = [
  { value: 'all', label: 'Все', icon: listOutline },
  { value: 'today', label: 'Сегодня', icon: todayOutline },
  { value: 'upcoming', label: 'Скоро', icon: rocketOutline },
  { value: 'week', label: 'На неделе', icon: calendarNumberOutline },
  { value: 'finished', label: 'Завершённые', icon: checkmarkCircleOutline },
];

if (authStore.isAuthenticated) {
  filters.push({ value: 'my', label: 'Мои', icon: peopleOutline });
}

const page = ref(0);
const size = 50;
const hasMore = ref(true);

function setFilter(value: string) {
  selectedFilter.value = value;
  filterEvents();
}

function isEventThisWeek(dateStr: string) {
  const now = new Date();
  const eventDate = new Date(dateStr);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return eventDate >= startOfWeek && eventDate < endOfWeek;
}

function openSortPopover() {
  showSortPopover.value = true;
}

function selectSort(value: string) {
  sortBy.value = value;
  showSortPopover.value = false;
  loadEvents();
}

function getEventStatus(startTime: string) {
  const now = new Date();
  const eventDate = new Date(startTime);
  const diffInHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 0) return 'finished';
  if (diffInHours < 24) return 'soon';
  if (diffInHours < 72) return 'upcoming';
  return 'upcoming';
}

function getEventStatusText(startTime: string) {
  const status = getEventStatus(startTime);
  switch (status) {
    case 'finished': return 'Завершено';
    case 'soon': return 'Скоро';
    case 'upcoming': return 'Предстоит';
    default: return 'Предстоит';
  }
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

const loadEvents = async (reset = true) => {
  isLoading.value = true;
  try {
    if (reset) {
      page.value = 0;
      await eventsStore.fetchEventsSearch({
        keyword: searchText.value,
        page: page.value,
        size: size
      });
      events.value = eventsStore.getEvents;
      hasMore.value = events.value.length === size;
    } else {
      page.value += 1;
      await eventsStore.fetchEventsSearch({
        keyword: searchText.value,
        page: page.value,
        size: size
      });
      const newEvents = eventsStore.getEvents;
      if (newEvents.length > 0) {
        events.value = [...events.value, ...newEvents];
        hasMore.value = newEvents.length === size;
      } else {
        hasMore.value = false;
      }
    }
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

const handleRefresh = async (event: any) => {
  await loadEvents(true);
  event.target.complete();
};

const filterEvents = () => {
  let filtered = [...events.value];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (selectedFilter.value) {
    case 'today':
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      });
      break;
    case 'upcoming':
      filtered = filtered.filter(event => new Date(event.startTime) > now);
      break;
    case 'week':
      filtered = filtered.filter(event => isEventThisWeek(event.startTime));
      break;
    case 'finished':
      filtered = filtered.filter(event => new Date(event.startTime) < now);
      break;
    case 'my':
      // filtered = filtered.filter(event => event.isRegistered);
      break;
  }
  filteredEvents.value = filtered;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openEventDetails = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const toggleEventRegistration = async (event: EventResponseMediumDTO) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  isRegistering.value = true;
  try {
    const userId = authStore.user?.id;
    if (!userId) throw new Error('Нет userId');
    if (!event.id) return;
    
    // В списке кнопка "+" всегда регистрирует на событие
    await participantsStore.registerForEvent(userId, event.id);
    
    const toast = await toastController.create({
      message: 'Вы успешно записались на мероприятие!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    
    await loadEvents();
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

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};

watch(searchText, () => {
  loadEvents(true);
});

onMounted(() => {
  loadEvents(true);
});
</script>

<style scoped>
.events-list-page {
  --background: var(--eco-background-secondary);
}

.events-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
}

/* Поиск и фильтры */
.search-filters-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--eco-white);
  border-bottom: 1px solid var(--eco-gray-200);
  padding: var(--eco-space-4);
  margin-bottom: var(--eco-space-4);
}

.search-section {
  margin-bottom: var(--eco-space-4);
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
}

.custom-searchbar {
  flex: 1;
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

.view-toggle-button {
  --color: var(--eco-gray-600);
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  width: 48px;
  height: 48px;
}

.sort-button {
  --color: var(--eco-gray-600);
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  width: 48px;
  height: 48px;
}

.filters-section {
  overflow: hidden;
}

.filters-scroll {
  display: flex;
  overflow-x: auto;
  gap: var(--eco-space-2);
  padding: var(--eco-space-1) 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filters-scroll::-webkit-scrollbar {
  display: none;
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
}

.filter-chip.active {
  --background: var(--eco-primary);
  --color: white;
  transform: scale(1.05);
}

.filter-chip ion-icon {
  font-size: 16px;
  margin-right: var(--eco-space-1);
}

/* Лоадер */
.loader-container {
  padding: var(--eco-space-6);
}

/* Сетка мероприятий */
.events-container {
  padding: 0 var(--eco-space-4) var(--eco-space-4);
}

/* Плиточный режим (masonry layout) */
.events-grid {
  columns: 2;
  column-gap: var(--eco-space-4);
  column-fill: balance;
}

.events-grid .event-card {
  break-inside: avoid;
  margin-bottom: var(--eco-space-4);
  display: inline-block;
  width: 100%;
}

/* Списочный режим */
.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.events-list .event-card {
  display: flex;
  flex-direction: row;
  min-height: 120px;
}

.events-list .event-image {
  width: 168px;
  height: 168px;
  flex-shrink: 0;
  margin: var(--eco-space-3);
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
}

.events-list .event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--eco-space-3);
}

.events-list .event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--eco-space-2);
}

.events-list .event-title {
  font-size: var(--eco-font-size-base);
  line-height: var(--eco-line-height-tight);
  margin: 0;
  flex: 1;
  margin-right: var(--eco-space-2);
  max-width: 180px;
  word-break: break-word;
  white-space: normal;
  hyphens: auto;
  overflow-wrap: break-word;
}

.events-list .event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--eco-space-3);
  margin-bottom: var(--eco-space-2);
}

.events-list .meta-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-1);
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-600);
}

.events-list .event-description {
  font-size: var(--eco-font-size-xs);
  line-height: var(--eco-line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}



/* Общие стили карточек */
.event-card {
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--eco-transition-normal);
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--eco-shadow-lg);
  border-color: var(--eco-gray-300);
}

.event-image {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* Изображения в плиточном режиме - адаптируются под пропорции фото */
.events-grid .event-image {
  width: 100%;
  overflow: hidden;
  border-radius: var(--eco-radius-lg) var(--eco-radius-lg) 0 0;
}

.events-grid .event-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Общие стили для изображений в других режимах */
.events-list .event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-status {
  position: absolute;
  top: var(--eco-space-3);
  left: var(--eco-space-3);
}

.status-badge {
  padding: var(--eco-space-1) var(--eco-space-3);
  border-radius: var(--eco-radius-md);
  font-size: var(--eco-font-size-xs);
  font-weight: var(--eco-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  backdrop-filter: blur(8px);
}

.status-badge.upcoming {
  background: var(--eco-primary);
}

.status-badge.soon {
  background: var(--eco-warning);
}

.status-badge.finished {
  background: var(--eco-gray-500);
}

.event-content {
  padding: var(--eco-space-4);
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
  line-height: var(--eco-line-height-tight);
  flex: 1;
  margin-right: var(--eco-space-3);
  hyphens: auto;
  overflow-wrap: break-word;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-2);
  margin-bottom: var(--eco-space-3);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-600);
}

.meta-item ion-icon {
  font-size: 16px;
  color: var(--eco-gray-500);
  flex-shrink: 0;
}

.event-description {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-600);
  line-height: var(--eco-line-height-normal);
  margin: 0;
}

/* Общие стили для кнопки регистрации */
.register-button {
  width: 40px;
  height: 40px;
  min-width: 40px;
  max-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  --background: #F1F4FB;
  --color: #355ADD;
  border-radius: 12px;
  box-shadow: none;
  box-sizing: border-box;
  padding: 0;
  flex-shrink: 0;
}

.register-button ion-icon {
  font-size: 28px;
  color: #355ADD;
  width: 100%;
  height: 100%;
  font-weight: 600;
  stroke-width: 2.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eco-space-12) var(--eco-space-6);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: var(--eco-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-6);
}

.empty-icon ion-icon {
  font-size: 64px;
  color: var(--eco-gray-600);
  margin-bottom: var(--eco-space-4);
}

.empty-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-700);
  margin: 0 0 var(--eco-space-2) 0;
}

.empty-subtitle {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-500);
  margin: 0;
  max-width: 280px;
}

/* Popover сортировки */
.sort-options {
  background: transparent;
  padding: var(--eco-space-2);
}

.sort-option-item {
  --background: white;
  --border-radius: var(--eco-radius-md);
  --color: var(--eco-gray-700);
  margin-bottom: var(--eco-space-1);
  font-family: var(--eco-font-family);
}

.sort-option-item ion-label.selected {
  color: var(--eco-primary);
  font-weight: var(--eco-font-weight-medium);
}

/* Отзывчивость */
@media (max-width: 480px) {
  .search-filters-container {
    padding: var(--eco-space-3);
  }
  
  .events-container {
    padding: 0 var(--eco-space-3) var(--eco-space-3);
  }
  
  /* Плиточный режим на мобильных - 2 колонки с квадратными фото */
  .events-grid {
    columns: 2;
    column-gap: var(--eco-space-3);
  }
  
  .events-grid .event-card {
    margin-bottom: var(--eco-space-3);
  }
  
  /* Изображения уже квадратные через aspect-ratio */
  
  /* Списочный режим на мобильных */
  .events-list {
    gap: var(--eco-space-3);
  }
  
  .events-list .event-card {
    min-height: 100px;
  }
  
  .events-list .event-image {
    width: 120px;
    height: 120px;
    margin: var(--eco-space-2);
  }
  
  .event-content {
    padding: var(--eco-space-3);
  }
  
  .event-title {
    font-size: var(--eco-font-size-base);
  }
}

/* Скрываем статус на изображении в списочном режиме */
.events-list .event-status {
  display: none;
}

/* Статус в текстовой части для списочного режима */
.event-status-text {
  margin-bottom: var(--eco-space-2);
}

.status-badge-text {
  padding: var(--eco-space-1) var(--eco-space-2);
  border-radius: var(--eco-radius-sm);
  font-size: var(--eco-font-size-xs);
  font-weight: var(--eco-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  display: inline-block;
}

.status-badge-text.upcoming {
  background: var(--eco-primary);
}

.status-badge-text.soon {
  background: var(--eco-warning);
}

.status-badge-text.finished {
  background: var(--eco-gray-500);
}

.events-grid .event-title {
  max-width: 140px;
  word-break: break-word;
  white-space: normal;
  hyphens: auto;
  overflow-wrap: break-word;
}
</style> 
