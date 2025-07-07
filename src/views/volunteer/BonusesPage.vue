<template>
  <ion-page class="bonuses-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title">Мои бонусы</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bonuses-content">
      <!-- Статистика бонусов -->
      <div class="stats-section">
        <div class="stats-card eco-card">
          <div class="stats-header">
            <div class="stats-icon">
              <ion-icon :icon="trophyOutline" />
            </div>
            <div class="stats-info">
              <h2>Мои достижения</h2>
              <p>Ваши экологические бонусы</p>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value total">{{ totalBalance }}</div>
              <div class="stat-label">Общий баланс</div>
            </div>
            <div class="stat-item">
              <div class="stat-value earned">+{{ totalEarned }}</div>
              <div class="stat-label">Заработано</div>
            </div>
            <div class="stat-item">
              <div class="stat-value spent">{{ totalSpent }}</div>
              <div class="stat-label">Потрачено</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Фильтры -->
      <div class="filters-section">
        <div class="filters-card eco-card">
          <div class="filters-header">
            <ion-icon :icon="filterOutline" />
            <span>Фильтр по датам</span>
          </div>
          
          <div class="filters-content">
            <div class="date-filter">
              <ion-label class="filter-label">С</ion-label>
              <div class="date-input-wrapper" @click="openDatePicker('from')">
                <ion-input
                  :value="dateFromDisplay"
                  readonly
                  class="date-input"
                  placeholder="Выберите дату"
                ></ion-input>
                <ion-icon :icon="calendarOutline" class="date-icon" />
              </div>
              <input type="date" ref="dateFromRef" v-model="dateFrom" @change="applyDateFilter" style="display:none" />
            </div>
            
            <div class="date-filter">
              <ion-label class="filter-label">По</ion-label>
              <div class="date-input-wrapper" @click="openDatePicker('to')">
                <ion-input
                  :value="dateToDisplay"
                  readonly
                  class="date-input"
                  placeholder="Выберите дату"
                ></ion-input>
                <ion-icon :icon="calendarOutline" class="date-icon" />
              </div>
              <input type="date" ref="dateToRef" v-model="dateTo" @change="applyDateFilter" style="display:none" />
            </div>
            
            <ion-button
              v-if="dateFrom || dateTo"
              fill="clear"
              size="small"
              class="clear-filter-button"
              @click="clearFilters"
            >
              <ion-icon :icon="closeOutline" slot="icon-only" />
            </ion-button>
          </div>
        </div>
      </div>

      <!-- История бонусов -->
      <div class="history-section">
        <!-- Лоадер -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>
          <p class="loading-text">Загружаем историю бонусов...</p>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <ion-icon :icon="alertCircleOutline" />
          </div>
          <h3 class="error-title">Ошибка загрузки</h3>
          <p class="error-subtitle">{{ error.message }}</p>
          <ion-button fill="outline" @click="fetchBonusHistory" class="retry-button">
            Попробовать снова
          </ion-button>
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="bonusHistory.length === 0" class="empty-state">
          <div class="empty-icon">
            <ion-icon :icon="giftOutline" />
          </div>
          <h3 class="empty-title">Нет операций с бонусами</h3>
          <p class="empty-subtitle">Участвуйте в экологических мероприятиях и зарабатывайте бонусы!</p>
        </div>

        <!-- Список истории -->
        <div v-else-if="filteredBonuses.length > 0" class="history-list">
          <h3 class="history-title">
            История операций
            <span class="history-count">({{ filteredBonuses.length }})</span>
          </h3>
          
          <div class="bonus-items">
            <div 
              v-for="item in filteredBonuses" 
              :key="item.id"
              class="bonus-item eco-card eco-list-item"
            >
              <div class="bonus-icon-container">
                <div :class="['bonus-icon', getAmountClass(item.amount)]">
                  <ion-icon :icon="getBonusIcon(item.amount)" />
                </div>
              </div>
              
              <div class="bonus-content">
                <div class="bonus-header">
                  <h4 class="bonus-reason">{{ item.reason || 'Операция с бонусами' }}</h4>
                  <div :class="['bonus-amount', getAmountClass(item.amount)]">
                    {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
                  </div>
                </div>
                
                <div class="bonus-meta">
                  <div class="meta-item">
                    <ion-icon :icon="timeOutline" />
                    <span>{{ formatDate(item.createdAt || '') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Нет результатов фильтрации -->
        <div v-else-if="dateFrom || dateTo" class="no-results">
          <div class="no-results-icon">
            <ion-icon :icon="searchOutline" />
          </div>
          <h3 class="no-results-title">Нет операций за выбранный период</h3>
          <p class="no-results-subtitle">Попробуйте изменить период или сбросить фильтр</p>
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
  IonIcon
} from '@ionic/vue';
import { 
  calendarOutline, 
  trophyOutline,
  filterOutline,
  closeOutline,
  alertCircleOutline,
  giftOutline,
  timeOutline,
  searchOutline,
  addCircleOutline,
  removeCircleOutline,
  swapHorizontalOutline
} from 'ionicons/icons';
import { bonusHistoryApi } from '../../api/bonuses';
import { useAuthStore } from '../../stores/auth';
import type { UserBonusHistoryResponseShortDTO } from '../../types/api';

const authStore = useAuthStore();

const bonusHistory = ref<UserBonusHistoryResponseShortDTO[]>([]);
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

const totalBalance = computed(() => {
  return bonusHistory.value.reduce((sum, item) => sum + item.amount, 0);
});

const totalEarned = computed(() => {
  return bonusHistory.value
    .filter(item => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0);
});

const totalSpent = computed(() => {
  return bonusHistory.value
    .filter(item => item.amount < 0)
    .reduce((sum, item) => sum + item.amount, 0);
});

const applyDateFilter = () => {};

const clearFilters = () => {
  dateFrom.value = '';
  dateTo.value = '';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit', 
    minute: '2-digit' 
  });
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
  return amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral';
};

const getBonusIcon = (amount: number) => {
  if (amount > 0) return addCircleOutline;
  if (amount < 0) return removeCircleOutline;
  return swapHorizontalOutline;
};

onMounted(fetchBonusHistory);
</script>

<style scoped>
.bonuses-page {
  --background: var(--eco-background-secondary);
}

.bonuses-content {
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
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-secondary) 100%);
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
}

.stat-value.total {
  color: white;
}

.stat-value.earned {
  color: var(--eco-success);
}

.stat-value.spent {
  color: #FFB4B4;
}

.stat-label {
  font-size: var(--eco-font-size-xs);
  font-weight: var(--eco-font-weight-medium);
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Фильтры */
.filters-section {
  padding: 0 var(--eco-space-4) var(--eco-space-4);
}

.filters-card {
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
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

.filter-label {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-600);
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
  --placeholder-color: var(--eco-gray-500);
  --padding-start: 16px;
  --padding-end: 48px;
  cursor: pointer;
}

.date-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--eco-gray-500);
  pointer-events: none;
}

.clear-filter-button {
  --color: var(--eco-gray-500);
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

/* История */
.history-section {
  padding: 0 var(--eco-space-4) var(--eco-space-4);
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
  color: var(--eco-gray-400);
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

.retry-button,
.clear-button {
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
}

.history-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-4) 0;
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
}

.history-count {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-normal);
  color: var(--eco-gray-500);
}

.bonus-items {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-3);
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-4);
  padding: var(--eco-space-4);
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  cursor: default;
}

.bonus-item:hover {
  border-color: var(--eco-gray-300);
  transform: none;
}

.bonus-icon-container {
  flex-shrink: 0;
}

.bonus-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bonus-icon.positive {
  background: var(--eco-success);
}

.bonus-icon.negative {
  background: var(--eco-error);
}

.bonus-icon.neutral {
  background: var(--eco-gray-400);
}

.bonus-icon ion-icon {
  font-size: 24px;
  color: white;
}

.bonus-content {
  flex: 1;
  min-width: 0;
}

.bonus-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--eco-space-2);
}

.bonus-reason {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-800);
  margin: 0;
  flex: 1;
  margin-right: var(--eco-space-3);
}

.bonus-amount {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-bold);
  flex-shrink: 0;
}

.bonus-amount.positive {
  color: var(--eco-success);
}

.bonus-amount.negative {
  color: var(--eco-error);
}

.bonus-amount.neutral {
  color: var(--eco-gray-600);
}

.bonus-meta {
  display: flex;
  gap: var(--eco-space-4);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-500);
}

.meta-item ion-icon {
  font-size: 16px;
  color: var(--eco-gray-400);
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
  
  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-filter {
    flex: none;
  }
  
  .clear-filter-button {
    align-self: center;
  }
  
  .bonus-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--eco-space-2);
  }
  
  .bonus-amount {
    font-size: var(--eco-font-size-base);
  }
}
</style> 