<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Мероприятия</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Pull-to-refresh -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-text="Потяните для обновления"
          refreshing-text="Загружаем мероприятия..."
        ></ion-refresher-content>
      </ion-refresher>

      <!-- Поиск и фильтры -->
      <div class="sticky-search-filters">
        <div class="search-sort-row">
          <ion-searchbar 
            v-model="searchText" 
            placeholder="Поиск мероприятий..."
          ></ion-searchbar>
          <ion-button fill="clear" id="sortBtn" @click="openSortPopover">
            <ion-icon :icon="swapVerticalOutline" />
          </ion-button>
          <ion-popover :is-open="showSortPopover" @didDismiss="showSortPopover = false" trigger="sortBtn" trigger-action="click">
            <ion-list>
              <ion-item v-for="option in sortOptions" :key="option.value" button @click="selectSort(option.value)">
                <ion-label :color="sortBy === option.value ? 'primary' : ''">{{ option.label }}</ion-label>
                <ion-icon v-if="sortBy === option.value" :icon="checkmarkOutline" slot="end" color="primary" />
              </ion-item>
            </ion-list>
          </ion-popover>
        </div>
        <div class="categories-scroll">
          <ion-chip
            v-for="filter in filters"
            :key="filter.value"
            :outline="selectedFilter !== filter.value"
            :color="selectedFilter === filter.value ? 'primary' : 'medium'"
            @click="setFilter(filter.value)"
            class="category-chip"
          >
            {{ filter.label }}
          </ion-chip>
        </div>
      </div>

      <!-- Прелоадер -->
      <EventListLoader v-if="isLoading" />
      <!-- Список мероприятий -->
      <ion-list v-else-if="filteredEvents.length > 0">
        <ion-item 
          v-for="event in filteredEvents" 
          :key="event.id ?? Math.random()"
          button
          @click="openEventDetails(Number(event.id))"
        >
          <ion-thumbnail slot="start">
            <img :src="'/assets/default-event.jpg'" />
          </ion-thumbnail>
          <ion-label>
            <h2>{{ event.title }}</h2>
            <p>{{ formatDate(event.startTime) }}</p>
            <p>{{ event.location }}</p>
          </ion-label>
          <ion-button 
            slot="end" 
            fill="clear" 
            color="primary"
            @click.stop="toggleEventRegistration(event)"
            :disabled="isRegistering"
          >
            <ion-icon :icon="addCircleOutline" :color="'primary'" />
          </ion-button>
        </ion-item>
      </ion-list>
      <!-- Пустое состояние -->
      <div v-else class="empty-state">
        <ion-icon :icon="calendarOutline" size="large" color="medium"></ion-icon>
        <h2>Мероприятий не найдено</h2>
        <p>Попробуйте изменить критерии поиска</p>
      </div>
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
  IonThumbnail,
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
  checkmarkCircle,
  addCircleOutline,
  swapVerticalOutline,
  checkmarkOutline
} from 'ionicons/icons';
import { useEventsStore } from '../stores';
import { useParticipantsStore } from '../stores';
import { useAuthStore } from '../stores';
import EventListLoader from './EventListLoader.vue';
import type { EventDTO } from '../types/api';

const router = useRouter();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();
const authStore = useAuthStore();

const events = ref<EventDTO[]>([]);
const filteredEvents = ref<EventDTO[]>([]);
const searchText = ref('');
const selectedFilter = ref('all');
const isLoading = ref(false);
const isRegistering = ref(false);
const showSortPopover = ref(false);
const sortBy = ref('newest');
const sortOptions = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'participants', label: 'По количеству участников' },
  { value: 'title', label: 'По алфавиту' }
];

const filters = [
  { value: 'all', label: 'Все' },
  { value: 'today', label: 'Сегодня' },
  { value: 'upcoming', label: 'Скоро' },
  { value: 'week', label: 'На неделе' },
  { value: 'finished', label: 'Завершённые' },
];
if (authStore.isAuthenticated) {
  filters.push({ value: 'my', label: 'Мои' });
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

const loadEvents = async (reset = true) => {
  isLoading.value = true;
  try {
    if (reset) {
      page.value = 0;
      await eventsStore.fetchEventsSearch(searchText.value, page.value, size);
      events.value = eventsStore.getEvents;
      hasMore.value = events.value.length === size;
    } else {
      page.value += 1;
      await eventsStore.fetchEventsSearch(searchText.value, page.value, size);
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

const handleInfiniteScroll = async (event: any) => {
  if (!hasMore.value) {
    event.target.complete();
    return;
  }
  await loadEvents(false);
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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openEventDetails = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const toggleEventRegistration = async (event: EventDTO) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  isRegistering.value = true;
  try {
    const userId = authStore.user?.id;
    if (!userId) throw new Error('Нет userId');
    if (!event.id) return;
    await participantsStore.deleteParticipant(userId, event.id);
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

watch(searchText, () => {
  loadEvents(true);
});

onMounted(() => {
  loadEvents(true);
});
</script>

<style scoped>
.sticky-search-filters {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--ion-background-color);
  padding: 8px;
  border-bottom: 1px solid var(--ion-color-light);
}

.search-sort-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.categories-scroll {
  display: flex;
  overflow-x: auto;
  padding: 8px 0;
  gap: 8px;
  -webkit-overflow-scrolling: touch;
}

.category-chip {
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 500;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}
</style> 