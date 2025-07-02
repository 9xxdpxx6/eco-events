<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Мои записи</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Мои записи</ion-title>
        </ion-toolbar>
      </ion-header>
    
      <div class="search-filters-row">
        <ion-searchbar v-model="searchText" placeholder="Поиск мероприятий..." />
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
      </div>

      <ion-list v-if="!isLoading && filteredRegistrations.length > 0">
        <ion-item v-for="reg in filteredRegistrations" :key="reg.eventId" button @click="goToEvent(reg.eventId)">
          <ion-label>
            <h2>{{ reg.eventName }}</h2>
            <RegistrationStatus :status="reg.status" />
            <div class="meta-item" v-if="reg.createdAt">
              <ion-icon :icon="calendarOutline" />
              <span>{{ formatDate(reg.createdAt) }}</span>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>

      <div v-if="isLoading" class="container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-if="!isLoading && error" class="container">
        <strong>Ошибка при загрузке записей: {{ error.message }}</strong>
      </div>

      <div v-if="!isLoading && registrations.length === 0" class="container">
        <strong>Вы еще не записались ни на одно мероприятие.</strong>
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
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonSearchbar
} from '@ionic/vue';
import { participantsApi } from '../api/participants';
import { useAuthStore } from '../stores/auth';
import type { EventParticipantDTO } from '../types/api';
import { calendarOutline } from 'ionicons/icons';
import RegistrationStatus from '../components/RegistrationStatus.vue';

const authStore = useAuthStore();
const router = useRouter();

const registrations = ref<EventParticipantDTO[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);

const searchText = ref('');
const dateFrom = ref<string>('');
const dateTo = ref<string>('');
const dateFromRef = ref<HTMLInputElement | null>(null);
const dateToRef = ref<HTMLInputElement | null>(null);

const dateFromDisplay = computed(() => dateFrom.value ? formatDateInput(dateFrom.value) : '');
const dateToDisplay = computed(() => dateTo.value ? formatDateInput(dateTo.value) : '');

function openDatePicker(type: 'from' | 'to') {
  if (type === 'from' && dateFromRef.value) dateFromRef.value.showPicker();
  if (type === 'to' && dateToRef.value) dateToRef.value.showPicker();
}

function formatDateInput(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU');
}

const filteredRegistrations = computed(() => {
  return registrations.value.filter(reg => {
    // Поиск по названию
    const matchesSearch = reg.eventName?.toLowerCase().includes(searchText.value.toLowerCase());
    // Фильтр по дате
    let from = true, to = true;
    if (dateFrom.value && reg.createdAt) {
      const fromDate = new Date(dateFrom.value + 'T00:00:00');
      const regDate = new Date(reg.createdAt);
      from = regDate >= fromDate;
    }
    if (dateTo.value && reg.createdAt) {
      const toDate = new Date(dateTo.value + 'T23:59:59');
      const regDate = new Date(reg.createdAt);
      to = regDate <= toDate;
    }
    return matchesSearch && from && to;
  });
});

const applyDateFilter = () => {};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${day} в ${time}`;
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

onMounted(fetchRegistrations);
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

.search-filters-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px;
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

.filter-input-wrapper {
  position: relative;
  width: 100%;
  cursor: pointer;
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
</style> 