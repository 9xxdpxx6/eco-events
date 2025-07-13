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
          </div>
        </div>
      </div>

      <!-- Фильтры -->
      <div class="filters-section">
        <div class="filters-card eco-card">
          <div class="filters-header">
            <ion-icon :icon="funnelOutline" />
            <span>Фильтр по дате операции</span>
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
      <EcoCalendar 
        :show="showDatePicker" 
        :title="currentDateType === 'from' ? 'Выберите дату начала' : 'Выберите дату окончания'"
        @update:show="showDatePicker = $event"
        @select="onDateSelect"
      />

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
        <ErrorState
          v-else-if="error"
          :message="error.message"
          @retry="reloadBonuses"
        />
        <!-- Пустое состояние -->
        <div v-else-if="bonuses.length === 0" class="empty-state">
          <ion-icon :icon="giftOutline" />
          <h3 class="empty-title">Нет операций с бонусами</h3>
          <p class="empty-subtitle">Участвуйте в экологических мероприятиях и зарабатывайте бонусы!</p>
        </div>
        <!-- Список истории -->
        <div v-else class="all-bonuses-list">
          <h3 class="history-title">
            История операций
            <span class="history-count">({{ bonuses.length }})</span>
          </h3>
          <div class="bonus-items">
            <div 
              v-for="item in bonuses" 
              :key="item.id"
              class="bonus-item eco-card eco-list-item"
            >
              <div class="bonus-content">
                <div class="bonus-header-main">
                  <ion-icon :icon="trophyOutline" :class="['bonus-trophy', getTrophyClass(item.amount)]" />
                  <div class="bonus-reason">
                    <span class="bonus-title">{{ item.reason || 'Операция с бонусами' }}</span>
                    <div class="bonus-meta">
                      <div class="meta-item">
                        <ion-icon :icon="timeOutline" />
                        <span>{{ formatDate(item.createdAt || '') }}</span>
                      </div>
                    </div>
                  </div>
                  <div :class="['bonus-amount', getAmountClass(item.amount)]">
                    {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ion-infinite-scroll @ionInfinite="loadMoreBonuses" :disabled="!hasMore">
          <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Загрузка..."></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
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
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue';
import ErrorState from '../../components/ErrorState.vue';
import EcoCalendar from '../../components/EcoCalendar.vue';
import { 
  calendarOutline, 
  trophyOutline,
  funnelOutline,
  closeOutline,
  alertCircleOutline,
  giftOutline,
  timeOutline,
  searchOutline,
} from 'ionicons/icons';
import { bonusHistoryApi } from '../../api/bonuses';
import { useAuthStore } from '../../stores/auth';
import type { UserBonusHistoryResponseShortDTO } from '../../types/api';

const authStore = useAuthStore();

const bonuses = ref<UserBonusHistoryResponseShortDTO[]>([]); // текущая страница + догруженные
const allBonuses = ref<UserBonusHistoryResponseShortDTO[]>([]); // для статистики (все)
const isLoading = ref(true);
const error = ref<Error | null>(null);

const dateFrom = ref<string>('');
const dateTo = ref<string>('');
const showDatePicker = ref(false);
const currentDateType = ref<'from' | 'to'>('from');
const page = ref(0);
const size = 50;
const hasMore = ref(true);

const dateFromDisplay = computed(() => dateFrom.value ? formatDateInput(dateFrom.value) : '');
const dateToDisplay = computed(() => dateTo.value ? formatDateInput(dateTo.value) : '');

const filteredBonuses = computed(() => bonuses.value);

const totalBalance = computed(() => allBonuses.value.reduce((sum, item) => sum + item.amount, 0));
const totalEarned = computed(() => allBonuses.value.filter(item => item.amount > 0).reduce((sum, item) => sum + item.amount, 0));
const totalSpent = computed(() => allBonuses.value.filter(item => item.amount < 0).reduce((sum, item) => sum + item.amount, 0));

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
  reloadBonuses();
}

const clearDateFrom = () => {
  dateFrom.value = '';
  reloadBonuses();
};
const clearDateTo = () => {
  dateTo.value = '';
  reloadBonuses();
};
const clearFilters = () => {
  dateFrom.value = '';
  dateTo.value = '';
  reloadBonuses();
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

const loadAllBonuses = async () => {
  if (!authStore.user?.id) return;
  try {
    const all = await bonusHistoryApi.search({ userId: authStore.user.id, page: 0, size: 10000 });
    allBonuses.value = all;
  } catch (e) {
    // не критично для UI
  }
};

const reloadBonuses = async () => {
  page.value = 0;
  bonuses.value = [];
  hasMore.value = true;
  await loadBonuses(true);
  loadAllBonuses();
};

const loadBonuses = async (reset = false) => {
  if (!authStore.user?.id) {
    error.value = new Error('Пользователь не авторизован.');
    isLoading.value = false;
    return;
  }
  if (reset) {
    page.value = 0;
    bonuses.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;
  if (reset) {
    isLoading.value = true;
  }
  error.value = null;
  const filter: any = {
    userId: authStore.user.id,
    page: page.value,
    size,
  };
  if (dateFrom.value) filter.createdAtFrom = dateFrom.value + 'T00:00:00';
  if (dateTo.value) filter.createdAtTo = dateTo.value + 'T23:59:59';
  try {
    const result = await bonusHistoryApi.search(filter);
    if (result.length > 0) {
      bonuses.value = [...bonuses.value, ...result];
      hasMore.value = result.length === size;
      page.value += 1;
    } else {
      hasMore.value = false;
    }
  } catch (e) {
    error.value = e as Error;
    hasMore.value = false;
  } finally {
    isLoading.value = false;
  }
};

const loadMoreBonuses = async (event: any) => {
  await loadBonuses();
  event.target.complete();
};

onMounted(async () => {
  await reloadBonuses();
});

// Цвет кубка: бронза (0-30), серебро (31-70), золото (70+), если <0 — красный
const getTrophyClass = (amount: number) => {
  if (amount < 0) return 'trophy-red';
  if (amount <= 30) return 'trophy-bronze';
  if (amount <= 70) return 'trophy-silver';
  return 'trophy-gold';
};
const getAmountClass = (amount: number) => {
  return amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral';
};
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
  padding: var(--eco-space-3);
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
  grid-template-columns: 1fr;
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
  padding: 0 var(--eco-space-3) var(--eco-space-3);
  margin-bottom: var(--eco-space-3);
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.filters-card {
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  margin-bottom: var(--eco-space-2);
  box-shadow: var(--eco-shadow-sm);
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

/* История */
.history-section {
  padding: 0 var(--eco-space-3) var(--eco-space-3);
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

.retry-button {
  --color: var(--eco-primary);
  --border-color: var(--eco-primary);
  font-weight: var(--eco-font-weight-medium);
}

.clear-button {
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
  border-radius: var(--eco-radius-lg);
  margin-top: var(--eco-space-2);
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

.all-bonuses-list {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-2);
}

.bonus-items {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-2);
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-4);
  padding: var(--eco-space-4);
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  cursor: default;
  border-radius: var(--eco-radius-lg);
  box-shadow: var(--eco-shadow-sm);
  transition: all var(--eco-transition-normal);
}

.bonus-item:hover {
  border-color: var(--eco-gray-300);
  transform: none;
}

.bonus-content {
  width: 100%;
}

.bonus-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: var(--eco-space-2);
  gap: 0;
}
.bonus-header-main {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0;
  height: 72px;
  padding-right: 0;
  position: relative;
}
.bonus-trophy {
  font-size: 56px;
  min-width: 56px;
  margin-right: 20px;
  flex-shrink: 0;
  align-self: center;
}
.bonus-trophy.trophy-bronze {
  color: #e6b97a;
}
.bonus-trophy.trophy-silver {
  color: #bfc7ce;
}
.bonus-trophy.trophy-gold {
  color: #ffd700;
}
.bonus-trophy.trophy-red {
  color: var(--eco-error);
}
.bonus-reason {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  align-self: center;
}
.bonus-title {
  font-family: var(--eco-font-family);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--eco-gray-800);
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.bonus-amount {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-3xl);
  font-weight: bold;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: 0;
  text-align: right;
  align-self: center;
  margin-right: 8px; 
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
  margin: 0;
  padding: 0;
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
  color: var(--eco-gray-600);
}

/* Отзывчивость */
@media (max-width: 480px) {
  .stats-section {
    padding: var(--eco-space-3);
  }
  .filters-section {
    padding: 0 var(--eco-space-3) var(--eco-space-3);
  }
  .history-section {
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
  .bonus-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--eco-space-2);
  }
  .eco-card {
    margin-bottom: var(--eco-space-2);
    padding: var(--eco-space-3);
  }
  .all-bonuses-list {
    gap: var(--eco-space-2);
  }
}
.eco-card {
  margin-bottom: var(--eco-space-3);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-4);
  box-shadow: var(--eco-shadow-sm);
  transition: all var(--eco-transition-normal);
}
</style> 
