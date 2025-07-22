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
        
        <!-- Фильтр по дате -->
        <DateRangeFilter
          v-model="dateRange"
          title="Фильтр по дате события"
          from-placeholder="С: дата события"
          to-placeholder="По: дата события"
          @change="onDateRangeChange"
        />
      </div>

      <!-- Прелоадер -->
      <div v-if="isLoading" class="loader-container">
        <EventListLoader />
      </div>

      <!-- Список мероприятий -->
      <div v-else-if="displayedEvents.length > 0" :class="['events-container']">
        <!-- Grid View (простая плитка) -->
        <div v-if="viewMode === 'grid'" class="events-grid">
          <div
            v-for="event in displayedEvents"
            :key="event.id"
            :id="generateEventId(event)"
            class="event-card eco-card"
            @click="openEventDetails(Number(event.id))"
          >
            <div class="event-image">
              <template v-if="!brokenImages[event.id]">
                <img 
                  :src="event.preview
                    ? (event.preview.startsWith('uploads/')
                        ? API_URL + '/' + event.preview
                        : IMAGE_BASE_URL + '/' + event.preview)
                    : getEventPlaceholder(event.id ?? 0)"
                  :alt="event.title"
                  class="lazy-img"
                  loading="lazy"
                  @error="handleImgError(event.id)"
                />
              </template>
              <template v-else>
                <BrokenImagePlaceholder class="broken-image-full" :style="{height: '100%'}" />
              </template>
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
            </div>
          </div>
        </div>
        
        <!-- List View -->
        <div v-else class="events-list">
           <div 
            v-for="event in displayedEvents" 
            :key="event.id"
            :id="generateEventId(event)"
            class="event-card eco-card eco-list-item"
            @click="openEventDetails(Number(event.id))"
          >
            <div class="event-image">
              <template v-if="!brokenImages[event.id]">
                <img 
                  :src="event.preview
                    ? (event.preview.startsWith('uploads/')
                        ? API_URL + '/' + event.preview
                        : IMAGE_BASE_URL + '/' + event.preview)
                    : getEventPlaceholder(event.id ?? 0)"
                  :alt="event.title"
                  class="lazy-img"
                  loading="lazy"
                  @error="handleImgError(event.id)"
                />
              </template>
              <template v-else>
                <BrokenImagePlaceholder class="broken-image-full" :style="{height: '100%'}" />
              </template>
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
        threshold="300px"
      >
        <ion-infinite-scroll-content
          loading-spinner="crescent"
          loading-text="Загрузка..."
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { onIonViewWillLeave } from '@ionic/vue';
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
import EventListLoader from '../../components/EventListLoader.vue';

import EcoSearchBar from '../../components/EcoSearchBar.vue';
import DateRangeFilter from '../../components/DateRangeFilter.vue';
import type { EventResponseMediumDTO, EventParticipantDTO, EventParticipantFilterDTO } from '../../types/api';
import { getEventPlaceholder } from '../../utils/eventImages';
import { participantsApi } from '../../api/participants';
import { eventsApi } from '../../api/events';
import { IMAGE_BASE_URL } from '../../api/client';
import { API_URL } from '../../api/client';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { ref as vueRef } from 'vue';
import BrokenImagePlaceholder from '../../components/BrokenImagePlaceholder.vue';
import { clearFileUrlCache } from '@/utils/imageUploaderCache';

const router = useRouter();
const route = useRoute();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();
const authStore = useAuthStore();

const events = ref<EventResponseMediumDTO[]>([]);
const filteredEvents = ref<EventResponseMediumDTO[]>([]);
const displayedEvents = ref<EventResponseMediumDTO[]>([]);
const MAX_DISPLAYED_EVENTS = 300; // Увеличиваем лимит отображаемых элементов
const userParticipations = ref<Set<number>>(new Set());
const searchText = ref('');
const dateRange = ref({ from: '', to: '' });
const selectedFilter = ref('all');
const isLoading = ref(false);
const isLoadingMore = ref(false);
const isRegistering = ref(false);
const sortBy = ref('id_DESC');
const viewMode = ref('grid');
const contentRef = ref();
const filtersVisible = ref(true);
const lastScrollY = ref(0);
let searchTimeout: NodeJS.Timeout | null = null;
const isInitialized = ref(false);
// Добавляем переменные для сохранения позиции скролла
const savedScrollPosition = ref(0);
const isLoadingMoreData = ref(false);
const imageObserver = ref<IntersectionObserver | null>(null);
const infiniteScrollDebounce = ref<NodeJS.Timeout | null>(null);
// Для отслеживания битых картинок в списке
const brokenImages = vueRef<{ [key: number]: boolean }>({});
function handleImgError(idx: number) {
  brokenImages.value[idx] = true;
}

const sortOptions = [
  { value: 'id_DESC', label: 'По умолчанию', icon: listOutline },
  { value: 'startTime_DESC', label: 'По убыванию даты', icon: arrowDownOutline },
  { value: 'startTime_ASC', label: 'По возрастанию даты', icon: arrowUpOutline },
  { value: 'title_ASC', label: 'По названию А-Я', icon: textOutline },
  { value: 'title_DESC', label: 'По названию Я-А', icon: textOutline }
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
const size = 100; // Оптимизируем размер страницы
const hasMore = ref(true);

function setFilter(value: string) {
  selectedFilter.value = value;
  if (isInitialized.value) {
    loadEvents(true); // Перезагружаем данные с сервера с новыми фильтрами
  }
}

const onDateRangeChange = () => {
  if (isInitialized.value) {
    loadEvents(true);
  }
};

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

const loadEvents = async (reset = true, isRefresh = false) => {
  if (reset) {
    isLoading.value = true;
    page.value = 0;
    // При сбросе (не infinite scroll) очищаем флаг загрузки дополнительных данных
    isLoadingMoreData.value = false;
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

    // Фильтр по дате события (приоритет над фильтрами категорий)
    if (dateRange.value.from || dateRange.value.to) {
      if (dateRange.value.from) {
        filterParams.startDateFrom = dateRange.value.from + 'T00:00:00';
      }
      if (dateRange.value.to) {
        filterParams.startDateTo = dateRange.value.to + 'T23:59:59';
      }
    } else {
      // Применяем фильтры категорий только если нет фильтра по дате
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
      }
    }
    
    // Обработка фильтра "Мои мероприятия" (не зависит от фильтров по дате)
    if (selectedFilter.value === 'my') {
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
    }

    if (reset) {
      await eventsStore.fetchEventsSearch(filterParams);
      events.value = eventsStore.getEvents;
      hasMore.value = events.value.length === size;
      clearFileUrlCache();
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
    updateDisplayedEvents(isRefresh);
  } catch (error) {
    console.error('Error loading events:', error);
    await showErrorToast('Ошибка загрузки мероприятий', 3000);
  } finally {
    if (reset) {
      isLoading.value = false;
    }
  }
};

const handleRefresh = async (event: any) => {
  await loadEvents(true, true); // Передаем флаг isRefresh
  event.target.complete();
};

const loadMoreEvents = async (event: any) => {
  if (isLoading.value || isLoadingMore.value || !hasMore.value) {
    event.target.complete();
    return;
  }
  
  // Убираем дополнительную проверку - позволяем infinite scroll работать по threshold
  // Infinite scroll сам определит когда срабатывать на основе threshold="300px"
  
  // Дебаунс для предотвращения множественных запросов
  if (infiniteScrollDebounce.value) {
    clearTimeout(infiniteScrollDebounce.value);
  }
  
  infiniteScrollDebounce.value = setTimeout(async () => {
    isLoadingMore.value = true;
    isLoadingMoreData.value = true;
    
    // Сохраняем текущую позицию скролла перед загрузкой
    if (contentRef.value) {
      contentRef.value.$el.getScrollElement().then((el: any) => {
        savedScrollPosition.value = el.scrollTop;
      });
    }
    
    try {
      await loadEvents(false);
    } finally {
      isLoadingMore.value = false;
    }
    event.target.complete();
  }, 100); // Уменьшаем дебаунс до минимума
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
  updateDisplayedEvents(false); // Не refresh для сортировки
};

const filterEvents = () => {
  // Фильтрация и сортировка теперь происходят на сервере
  filteredEvents.value = events.value;
  updateDisplayedEvents();
};

const generateEventId = (event: EventResponseMediumDTO) => {
  const date = new Date(event.startTime);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `event_${dateStr}_${event.id}`;
};

const getLastVisibleEventId = (): string | null => {
  if (displayedEvents.value.length === 0) return null;
  
  // Находим последний видимый элемент
  const lastEvent = displayedEvents.value[displayedEvents.value.length - 1];
  return generateEventId(lastEvent);
};

const restoreScrollPosition = (targetEventId: string | null) => {
  if (!targetEventId) return;
  
  // Ждем завершения рендеринга
  nextTick(() => {
    setTimeout(() => {
      const targetElement = document.getElementById(targetEventId);
      if (targetElement && contentRef.value) {
        contentRef.value.$el.getScrollElement().then((scrollElement: any) => {
          const elementRect = targetElement.getBoundingClientRect();
          const containerRect = scrollElement.getBoundingClientRect();
          const scrollTop = scrollElement.scrollTop;
          
          // Позиционируем элемент внизу видимой области без анимации
          const targetScrollTop = scrollTop + elementRect.top - containerRect.height + elementRect.height + 20;
          
          scrollElement.scrollTop = targetScrollTop;
        });
      }
    }, 50); // Уменьшаем задержку для более быстрого отклика
  });
};

const updateDisplayedEvents = (isRefresh = false) => {
  const previousLastVisibleId = getLastVisibleEventId();
  
  // Ограничиваем количество отображаемых элементов для производительности
  // Обрезаем только если элементов больше лимита + буфер (чтобы не обрезать слишком часто)
  if (filteredEvents.value.length > MAX_DISPLAYED_EVENTS + 50) {
    displayedEvents.value = filteredEvents.value.slice(-MAX_DISPLAYED_EVENTS);
  } else {
    displayedEvents.value = [...filteredEvents.value];
  }
  
  // Инициализируем ленивую загрузку для новых изображений
  nextTick(() => {
    initLazyLoading();
    // Восстанавливаем позицию только если это не pull-to-refresh
    if (!isRefresh) {
      restoreScrollPosition(previousLastVisibleId);
    }
  });
};

const initLazyLoading = () => {
  // Уничтожаем предыдущий observer
  if (imageObserver.value) {
    imageObserver.value.disconnect();
  }
  
  // Создаем новый Intersection Observer
  imageObserver.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const dataSrc = img.getAttribute('data-src');
        if (dataSrc && img.src !== dataSrc) {
          img.src = dataSrc;
        }
        imageObserver.value?.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px', // Начинаем загружать за 50px до появления
    threshold: 0.1
  });
  
  // Наблюдаем за всеми изображениями с классом lazy-img
  document.querySelectorAll('.lazy-img').forEach(img => {
    imageObserver.value?.observe(img);
  });
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
  // Сохраняем текущую позицию скролла перед переходом
  if (contentRef.value) {
    contentRef.value.$el.getScrollElement().then((scrollElement: any) => {
      savedScrollPosition.value = scrollElement.scrollTop;
    });
  }
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
    
    await showSuccessToast('Вы успешно записались на мероприятие!', 2000);
  } catch (error) {
    console.error('Error toggling registration:', error);
    await showErrorToast('Ошибка при регистрации на мероприятие', 3000);
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

// Функция для сброса списка событий
const resetEventsList = () => {
  events.value = [];
  filteredEvents.value = [];
  displayedEvents.value = [];
  page.value = 0;
  hasMore.value = true;
  isLoading.value = false;
  isLoadingMore.value = false;
  isLoadingMoreData.value = false;
  savedScrollPosition.value = 0;
  lastScrollY.value = 0;
  searchText.value = '';
  dateRange.value = { from: '', to: '' };
  selectedFilter.value = 'all';
  sortBy.value = 'id_DESC';
  viewMode.value = 'grid';
  filtersVisible.value = true;
};

watch(searchText, () => {
  // Не выполняем поиск до полной инициализации компонента
  if (!isInitialized.value) return;
  
  // Очищаем предыдущий таймер
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Устанавливаем новый таймер с задержкой 300мс
  searchTimeout = setTimeout(() => {
    loadEvents(true);
  }, 300);
});

// Обновляем участия при каждом переходе на эту страницу
watch(
  () => route.fullPath,
  async (newPath) => {
    if (newPath === '/tabs/events-list' && isInitialized.value) {
      // Восстанавливаем позицию скролла если она была сохранена
      if (savedScrollPosition.value > 0) {
        await nextTick();
        setTimeout(async () => {
          if (contentRef.value) {
            const scrollElement = await contentRef.value.$el.getScrollElement();
            scrollElement.scrollTop = savedScrollPosition.value;
          }
        }, 50);
      }
      
      // Загружаем участия в фоне
      loadUserParticipations();
    }
  }
);

// Добавляем watch для восстановления скролла при обновлении событий
watch(
  () => filteredEvents.value.length,
  async (newLength, oldLength) => {
    // Восстанавливаем скролл только при добавлении новых элементов (infinite scroll)
    if (isLoadingMoreData.value && newLength > oldLength && savedScrollPosition.value > 0) {
      await nextTick();
      // Минимальная задержка для завершения рендеринга masonry
      setTimeout(async () => {
        if (contentRef.value && isLoadingMoreData.value) {
          const scrollElement = await contentRef.value.$el.getScrollElement();
          scrollElement.scrollTop = savedScrollPosition.value;
          isLoadingMoreData.value = false;
        }
      }, 25); // Уменьшаем до минимума
    }
  }
);

onMounted(async () => {
  await loadEvents(true);
  await loadUserParticipations();
  // Отмечаем что компонент инициализирован, теперь watch может работать
  isInitialized.value = true;
});

// Сбрасываем список событий только при переходе на другие табы (не на детали мероприятия)
onIonViewWillLeave(() => {
  // Проверяем, не переходим ли мы на детали мероприятия
  const currentRoute = router.currentRoute.value;
  if (!currentRoute.path.includes('/event/')) {
    resetEventsList();
  }
});

onUnmounted(() => {
  // Очищаем таймер при размонтировании компонента
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Очищаем дебаунс infinite scroll
  if (infiniteScrollDebounce.value) {
    clearTimeout(infiniteScrollDebounce.value);
  }
  
  // Очищаем Intersection Observer
  if (imageObserver.value) {
    imageObserver.value.disconnect();
  }
});
</script>

<style scoped>
.events-list-page {
  --background: var(--eco-background-secondary);
}

.events-list-page ion-header,
.events-list-page ion-toolbar {
  box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  --box-shadow: 0 1px 0 0 white, 0 2px 4px rgba(255, 255, 255, 1) !important;
  position: relative;
  z-index: 1000;
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

/* Общие стили для карточек и их элементов */
.event-card {
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--eco-transition-normal);
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  width: 100%;
  display: flex;
  will-change: transform;
  transform: translateZ(0);
  contain: layout style paint;
}

.event-image {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 300px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--eco-radius-lg);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-image img,
.event-image .broken-image-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--eco-space-3);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--eco-space-2);
}

.event-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
  line-height: var(--eco-line-height-tight);
  flex: 1;
  margin-right: var(--eco-space-2);
  max-width: 180px;
  word-break: break-word;
  white-space: normal;
  hyphens: auto;
  overflow-wrap: break-word;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--eco-space-3);
  margin-bottom: var(--eco-space-2);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-1);
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-600);
}

.meta-item ion-icon {
  font-size: 16px;
  color: var(--eco-gray-500);
  flex-shrink: 0;
}

.event-description {
  display: none;
}

/* Стилизация кнопки регистрации */
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

/* Статусы */
.event-status {
  position: absolute;
  top: var(--eco-space-3);
  left: var(--eco-space-3);
  z-index: 99;
}

.status-badge,
.status-badge-text {
  padding: var(--eco-space-1) var(--eco-space-3);
  border-radius: var(--eco-radius-md);
  font-size: var(--eco-font-size-xs);
  font-weight: var(--eco-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  backdrop-filter: blur(8px);
  display: inline-block;
}
.status-badge.upcoming,
.status-badge-text.upcoming {
  background: var(--eco-primary);
}
.status-badge.soon,
.status-badge-text.soon {
  background: var(--eco-warning);
}
.status-badge.finished,
.status-badge-text.finished {
  background: var(--eco-gray-500);
}

/* Плиточный режим */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.events-grid .event-card {
  flex-direction: column;
  height: 320px;
}
.events-grid .event-image {
  aspect-ratio: 1/1;
  height: 180px;
  border-radius: var(--eco-radius-lg) var(--eco-radius-lg) 0 0;
}
.events-grid .event-title {
  max-width: 140px;
}

/* Списочный режим */
.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}
.events-list .event-card {
  flex-direction: row;
  min-height: 168px;
}
.events-list .event-image {
  width: 10vw;
  height: 10vw;
  margin: var(--eco-space-3);
  overflow: hidden;
}
.events-list .event-title {
  max-width: 260px;
  margin-right: var(--eco-space-1);
}

/* Скрываем статус на изображении в списочном режиме */
.events-list .event-status {
  display: none;
}
.event-status-text {
  margin-bottom: var(--eco-space-2);
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

/* Поиск и фильтры */
.search-filters-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--eco-gray-50);
  border-bottom: 1px solid var(--eco-gray-200);
  padding: var(--eco-space-4);
  margin-bottom: var(--eco-space-4);
  box-shadow: none !important;
  transform: translateY(0);
  transition: transform var(--eco-transition-normal), opacity var(--eco-transition-normal);
  opacity: 1;
  border-radius: var(--eco-radius-lg);
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

/* Оптимизация для ленивой загрузки изображений */
.lazy-img {
  transition: opacity 0.3s ease;
  will-change: transform;
  transform: translateZ(0);
}
.lazy-img[src*="placeholder"] {
  opacity: 0.7;
}
.lazy-img:not([src*="placeholder"]) {
  opacity: 1;
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

/* Стилизация спиннера бесконечной прокрутки */
ion-infinite-scroll-content {
  --color: var(--eco-primary);
}
ion-infinite-scroll-content ion-spinner {
  --color: var(--eco-primary) !important;
}
ion-infinite-scroll-content ion-spinner::part(circle) {
  stroke: var(--eco-primary) !important;
}
ion-infinite-scroll-content ion-spinner::part(circles) {
  stroke: var(--eco-primary) !important;
}

/* Адаптивность */
@media (max-width: 480px) {
  .search-filters-container {
    padding: var(--eco-space-3);
  }
  .events-container {
    padding: 0 var(--eco-space-3) var(--eco-space-3);
  }
  .events-list {
    gap: var(--eco-space-3);
  }
  .events-list .event-card {
    min-height: 100px;
  }
  .events-list .event-image {
    width: 140px;
    height: 140px;
    margin: var(--eco-space-2);
  }
  .event-title {
    font-size: var(--eco-font-size-base);
  }
}
</style> 
