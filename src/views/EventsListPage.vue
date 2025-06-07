<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Мероприятия</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Pull-to-refresh (стандартная анимация сверху) -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-text="Потяните для обновления"
          refreshing-text="Загружаем мероприятия..."
        ></ion-refresher-content>
      </ion-refresher>

      <!-- Sticky поиск и фильтры -->
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

      <!-- Прелоадер только под фильтрами -->
      <EventListLoader v-if="isLoading" />
      <!-- Список мероприятий -->
      <ion-list v-else-if="filteredEvents.length > 0">
        <ion-item 
          v-for="event in filteredEvents" 
          :key="event.id"
          button
          @click="openEventDetails(event.id)"
        >
          <ion-thumbnail slot="start">
            <img :src="event.image || '/assets/default-event.jpg'" />
          </ion-thumbnail>
          <ion-label>
            <h2>{{ event.title }}</h2>
            <p>{{ formatDate(event.date) }}</p>
            <p>{{ event.location }}</p>
            <ion-chip color="primary" v-if="event.organization">
              {{ event.organization }}
            </ion-chip>
          </ion-label>
          <ion-button 
            slot="end" 
            fill="clear" 
            color="primary"
            @click.stop="toggleEventRegistration(event)"
            :disabled="isRegistering"
          >
            <ion-icon 
              :icon="event.isRegistered ? checkmarkCircle : addCircleOutline" 
              :color="event.isRegistered ? 'success' : 'primary'"
            />
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
  IonButtons,
  toastController
} from '@ionic/vue';
import {
  calendarOutline,
  checkmarkCircle,
  addCircleOutline,
  mapOutline,
  personOutline,
  businessOutline,
  logOutOutline,
  swapVerticalOutline,
  checkmarkOutline
} from 'ionicons/icons';
import { ApiService } from '../services/apiService';
import { useAuthStore } from '../stores/auth';
import EventListLoader from './EventListLoader.vue';

const router = useRouter();
const apiService = ApiService.getInstance();
const authStore = useAuthStore();

const events = ref<any[]>([]);
const filteredEvents = ref<any[]>([]);
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

const loadEvents = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    params.set('sort', sortBy.value);
    if (searchText.value) params.set('q', searchText.value);
    const data = await apiService.getEventsWithParams(params);
    events.value = Array.isArray(data) ? data : [];
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

const handleRefresh = async (event: CustomEvent) => {
  try {
    const data = await apiService.getEvents();
    events.value = Array.isArray(data) ? data : [];
    filterEvents();
  } catch (error) {
    console.error('Error refreshing events:', error);
    const toast = await toastController.create({
      message: 'Ошибка обновления',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    event.detail.complete();
  }
};

const filterEvents = () => {
  let filtered = [...events.value];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (selectedFilter.value) {
    case 'today':
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      });
      break;
    case 'upcoming':
      filtered = filtered.filter(event => new Date(event.date) > now);
      break;
    case 'week':
      filtered = filtered.filter(event => isEventThisWeek(event.date));
      break;
    case 'finished':
      filtered = filtered.filter(event => new Date(event.date) < now);
      break;
    case 'my':
      filtered = filtered.filter(event => event.isRegistered);
      break;
  }
  filtered.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  filteredEvents.value = filtered;
};

const openEventDetails = (eventId: number) => {
  router.push(`/event-details/${eventId}`);
};

const toggleEventRegistration = async (event: any) => {
  if (isRegistering.value) return;
  
  isRegistering.value = true;
  
  try {
    if (event.isRegistered) {
      // Отменяем участие
      try {
        await apiService.leaveEvent(event.id);
        event.isRegistered = false;
        const toast = await toastController.create({
          message: 'Вы отменили участие в мероприятии',
          duration: 2000,
          color: 'warning'
        });
        await toast.present();
      } catch (error) {
        console.error('Error leaving event:', error);
        const toast = await toastController.create({
          message: 'Пока функция отмены участия недоступна',
          duration: 2000,
          color: 'warning'
        });
        await toast.present();
      }
    } else {
      // Регистрируемся на мероприятие
      try {
        await apiService.joinEvent(event.id);
        event.isRegistered = true;
        const toast = await toastController.create({
          message: 'Вы зарегистрированы на мероприятие!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      } catch (error) {
        console.error('Error joining event:', error);
        // Пока API не готово, просто меняем состояние локально
        event.isRegistered = true;
        const toast = await toastController.create({
          message: 'Вы зарегистрированы на мероприятие!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      }
    }
  } finally {
    isRegistering.value = false;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'Дата не указана';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Неверная дата';
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

let searchDebounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchText, (val, oldVal) => {
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadEvents();
  }, 400);
});

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--ion-color-medium);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state h2 {
  margin: 16px 0 8px 0;
}

.empty-state p {
  margin: 0;
}

.categories-scroll {
  display: flex;
  overflow-x: auto;
  padding: 8px 8px 8px 8px;
  gap: 8px;
  scrollbar-width: none;
}
.categories-scroll::-webkit-scrollbar {
  display: none;
}
.category-chip {
  min-width: 110px;
  justify-content: center;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
}

.navigation-buttons {
  display: none;
}

.search-sort-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 8px 8px 8px;
}
.search-sort-row ion-searchbar {
  flex: 1;
}

.loading-under-filters {
  margin: 24px 0 0 0;
  justify-content: flex-start;
}

.sticky-search-filters {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--ion-background-color, #18191a);
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.01);
}
</style> 