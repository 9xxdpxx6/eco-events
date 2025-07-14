<template>
  <ion-page class="events-list-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title" @click="scrollToTop">Мероприятия</ion-title>
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

      <!-- Поиск и фильтры -->
      <div :class="['search-filters-container', { 'filters-hidden': !filtersVisible }]">
        <!-- Поиск -->
        <EcoSearchBar
          v-model="searchText"
          placeholder="Поиск мероприятий..."
          :show-view-toggle="true"
          :view-toggle-icon="viewMode === 'grid' ? listOutline : gridOutline"
          :show-sort-select="true"
          :sort-options="sortOptions"
          :sort-value="sortBy"
          @toggle-view="toggleViewMode"
          @update:sort-value="selectSort"
        />

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
      <div v-else-if="filteredEvents.length > 0" :class="['events-container']">
        <!-- Masonry Grid View -->
        <masonry-wall
          v-if="viewMode === 'grid'"
          :items="filteredEvents"
          :column-width="180"
          :gap="12"
          class="events-grid"
        >
          <template #default="{ item: event }">
            <div
              :key="event.id"
              class="event-card eco-card"
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
                    v-if="!isUserRegisteredForEvent(event.id)"
                    fill="clear"
                    size="small"
                    class="register-button"
                    @click.stop="toggleEventRegistration(event)"
                    :disabled="isRegistering"
                  >
                    <ion-icon :icon="addOutline" />
                  </ion-button>
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
                </div>

                <p class="event-description" v-if="event.description">
                  {{ truncateText(event.description, 60) }}
                </p>
              </div>
            </div>
          </template>
        </masonry-wall>
        
        <!-- List View -->
        <div v-else class="events-list">
           <div 
            v-for="event in filteredEvents" 
            :key="event.id"
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
                  v-if="!isUserRegisteredForEvent(event.id)"
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
              <div class="event-status-text">
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
              </div>

              <p class="event-description" v-if="event.description">
                {{ truncateText(event.description, 120) }}
              </p>
            </div>
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

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
  IonChip,
  IonRefresher,
  IonRefresherContent,
  toastController,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue';
import {
  calendarOutline,
  addOutline,
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
  textOutline,
  gridOutline
} from 'ionicons/icons';
import { useEventsStore } from '../../stores';
import { useParticipantsStore } from '../../stores';
import { useAuthStore } from '../../stores';
import EventListLoader from '../EventListLoader.vue';
import EcoSelect from '../../components/EcoSelect.vue';
import EcoSearchBar from '../../components/EcoSearchBar.vue';
import MasonryWall from '@yeger/vue-masonry-wall';
import type { EventResponseMediumDTO, EventParticipantDTO, EventParticipantFilterDTO } from '../../types/api';
import { getEventPlaceholder } from '../../utils/eventImages';
import { participantsApi } from '../../api/participants';
import { eventsApi } from '../../api/events';

const router = useRouter();
const route = useRoute();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();
const authStore = useAuthStore();

const events = ref<EventResponseMediumDTO[]>([]);
const filteredEvents = ref<EventResponseMediumDTO[]>([]);
const userParticipations = ref<Set<number>>(new Set());
const searchText = ref('');
const selectedFilter = ref('all');
const isLoading = ref(false);
const isLoadingMore = ref(false);
const isRegistering = ref(false);
const sortBy = ref('startTime_DESC');
const viewMode = ref('grid');
const contentRef = ref();
const filtersVisible = ref(true);
const lastScrollY = ref(0);
let searchTimeout: NodeJS.Timeout | null = null;
const isInitialized = ref(false);

const sortOptions = [
  { value: 'startTime_DESC', label: 'Сначала новые', icon: arrowDownOutline },
  { value: 'startTime_ASC', label: 'Сначала старые', icon: arrowUpOutline },
  { value: 'title_ASC', label: 'По алфавиту', icon: textOutline }
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
  if (isInitialized.value) {
    loadEvents(true); // Перезагружаем данные с сервера с новыми фильтрами
  }
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

function selectSort(value: string) {
  sortBy.value = value;
  if (isInitialized.value) {
    loadEvents(true); // Перезагружаем данные с сервера с новой сортировкой
  }
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

function formatDateForApi(date: Date) {
  // API ожидает формат YYYY-MM-DDTHH:MM:SS без миллисекунд и Z
  return date.toISOString().slice(0, 19);
}

const loadEvents = async (reset = true) => {
  if (reset) {
    isLoading.value = true;
    page.value = 0;
  } else {
    page.value += 1; // Увеличиваем страницу ДО создания filterParams
  }
  
  try {
    const [sortField, sortOrder] = sortBy.value.split('_');
    
    // Подготавливаем параметры фильтрации для сервера
    const filterParams: any = {
      page: page.value,
      size: size,
      sortBy: sortField,
      sortOrder: sortOrder
    };

    if (searchText.value) {
      filterParams.keyword = searchText.value;
    }

    // Добавляем фильтры по датам для сервера
    const now = new Date();
    now.setUTCMilliseconds(0);

    switch (selectedFilter.value) {
      case 'today':
        const today = new Date(now);
        today.setUTCHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

        filterParams.startDateFrom = formatDateForApi(today);
        filterParams.startDateTo = formatDateForApi(new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1));
        break;

      case 'upcoming':
        filterParams.startDateFrom = formatDateForApi(new Date());
        break;

      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setUTCHours(0, 0, 0, 0);
        // Находим понедельник текущей недели (1 = понедельник, 0 = воскресенье)
        const dayOfWeek = startOfWeek.getUTCDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // если воскресенье, то 6 дней назад
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysToMonday);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 7);

        filterParams.startDateFrom = formatDateForApi(startOfWeek);
        filterParams.startDateTo = formatDateForApi(new Date(endOfWeek.getTime() - 1));
        break;
      case 'finished':
        filterParams.startDateTo = formatDateForApi(now);
        filterParams.sortBy = 'startTime';
        filterParams.sortOrder = 'DESC';
        break;
      case 'my':
        // Для фильтра "Мои мероприятия" получаем только мероприятия с VALID статусом
        if (authStore.isAuthenticated && authStore.user?.id) {
          
          // Получаем участия пользователя через API участников с фильтром membershipStatus=VALID
          const participantFilter: EventParticipantFilterDTO = {
            userId: authStore.user.id,
            status: 'CONFIRMED',
            membershipStatus: 'VALID',
            page: page.value,
            size: size
          };
          
          try {
            const result = await participantsApi.search(participantFilter) as { content: any[]; last: boolean };
            const validParticipants = result?.content ?? [];
            
            if (validParticipants.length === 0) {
              if (reset) {
                events.value = [];
                filteredEvents.value = [];
              }
              hasMore.value = !result?.last;
              return;
            }
            
            // Получаем ID мероприятий
            const eventIds = validParticipants.map((p: EventParticipantDTO) => p.event.id);
            
            // Загружаем полные данные мероприятий
            const eventPromises = eventIds.map(async (eventId: number) => {
              try {
                return await eventsApi.getById(eventId);
              } catch (error) {
                console.error('Ошибка загрузки мероприятия', eventId, error);
                return null;
              }
            });
             
            const loadedEvents = (await Promise.all(eventPromises)).filter((event: EventResponseMediumDTO | null) => event !== null) as EventResponseMediumDTO[];
            
            if (reset) {
              events.value = loadedEvents;
            } else {
              events.value = [...events.value, ...loadedEvents];
            }
            
            hasMore.value = !result.last;
            
            // Применяем поиск по тексту если есть
            if (searchText.value) {
              const searchLower = searchText.value.toLowerCase();
              events.value = events.value.filter(event => 
                event.title.toLowerCase().includes(searchLower) ||
                event.description.toLowerCase().includes(searchLower)
              );
            }
            
            // Применяем сортировку на клиенте для фильтра "Мои мероприятия"
            applyClientSorting();
            return; // Выходим из функции, чтобы не выполнять обычный запрос
          } catch (error) {
            console.error('Ошибка загрузки моих мероприятий:', error);
            if (reset) {
              events.value = [];
              filteredEvents.value = [];
            }
            hasMore.value = false;
            return;
          }
        }
        break;
    }

    if (reset) {
      await eventsStore.fetchEventsSearch(filterParams);
      events.value = eventsStore.getEvents;
      hasMore.value = events.value.length === size;
    } else {
      await eventsStore.fetchEventsSearch(filterParams);
      const newEvents = eventsStore.getEvents;
      if (newEvents.length > 0) {
        // Фильтруем новые события, чтобы избежать дублирования
        const existingIds = new Set(events.value.map(e => e.id));
        const uniqueNewEvents = newEvents.filter(event => !existingIds.has(event.id));
        
        if (uniqueNewEvents.length > 0) {
          events.value = [...events.value, ...uniqueNewEvents];
        }
        hasMore.value = newEvents.length === size;
      } else {
        hasMore.value = false;
      }
    }
    
    // Сортировка теперь происходит на сервере
    filteredEvents.value = events.value;
  } catch (error) {
    console.error('Error loading events:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки мероприятий',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    if (reset) {
      isLoading.value = false;
    }
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
  isLoadingMore.value = true;
  try {
    await Promise.all([
      loadEvents(false),
      new Promise(resolve => setTimeout(resolve, 300))
    ]);
  } finally {
    isLoadingMore.value = false;
  }
  event.target.complete();
};

const applyClientSorting = () => {
  const sorted = [...events.value];
  
  // Применяем сортировку на клиенте (только для фильтра "Мои мероприятия")
  const [sortField, sortOrder] = sortBy.value.split('_');
  
  switch (sortField) {
    case 'startTime': // Для API это 'startDate', но в объекте события это 'startTime'
      if (sortOrder === 'DESC') {
        sorted.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      } else {
        sorted.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      }
      break;
    case 'title':
      if (sortOrder === 'DESC') {
        sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
      } else {
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
      }
      break;
  }
  
  filteredEvents.value = sorted;
};

const filterEvents = () => {
  // Фильтрация и сортировка теперь происходят на сервере
  filteredEvents.value = events.value;
};

const isUserRegisteredForEvent = (eventId: number | undefined) => {
  if (!eventId || !authStore.isAuthenticated) return false;
  return userParticipations.value.has(eventId);
};

const loadUserParticipations = async () => {
  if (!authStore.isAuthenticated || !authStore.user?.id) return;
  
  try {
    const allValidEventIds = new Set<number>();
    let page = 0;
    const size = 100; // Увеличим размер страницы для ускорения
    let hasMorePages = true;

    while (hasMorePages) {
      const participantFilter: EventParticipantFilterDTO = {
        userId: authStore.user.id,
        status: 'CONFIRMED',
        membershipStatus: 'VALID',
        page: page,
        size: size
      };
      
      const result = await participantsApi.search(participantFilter) as { content: EventParticipantDTO[], last: boolean };
      const participants = result?.content ?? [];
      
      participants.forEach((p) => {
        if (p.event?.id) {
          allValidEventIds.add(p.event.id);
        }
      });

      hasMorePages = !result.last;
      if (hasMorePages) {
        page++;
      }
    }

    userParticipations.value = allValidEventIds;
  } catch (error) {
    console.error('Error loading user participations:', error);
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const currentYear = new Date().getFullYear();
  const eventYear = date.getFullYear();
  
  if (eventYear === currentYear) {
    // Если год совпадает с текущим, показываем дату и время
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    // Если год не совпадает, показываем дату и год
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
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
    
    // Обновляем состояние участий, запрашивая свежие данные с сервера
    await loadUserParticipations();
    
    const toast = await toastController.create({
      message: 'Вы успешно записались на мероприятие!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
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

const scrollToTop = async () => {
  if (contentRef.value) {
    await contentRef.value.$el.scrollToTop(300);
  }
};

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

watch(searchText, () => {
  // Не выполняем поиск до полной инициализации компонента
  if (!isInitialized.value) return;
  
  // Очищаем предыдущий таймер
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Устанавливаем новый таймер с задержкой 500мс
  searchTimeout = setTimeout(() => {
    loadEvents(true);
  }, 500);
});

// Обновляем участия при каждом переходе на эту страницу
watch(
  () => route.fullPath,
  async (newPath) => {
    if (newPath === '/tabs/events-list' && isInitialized.value) {
      await loadUserParticipations();
    }
  }
);

onMounted(async () => {
  await loadEvents(true);
  await loadUserParticipations();
  // Отмечаем что компонент инициализирован, теперь watch может работать
  isInitialized.value = true;
});

onUnmounted(() => {
  // Очищаем таймер при размонтировании компонента
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<style scoped>
.events-list-page {
  --background: var(--eco-background-secondary);
}

/* Добавляем белую тень к header для скрытия полоски при скролле */
.events-list-page ion-header {
  box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  --box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  position: relative;
  z-index: 1000;
}

.events-list-page ion-toolbar {
  box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  --box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.events-content {
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

.page-title:hover {
  color: var(--eco-primary);
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
  box-shadow: none !important;
  transform: translateY(0);
  transition: transform var(--eco-transition-normal), opacity var(--eco-transition-normal);
  opacity: 1;
}

.search-filters-container.filters-hidden {
  transform: translateY(-120px);
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
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
  width: 100%; /* Для корректной работы в Masonry */
  display: inline-block; /* Для корректной работы в Masonry */
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
  box-shadow: none !important;
  --box-shadow: none !important;
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



/* Отзывчивость */
@media (max-width: 480px) {
  .search-filters-container {
    padding: var(--eco-space-3);
  }
  
  .events-container {
    padding: 0 var(--eco-space-3) var(--eco-space-3);
  }
  
  /* Плиточный режим на мобильных - 2 колонки с квадратными фото */
  
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
