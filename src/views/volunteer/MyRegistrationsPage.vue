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

    <!-- Модальное окно календаря -->
    <div v-if="showDatePicker" class="date-picker-overlay" @click="closeDatePicker">
      <div class="date-picker-modal" @click.stop>
        <div class="date-picker-header">
          <h3>Выберите дату</h3>
          <ion-button fill="clear" @click="closeDatePicker" class="close-button">
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </div>
        
        <div class="calendar-container">
          <div class="calendar-header">
            <ion-button fill="clear" @click="previousPeriod" class="nav-button">
              <ion-icon :icon="chevronBackOutline" />
            </ion-button>
            <div class="calendar-title" @click="switchToUpperLevel">
              <h4 v-if="calendarMode === 'days'" class="month-year">{{ formatMonthYear(currentCalendarDate) }}</h4>
              <h4 v-else-if="calendarMode === 'months'" class="month-year">{{ currentCalendarDate.getFullYear() }}</h4>
              <h4 v-else class="month-year">{{ getYearRange() }}</h4>
            </div>
            <ion-button fill="clear" @click="nextPeriod" class="nav-button">
              <ion-icon :icon="chevronForwardOutline" />
            </ion-button>
          </div>
          
          <!-- Сетка дней -->
          <div v-if="calendarMode === 'days'">
            <div class="calendar-weekdays">
              <div class="weekday">Пн</div>
              <div class="weekday">Вт</div>
              <div class="weekday">Ср</div>
              <div class="weekday">Чт</div>
              <div class="weekday">Пт</div>
              <div class="weekday">Сб</div>
              <div class="weekday">Вс</div>
            </div>
            
            <div class="calendar-days">
              <div 
                v-for="day in calendarDays" 
                :key="day.key"
                :class="['calendar-day', {
                  'other-month': day.otherMonth,
                  'selected': day.selected,
                  'today': day.isToday
                }]"
                @click="selectCalendarDay(day)"
              >
                {{ day.date }}
              </div>
            </div>
          </div>
          
          <!-- Сетка месяцев -->
          <div v-else-if="calendarMode === 'months'" class="calendar-months">
            <div 
              v-for="month in calendarMonths" 
              :key="month.key"
              :class="['calendar-month', {
                'selected': month.selected
              }]"
              @click="selectMonth(month)"
            >
              {{ month.name }}
            </div>
          </div>
          
          <!-- Сетка годов -->
          <div v-else class="calendar-years">
            <div 
              v-for="year in calendarYears" 
              :key="year.key"
              :class="['calendar-year', {
                'selected': year.selected
              }]"
              @click="selectYear(year)"
            >
              {{ year.year }}
            </div>
          </div>
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
                      <span>{{ formatEventDate((reg.event as any).startTime || '') }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="locationOutline" />
                      <span>{{ (reg.event as any).location || 'Место не указано' }}</span>
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
                      <span>{{ formatEventDate((reg.event as any).startTime || '') }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="locationOutline" />
                      <span>{{ (reg.event as any).location || 'Место не указано' }}</span>
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
                      <span>{{ formatEventDate((reg.event as any).startTime || '') }}</span>
                    </div>
                    <div class="meta-item">
                      <ion-icon :icon="locationOutline" />
                      <span>{{ (reg.event as any).location || 'Место не указано' }}</span>
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
  funnelOutline,
  closeOutline,
  alertCircleOutline,
  clipboardOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  locationOutline,
  searchOutline,
  chevronBackOutline,
  chevronForwardOutline
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
const showDatePicker = ref(false);
const currentDateType = ref<'from' | 'to'>('from');
const currentCalendarDate = ref(new Date());
const calendarMode = ref<'days' | 'months' | 'years'>('days');

interface CalendarDay {
  date: number;
  fullDate: Date;
  otherMonth: boolean;
  selected: boolean;
  isToday: boolean;
  key: string;
}

interface CalendarMonth {
  month: number;
  name: string;
  selected: boolean;
  key: string;
}

interface CalendarYear {
  year: number;
  selected: boolean;
  key: string;
}

const calendarDays = computed(() => {
  if (calendarMode.value !== 'days') return [];
  
  const year = currentCalendarDate.value.getFullYear();
  const month = currentCalendarDate.value.getMonth();
  
  // Первый день месяца и последний день месяца
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Первый день недели (понедельник = 1, воскресенье = 0)
  const firstWeekday = (firstDay.getDay() + 6) % 7; // Делаем понедельник = 0
  
  const days: CalendarDay[] = [];
  
  // Добавляем дни предыдущего месяца
  const prevMonthLastDay = new Date(year, month, 0);
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const date = prevMonthLastDay.getDate() - i;
    const fullDate = new Date(year, month - 1, date);
    days.push({
      date,
      fullDate,
      otherMonth: true,
      selected: isDateSelected(fullDate),
      isToday: isToday(fullDate),
      key: `prev-${date}`
    });
  }
  
  // Добавляем дни текущего месяца
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const fullDate = new Date(year, month, date);
    days.push({
      date,
      fullDate,
      otherMonth: false,
      selected: isDateSelected(fullDate),
      isToday: isToday(fullDate),
      key: `current-${date}`
    });
  }
  
  // Добавляем дни следующего месяца чтобы заполнить сетку
  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextDate = 1;
  for (let i = days.length; i < totalCells; i++) {
    const fullDate = new Date(year, month + 1, nextDate);
    days.push({
      date: nextDate,
      fullDate,
      otherMonth: true,
      selected: isDateSelected(fullDate),
      isToday: isToday(fullDate),
      key: `next-${nextDate}`
    });
    nextDate++;
  }
  
  return days;
});

const calendarMonths = computed(() => {
  if (calendarMode.value !== 'months') return [];
  
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  return months.map((name, index) => ({
    month: index,
    name,
    selected: currentCalendarDate.value.getMonth() === index,
    key: `month-${index}`
  }));
});

const calendarYears = computed(() => {
  if (calendarMode.value !== 'years') return [];
  
  const currentYear = currentCalendarDate.value.getFullYear();
  const startYear = Math.floor(currentYear / 12) * 12;
  const years: CalendarYear[] = [];
  
  for (let i = 0; i < 12; i++) {
    const year = startYear + i;
    years.push({
      year,
      selected: currentYear === year,
      key: `year-${year}`
    });
  }
  
  return years;
});

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
  return filteredRegistrations.value.filter(reg => {
    const eventStartTime = (reg.event as any).startTime;
    if (!eventStartTime) return false;
    const eventDate = new Date(eventStartTime);
    return eventDate > now && reg.status !== 'CANCELLED';
  });
});

const completedEvents = computed(() => {
  const now = new Date();
  return filteredRegistrations.value.filter(reg => {
    const eventStartTime = (reg.event as any).startTime;
    if (!eventStartTime) return false;
    const eventDate = new Date(eventStartTime);
    return eventDate <= now && reg.status !== 'CANCELLED';
  });
});

const cancelledEvents = computed(() => {
  return filteredRegistrations.value.filter(reg => reg.status === 'CANCELLED');
});

const upcomingCount = computed(() => upcomingEvents.value.length);
const completedCount = computed(() => completedEvents.value.length);
const cancelledCount = computed(() => cancelledEvents.value.length);

function formatMonthYear(date: Date) {
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function getYearRange() {
  const startYear = calendarYears.value[0]?.year;
  const endYear = calendarYears.value[calendarYears.value.length - 1]?.year;
  return `${startYear} - ${endYear}`;
}

function isDateSelected(date: Date) {
  // Проверяем выбранную дату в зависимости от текущего типа
  const selectedDateValue = currentDateType.value === 'from' ? dateFrom.value : dateTo.value;
  if (!selectedDateValue) return false;
  
  // Сравниваем только дату без времени
  const selectedDate = new Date(selectedDateValue + 'T00:00:00');
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return compareDate.getTime() === selectedDate.getTime();
}

function isToday(date: Date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function previousPeriod() {
  if (calendarMode.value === 'days') {
    const newDate = new Date(currentCalendarDate.value);
    newDate.setMonth(newDate.getMonth() - 1);
    currentCalendarDate.value = newDate;
  } else if (calendarMode.value === 'months') {
    const newDate = new Date(currentCalendarDate.value);
    newDate.setFullYear(newDate.getFullYear() - 1);
    currentCalendarDate.value = newDate;
  } else if (calendarMode.value === 'years') {
    const newDate = new Date(currentCalendarDate.value);
    newDate.setFullYear(newDate.getFullYear() - 12);
    currentCalendarDate.value = newDate;
  }
}

function nextPeriod() {
  if (calendarMode.value === 'days') {
    const newDate = new Date(currentCalendarDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentCalendarDate.value = newDate;
  } else if (calendarMode.value === 'months') {
    const newDate = new Date(currentCalendarDate.value);
    newDate.setFullYear(newDate.getFullYear() + 1);
    currentCalendarDate.value = newDate;
  } else if (calendarMode.value === 'years') {
    const newDate = new Date(currentCalendarDate.value);
    newDate.setFullYear(newDate.getFullYear() + 12);
    currentCalendarDate.value = newDate;
  }
}

function switchToUpperLevel() {
  if (calendarMode.value === 'days') {
    calendarMode.value = 'months';
    currentCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth(), 1);
  } else if (calendarMode.value === 'months') {
    calendarMode.value = 'years';
    currentCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), 0, 1);
  }
}

function selectMonth(month: CalendarMonth) {
  currentCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), month.month, 1);
  calendarMode.value = 'days';
}

function selectYear(year: CalendarYear) {
  currentCalendarDate.value = new Date(year.year, 0, 1);
  calendarMode.value = 'months';
}

function selectCalendarDay(day: CalendarDay) {
  // Используем более надежный способ формирования даты
  const year = day.fullDate.getFullYear();
  const month = String(day.fullDate.getMonth() + 1).padStart(2, '0'); // +1 потому что getMonth() возвращает 0-11
  const date = String(day.fullDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${date}`;
  
  console.log('Выбрана дата:', day.date, 'Полная дата:', day.fullDate, 'Строка:', dateString);
  
  // Сразу применяем выбранную дату
  if (currentDateType.value === 'from') {
    dateFrom.value = dateString;
  } else {
    dateTo.value = dateString;
  }
  
  applyDateFilter();
  
  // Если выбрали день из другого месяца, переходим к тому месяцу
  if (day.otherMonth) {
    currentCalendarDate.value = new Date(day.fullDate);
  }
  
  // Закрываем календарь сразу после выбора
  closeDatePicker();
}

function openDatePicker(type: 'from' | 'to') {
  currentDateType.value = type;
  const existingDate = type === 'from' ? dateFrom.value : dateTo.value;
  
  if (existingDate) {
    currentCalendarDate.value = new Date(existingDate);
  } else {
    currentCalendarDate.value = new Date();
  }
  
  // Сбрасываем режим календаря на дни
  calendarMode.value = 'days';
  showDatePicker.value = true;
}

function closeDatePicker() {
  showDatePicker.value = false;
  calendarMode.value = 'days'; // Сбрасываем режим при закрытии
}

function formatDateInput(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU');
}

const clearDateFrom = () => {
  dateFrom.value = '';
};

const clearDateTo = () => {
  dateTo.value = '';
};

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
  --border-radius: var(--eco-radius-lg);
  --box-shadow: none;
  --icon-color: var(--eco-gray-500);
  --color: var(--eco-gray-800);
      --placeholder-color: var(--eco-gray-600);
  --clear-button-color: var(--eco-gray-500);
  margin: 0;
  border-radius: var(--eco-radius-lg);
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
  top: 50%;
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
  font-size: 16px;
}

/* Секция регистраций */
.registrations-section {
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

/* Группированный список */
.grouped-registrations {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-6);
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
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
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
  
  .clear-date-button ion-icon {
    font-size: 14px;
  }
  
  .event-card {
    flex-direction: column;
    border-radius: var(--eco-radius-lg);
  }
  
  .event-image {
    width: 100%;
    height: 120px;
    border-radius: var(--eco-radius-lg) var(--eco-radius-lg) 0 0;
  }
  
  .event-content {
    padding: var(--eco-space-4);
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
  
  /* Адаптивные стили для модального календаря */
  .date-picker-modal {
    width: 95%;
    max-width: none;
    margin: var(--eco-space-4);
  }
  
  .date-picker-header {
    padding: var(--eco-space-3);
  }
  
  .calendar-container {
    padding: var(--eco-space-3);
  }
  
  .calendar-header {
    margin-bottom: var(--eco-space-3);
  }
  
  .nav-button {
    width: 44px;
    height: 44px;
  }
  
  .nav-button ion-icon {
    font-size: 28px;
  }
  
  .month-year {
    font-size: var(--eco-font-size-base);
  }
  
  .weekday {
    padding: var(--eco-space-1);
    font-size: var(--eco-font-size-xs);
  }
  
  .calendar-day {
    font-size: var(--eco-font-size-xs);
    min-height: 36px;
  }
  
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
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
  border-radius: var(--eco-radius-lg);
  margin-top: var(--eco-space-2);
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

/* Стили модального календаря */
.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.date-picker-modal {
  background: white;
  border-radius: var(--eco-radius-xl);
  box-shadow: var(--eco-shadow-xl);
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--eco-space-4);
  border-bottom: 1px solid var(--eco-gray-200);
}

.date-picker-header h3 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
}

.close-button {
  --color: var(--eco-gray-500);
  --background: transparent;
  --border-radius: var(--eco-radius-lg);
}

.close-button ion-icon {
  font-size: 40px;
}

.calendar-container {
  padding: var(--eco-space-4);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--eco-space-4);
}

.calendar-title {
  cursor: pointer;
  padding: var(--eco-space-2) var(--eco-space-3);
  border-radius: var(--eco-radius-lg);
  transition: all var(--eco-transition-fast);
}

.calendar-title:hover {
  background: var(--eco-gray-100);
}

.nav-button {
  --color: var(--eco-primary);
  --background: transparent;
  --border-radius: var(--eco-radius-lg);
  width: 48px;
  height: 48px;
}

.nav-button ion-icon {
  font-size: 36px;
}

.nav-button:hover {
  --background: var(--eco-gray-100);
}

.month-year {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
  text-transform: capitalize;
}

/* Сетка месяцев */
.calendar-months {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--eco-space-2);
  padding: var(--eco-space-2);
}

.calendar-month {
  aspect-ratio: 2/1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid var(--eco-gray-200);
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-800);
  cursor: pointer;
  transition: all var(--eco-transition-fast);
  border-radius: var(--eco-radius-lg);
  user-select: none;
}

.calendar-month:hover {
  background: var(--eco-gray-50);
  border-color: var(--eco-primary);
  color: var(--eco-primary);
}

.calendar-month.selected {
  background: var(--eco-primary);
  border-color: var(--eco-primary);
  color: white;
  font-weight: var(--eco-font-weight-semibold);
}

/* Сетка годов */
.calendar-years {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--eco-space-2);
  padding: var(--eco-space-2);
}

.calendar-year {
  aspect-ratio: 2/1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid var(--eco-gray-200);
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-800);
  cursor: pointer;
  transition: all var(--eco-transition-fast);
  border-radius: var(--eco-radius-lg);
  user-select: none;
}

.calendar-year:hover {
  background: var(--eco-gray-50);
  border-color: var(--eco-primary);
  color: var(--eco-primary);
}

.calendar-year.selected {
  background: var(--eco-primary);
  border-color: var(--eco-primary);
  color: white;
  font-weight: var(--eco-font-weight-semibold);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: var(--eco-space-2);
}

.weekday {
  padding: var(--eco-space-2);
  text-align: center;
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-600);
  background: var(--eco-gray-100);
  border-radius: var(--eco-radius-sm);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: var(--eco-gray-200);
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
  padding: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-800);
  cursor: pointer;
  transition: all var(--eco-transition-fast);
  position: relative;
  border-radius: var(--eco-radius-sm);
  min-height: 40px;
  user-select: none;
}

.calendar-day:hover {
  background: var(--eco-gray-50);
  color: var(--eco-primary);
}

.calendar-day.other-month {
  color: var(--eco-gray-400);
  background: var(--eco-gray-50);
}

.calendar-day.other-month:hover {
  color: var(--eco-gray-600);
  background: var(--eco-gray-100);
}

.calendar-day.today {
  background: var(--eco-secondary);
  color: white;
  font-weight: var(--eco-font-weight-semibold);
}

.calendar-day.today:hover {
  background: var(--eco-primary);
}

.calendar-day.selected {
  background: var(--eco-primary);
  color: white;
  font-weight: var(--eco-font-weight-semibold);
}

.calendar-day.selected:hover {
  background: var(--eco-primary);
}

.calendar-day.selected.today {
  background: var(--eco-primary);
  box-shadow: 0 0 0 2px var(--eco-secondary);
}

/* Отзывчивость */
</style> 
