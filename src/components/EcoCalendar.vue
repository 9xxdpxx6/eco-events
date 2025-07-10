<template>
  <!-- Модальное окно календаря -->
  <div v-if="show" class="date-picker-overlay" @click="closeCalendar">
    <div class="date-picker-modal" @click.stop>
      <div class="date-picker-header">
        <h3>Выберите дату</h3>
        <ion-button fill="clear" @click="closeCalendar" class="close-button">
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  IonButton,
  IonIcon
} from '@ionic/vue';
import { 
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline
} from 'ionicons/icons';

interface Props {
  show: boolean;
  modelValue?: string;
  title?: string;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'update:modelValue', value: string): void;
  (e: 'select', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Выберите дату'
});

const emit = defineEmits<Emits>();

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
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  
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
  
  // Добавляем дни следующего месяца
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

// Следим за изменением modelValue для синхронизации
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    currentCalendarDate.value = new Date(newValue);
  }
});

// Следим за открытием календаря
watch(() => props.show, (newValue) => {
  if (newValue) {
    // Сбрасываем режим календаря на дни
    calendarMode.value = 'days';
    
    // Устанавливаем дату
    if (props.modelValue) {
      currentCalendarDate.value = new Date(props.modelValue);
    } else {
      currentCalendarDate.value = new Date();
    }
  }
});

function formatMonthYear(date: Date) {
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function getYearRange() {
  const startYear = calendarYears.value[0]?.year;
  const endYear = calendarYears.value[calendarYears.value.length - 1]?.year;
  return `${startYear} - ${endYear}`;
}

function isDateSelected(date: Date) {
  if (!props.modelValue) return false;
  
  const selectedDate = new Date(props.modelValue + 'T00:00:00');
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
  } else if (calendarMode.value === 'months') {
    calendarMode.value = 'years';
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
  const year = day.fullDate.getFullYear();
  const month = String(day.fullDate.getMonth() + 1).padStart(2, '0');
  const date = String(day.fullDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${date}`;
  
  // Если выбрали день из другого месяца, переходим к тому месяцу
  if (day.otherMonth) {
    currentCalendarDate.value = new Date(day.fullDate);
  }
  
  // Эмитим события
  emit('update:modelValue', dateString);
  emit('select', dateString);
  closeCalendar();
}

function closeCalendar() {
  emit('update:show', false);
  calendarMode.value = 'days';
}
</script>

<style scoped>
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

/* Адаптивные стили для модального календаря */
@media (max-width: 480px) {
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
  
  .close-button ion-icon {
    font-size: 20px;
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
}
</style> 