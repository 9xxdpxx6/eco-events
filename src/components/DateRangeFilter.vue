<template>
  <div class="date-range-filter">
    <div class="filters-card eco-card">
      <div class="filters-header">
        <ion-icon :icon="funnelOutline" />
        <span>{{ title || 'Фильтр по дате' }}</span>
      </div>
      
      <div class="filters-content">
        <div class="date-filter">
          <div class="date-input-wrapper" @click="openDatePicker('from')">
            <ion-input
              :value="dateFromDisplay"
              readonly
              class="date-input"
              :placeholder="fromPlaceholder || 'С: выберите дату'"
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
              :placeholder="toPlaceholder || 'По: выберите дату'"
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

    <EcoCalendar 
      :show="showDatePicker" 
      :title="currentDateType === 'from' ? 'Выберите дату начала' : 'Выберите дату окончания'"
      @update:show="showDatePicker = $event"
      @select="onDateSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonInput, IonButton, IonIcon } from '@ionic/vue';
import { calendarOutline, funnelOutline, closeOutline } from 'ionicons/icons';
import EcoCalendar from './EcoCalendar.vue';

interface Props {
  modelValue?: {
    from?: string;
    to?: string;
  };
  title?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: { from?: string; to?: string }): void;
  (e: 'change'): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ from: '', to: '' }),
  title: 'Фильтр по дате',
  fromPlaceholder: 'С: выберите дату',
  toPlaceholder: 'По: выберите дату'
});

const emit = defineEmits<Emits>();

const showDatePicker = ref(false);
const currentDateType = ref<'from' | 'to'>('from');

const dateFrom = computed({
  get: () => props.modelValue?.from || '',
  set: (value: string) => {
    emit('update:modelValue', { ...props.modelValue, from: value });
    emit('change');
  }
});

const dateTo = computed({
  get: () => props.modelValue?.to || '',
  set: (value: string) => {
    emit('update:modelValue', { ...props.modelValue, to: value });
    emit('change');
  }
});

const dateFromDisplay = computed(() => dateFrom.value ? formatDateInput(dateFrom.value) : '');
const dateToDisplay = computed(() => dateTo.value ? formatDateInput(dateTo.value) : '');

function formatDateInput(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU');
}

function openDatePicker(type: 'from' | 'to') {
  currentDateType.value = type;
  showDatePicker.value = true;
}

function onDateSelect(dateString: string) {
  if (currentDateType.value === 'from') {
    dateFrom.value = dateString;
  } else {
    dateTo.value = dateString;
  }
}

const clearDateFrom = () => {
  dateFrom.value = '';
};

const clearDateTo = () => {
  dateTo.value = '';
};
</script>

<style scoped>
.date-range-filter {
  margin-bottom: var(--eco-space-3);
  margin-top: var(--eco-space-2); /* добавлен отступ сверху */
}

.filters-card {
  background: var(--eco-white);
  border: none;
  margin-bottom: var(--eco-space-2);
  padding: var(--eco-space-4); /* добавлен padding */
  border-radius: var(--eco-radius-lg); /* для согласованности с eco-card */
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
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  --border-width: 0px; /* убрана рамка */
  --border-color: transparent;
  --border-color-focused: transparent;
  --color: var(--eco-gray-800);
  --placeholder-color: var(--eco-gray-600);
  --padding-start: 16px;
  --padding-end: 16px;
  padding-top: 12px;
  padding-bottom: 12px;
  border-radius: var(--eco-radius-lg);
  font-size: var(--eco-font-size-base);
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
  top: 40%;
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
  font-size: 32px;
}

/* Отзывчивость */
@media (max-width: 480px) {
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
}
</style> 