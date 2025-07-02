<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Бонусы</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Бонусы</ion-title>
        </ion-toolbar>
      </ion-header>
    
      <div class="filters">
        <div class="filter-col">
          <div class="filter-input-wrapper" @click="openDatePicker('from')">
            <input
              type="text"
              :value="dateFromDisplay"
              readonly
              class="filter-input"
              :placeholder="'С'"
            />
            <ion-icon :icon="calendarOutline" class="filter-calendar-icon-right" />
          </div>
          <input type="date" ref="dateFromRef" v-model="dateFrom" @change="applyDateFilter" style="display:none" />
        </div>
        <div class="filter-col">
          <div class="filter-input-wrapper" @click="openDatePicker('to')">
            <input
              type="text"
              :value="dateToDisplay"
              readonly
              class="filter-input"
              :placeholder="'По'"
            />
            <ion-icon :icon="calendarOutline" class="filter-calendar-icon-right" />
          </div>
          <input type="date" ref="dateToRef" v-model="dateTo" @change="applyDateFilter" style="display:none" />
        </div>
      </div>

      <ion-list v-if="!isLoading && filteredBonuses.length > 0">
        <ion-item v-for="item in filteredBonuses" :key="item.id">
          <ion-label>
            <h2>{{ item.reason }}</h2>
            <div class="bonus-amount-row">
              <ion-icon :icon="trophyOutline" class="bonus-icon" />
              <span :class="['bonus-amount', getAmountClass(item.amount)]">{{ item.amount > 0 ? '+' : '' }}{{ item.amount }}</span>
            </div>
            <div class="meta-item" v-if="item.createdAt">
              <ion-icon :icon="calendarOutline" />
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>

      <div v-if="isLoading" class="container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-if="!isLoading && error" class="container">
        <strong>Ошибка при загрузке истории бонусов: {{ error.message }}</strong>
      </div>

      <div v-if="!isLoading && bonusHistory.length === 0" class="container">
        <strong>У вас еще нет ни одной операции с бонусами.</strong>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonInput
} from '@ionic/vue';
import { calendarOutline, trophyOutline } from 'ionicons/icons';
import { bonusHistoryApi } from '../api/bonuses';
import { useAuthStore } from '../stores/auth';
import type { UserBonusHistoryDTO } from '../types/api';

const authStore = useAuthStore();

const bonusHistory = ref<UserBonusHistoryDTO[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);

const dateFrom = ref<string>('');
const dateTo = ref<string>('');
const dateFromRef = ref<HTMLInputElement | null>(null);
const dateToRef = ref<HTMLInputElement | null>(null);

const dateFromDisplay = computed(() => dateFrom.value ? formatDateInput(dateFrom.value) : '');
const dateToDisplay = computed(() => dateTo.value ? formatDateInput(dateTo.value) : '');

const filteredBonuses = computed(() => {
  if (!dateFrom.value && !dateTo.value) return bonusHistory.value;
  return bonusHistory.value.filter(item => {
    if (!item.createdAt) return false;
    const itemDate = new Date(item.createdAt);
    let from = true, to = true;
    if (dateFrom.value) {
      const fromDate = new Date(dateFrom.value + 'T00:00:00');
      from = itemDate >= fromDate;
    }
    if (dateTo.value) {
      const toDate = new Date(dateTo.value + 'T23:59:59');
      to = itemDate <= toDate;
    }
    return from && to;
  });
});

const applyDateFilter = () => {};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${day} в ${time}`;
};

function openDatePicker(type: 'from' | 'to') {
  if (type === 'from' && dateFromRef.value) dateFromRef.value.showPicker();
  if (type === 'to' && dateToRef.value) dateToRef.value.showPicker();
}

function formatDateInput(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU');
}

const fetchBonusHistory = async () => {
  if (!authStore.user?.id) {
    error.value = new Error('Пользователь не авторизован.');
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    bonusHistory.value = await bonusHistoryApi.getByUserId(authStore.user.id);
  } catch (e) {
    console.error('Ошибка при загрузке истории бонусов:', e);
    error.value = e as Error;
  } finally {
    isLoading.value = false;
  }
};

const getAmountClass = (amount: number) => {
  return amount > 0 ? 'bonus-positive' : 'bonus-negative';
};

onMounted(fetchBonusHistory);
</script>

<style scoped>
.container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.container strong {
  font-size: 20px;
  line-height: 26px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.meta-item ion-icon {
  font-size: 16px;
}

.bonus-positive {
  color: var(--ion-color-success);
}

.bonus-negative {
  color: var(--ion-color-danger);
}

.bonus-amount-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0 8px 0;
}

.bonus-icon {
  font-size: 1.5rem;
  color: var(--ion-color-warning);
}

.bonus-amount {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.filters {
  display: flex;
  gap: 16px;
  margin: 10px;
  justify-content: center;
}

.filter-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 120px;
}

.filter-label {
  display: none;
}

.filter-input-wrapper {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.filter-calendar-icon {
  display: none;
}

.filter-calendar-icon-right {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--ion-color-medium);
  pointer-events: none;
}

.filter-input {
  width: 100%;
  padding: 6px 32px 6px 12px;
  border: 1.5px solid var(--ion-color-medium);
  border-radius: 6px;
  background: var(--ion-background-color, #222428);
  color: var(--ion-color-light, #fff);
  font-size: 15px;
  outline: none;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, border-color 0.2s;
  cursor: pointer;
}

.filter-input:focus {
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.18);
  border-color: var(--ion-color-primary);
}

.filter-input::-webkit-input-placeholder {
  color: var(--ion-color-medium);
  opacity: 1;
}

.filter-input::-moz-placeholder {
  color: var(--ion-color-medium);
  opacity: 1;
}

.filter-input:-ms-input-placeholder {
  color: var(--ion-color-medium);
  opacity: 1;
}

.filter-input::placeholder {
  color: var(--ion-color-medium);
  opacity: 1;
}
</style> 