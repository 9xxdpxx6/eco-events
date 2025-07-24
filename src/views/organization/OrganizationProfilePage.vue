<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Профиль организации</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-text="Потяните для обновления"
          refreshing-text="Обновляем данные..."
        ></ion-refresher-content>
      </ion-refresher>
      <!-- Информация об организации -->
      <ion-card class="profile-card">
        <ion-card-content>
          <div class="profile-header">
            <div class="profile-avatar">
              <ion-icon :icon="businessOutline"></ion-icon>
            </div>
            <div class="profile-info">
              <h2>{{ user?.fullName || user?.login || 'Организация' }}</h2>
              <p class="user-login">{{ user?.login }}</p>
              <p class="organization-type">Экологическая организация</p>
              <div v-if="user?.email || user?.phoneNumber" class="contact-info">
                <p v-if="user?.email" class="contact-item">
                  <ion-icon :icon="mailOutline" />
                  <span>{{ user.email }}</span>
                </p>
                <p v-if="user?.phoneNumber" class="contact-item">
                  <ion-icon :icon="callOutline" />
                  <span>{{ user.phoneNumber }}</span>
                </p>
              </div>
              <ion-chip color="primary">
                <ion-icon :icon="checkmarkCircleOutline" />
                <ion-label>Верифицирована</ion-label>
              </ion-chip>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Статистика организации -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Статистика</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="stats-grid">
            <div class="stat-item">
              <ion-icon :icon="calendarOutline" color="primary"></ion-icon>
              <span class="stat-number">{{ formatNumberSafe(statistics.upcomingEvents) }}</span>
              <span class="stat-label">Предстоит</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="checkmarkDoneOutline" color="success"></ion-icon>
              <span class="stat-number">{{ formatNumberSafe(statistics.completedEvents) }}</span>
              <span class="stat-label">Проведено</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="peopleOutline" color="secondary"></ion-icon>
              <span class="stat-number">{{ formatNumberSafe(statistics.totalVisitors) }}</span>
              <span class="stat-label">Всего посетителей</span>
            </div>
            <!-- <div class="stat-item">
              <ion-icon :icon="ribbonOutline" color="warning"></ion-icon>
              <span class="stat-number">{{ formatNumberSafe(statistics.totalBonusesAwarded) }}</span>
              <span class="stat-label">Бонусов начислено</span>
            </div> -->
          </div>
          
          <!-- Типы мероприятий -->
          <div v-if="statistics.eventTypes.length > 0" class="event-types-section">
            <h3 class="event-types-title">Типы проводимых мероприятий</h3>
            <div class="event-types-list">
              <ion-chip v-for="type in statistics.eventTypes" :key="type" class="event-type-chip">
                <ion-label>{{ type }}</ion-label>
              </ion-chip>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Быстрые действия -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Быстрые действия</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="actions-grid">
            <ion-button expand="block" @click="createEvent">
              <ion-icon :icon="addOutline" slot="start" />
              Создать мероприятие
            </ion-button>
            <ion-button expand="block" @click="viewEvents">
              <ion-icon :icon="listOutline" slot="start" />
              Мои мероприятия
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Настройки -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Настройки</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item button @click="editProfile">
              <ion-icon :icon="createOutline" slot="start"></ion-icon>
              <ion-label>Редактировать профиль</ion-label>
            </ion-item>
            <ion-item button @click="showNotificationSettings">
              <ion-icon :icon="notificationsOutline" slot="start"></ion-icon>
              <ion-label>Уведомления</ion-label>
            </ion-item>
            <ion-item button @click="showAbout">
              <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
              <ion-label>О приложении</ion-label>
            </ion-item>
            <ion-item button @click="logout">
              <ion-icon :icon="logOutOutline" slot="start" color="danger"></ion-icon>
              <ion-label color="danger">Выйти</ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <!-- Eco Logout Dialog -->
    <EcoDialog
      :is-open="showLogoutDialog"
      title="Выйти"
      message="Вы уверены, что хотите выйти из аккаунта?"
      confirm-text="Выйти"
      cancel-text="Отмена"
      :is-destructive="true"
      @confirm="handleLogoutConfirm"
      @cancel="handleLogoutCancel"
      @dismiss="handleLogoutCancel"
    />

    <!-- Eco About Dialog -->
    <EcoDialog
      :is-open="showAboutDialog"
      title="О приложении"
      message="EcoEvents - приложение для организации и участия в экологических мероприятиях.

Версия: 1.0.0"
      confirm-text="OK"
      :hide-cancel="true"
      @confirm="handleAboutConfirm"
      @dismiss="handleAboutConfirm"
    />
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
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonButtons,
  IonIcon,
  IonAvatar,
  IonChip,
  IonLabel,
  IonList,
  IonItem,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import {
  businessOutline,
  logOutOutline,
  checkmarkCircleOutline,
  calendarOutline,
  peopleOutline,
  trophyOutline,
  addOutline,
  listOutline,
  createOutline,
  notificationsOutline,
  informationCircleOutline,
  checkmarkDoneOutline,
  cardOutline,
  ribbonOutline,
  mailOutline,
  callOutline
} from 'ionicons/icons';
import { useAuthStore } from '../../stores/auth';
import { useEventsStore } from '../../stores';
import { useParticipantsStore } from '../../stores';
import EcoDialog from '../../components/EcoDialog.vue';
import { formatNumberSafe } from '../../utils/formatNumbers';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { usersApi } from '../../api/users';

const router = useRouter();
const authStore = useAuthStore();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();

const user = computed(() => authStore.user);
const statistics = ref({
  totalEvents: 0,
  conductedEvents: 0,
  totalVisitors: 0,
  eventTypes: [] as string[],
  totalBonusesAwarded: 0,
  completedEvents: 0,
  upcomingEvents: 0
});

// Dialog states
const showLogoutDialog = ref(false);
const showAboutDialog = ref(false);

const loadStatistics = async () => {
  try {
    const userId = user.value?.id;
    if (!userId) return;
    
    // Получаем статистику организации через API
    const stats = await usersApi.getOrganizationStats(userId);
    
    // Обновляем статистику с данными из API
    statistics.value = {
      totalEvents: stats.totalEvents,
      conductedEvents: stats.conductedEvents,
      totalVisitors: stats.totalParticipants,
      eventTypes: stats.eventTypes,
      totalBonusesAwarded: stats.totalBonusesAccrued,
      completedEvents: stats.completedEvents,
      upcomingEvents: stats.upcomingEvents
    };
    
  } catch (error) {
    console.error('Error loading statistics:', error);
    await showErrorToast('Ошибка загрузки статистики', 3000);
  }
};

const createEvent = () => {
  router.push('/create-event');
};

const viewEvents = () => {
  router.push('/tabs/events-management');
};

const editProfile = () => {
  router.push('/edit-profile');
};



const showNotificationSettings = () => {
  router.push('/notification-settings');
};

const showAbout = () => {
  showAboutDialog.value = true;
};

const logout = () => {
  showLogoutDialog.value = true;
};

const handleLogoutConfirm = async () => {
  showLogoutDialog.value = false;
  
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
    await showErrorToast('Ошибка при выходе из аккаунта', 3000);
  }
};

const handleLogoutCancel = () => {
  showLogoutDialog.value = false;
};

const handleAboutConfirm = () => {
  showAboutDialog.value = false;
};

const handleRefresh = async (event: any) => {
  await loadStatistics();
  event.target.complete();
};

onMounted(() => {
  loadStatistics();
});

defineExpose({
  handleRefresh
});
</script>

<style scoped>
.ion-page {
  --background: var(--eco-background-secondary, #f8f9fa);
}

.ion-header {
  box-shadow: 0 2px 8px 0 rgba(255,255,255,0.8);
  z-index: 10;
}

.ion-content {
  --background: var(--eco-background-secondary, #f8f9fa);
}

/* Заголовок страницы */
.ion-title {
  font-weight: 600;
  color: var(--eco-gray-800, #1a1a1a);
}

/* Карточки */
.profile-card {
  margin: 16px;
  background: var(--eco-white, #ffffff);
  border-radius: 16px;
  box-shadow: none;
  transition: all 0.2s ease;
}



ion-card {
  background: var(--eco-white, #ffffff);
  border-radius: 16px;
  box-shadow: none;
  margin: 16px;
  transition: all 0.2s ease;
}



/* Заголовки карточек */
ion-card-title {
  font-family: var(--eco-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--eco-gray-800, #1a1a1a);
  margin-bottom: 16px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0 0 4px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--eco-gray-800, #1a1a1a);
}

.profile-info p {
  margin: 0 0 8px;
  color: var(--eco-gray-500, #6b7280);
  font-size: 1rem;
}

.profile-info .user-login {
  margin: 0 0 4px;
  color: var(--eco-gray-400, #9ca3af);
  font-size: 0.875rem;
}

.profile-info .organization-type {
  margin: 0 0 8px;
  color: var(--eco-gray-500, #6b7280);
  font-size: 1rem;
}

.profile-info .contact-info {
  margin: 0 0 8px;
}

.profile-info .contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px;
  color: var(--eco-gray-500, #6b7280);
  font-size: 0.875rem;
}

.profile-info .contact-item ion-icon {
  font-size: 16px;
  color: var(--eco-gray-400, #9ca3af);
  flex-shrink: 0;
}

.profile-info .contact-item span {
  color: var(--eco-gray-600, #4b5563);
}

/* Иконка профиля */
.profile-avatar {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-shrink: 0;
  padding-top: 4px;
}

.profile-avatar ion-icon {
  font-size: 48px;
  color: var(--eco-primary, #22c55e);
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--eco-gray-50, #f9fafb);
  border-radius: 12px;
  transition: all 0.2s ease;
}



.stat-item ion-icon {
  font-size: 48px;
}

.stat-item ion-icon[color="primary"] {
  color: var(--eco-primary, #22c55e);
}

.stat-item ion-icon[color="success"] {
  color: var(--eco-success, #10b981);
}

.stat-item ion-icon[color="warning"] {
  color: var(--eco-warning, #f59e0b);
}

.stat-item ion-icon[color="info"] {
  color: var(--eco-info, #3b82f6);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--eco-gray-800, #1a1a1a);
  line-height: 1;
  margin: 0;
}

.stat-label {
  font-size: 1rem;
  color: var(--eco-gray-500, #6b7280);
  font-weight: 500;
  margin: 0;
}

/* Типы мероприятий */
.event-types-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--eco-gray-200, #e5e7eb);
}

.event-types-title {
  font-family: var(--eco-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto);
  font-size: 1rem;
  font-weight: 600;
  color: var(--eco-gray-800, #1a1a1a);
  margin: 0 0 12px 0;
}

.event-types-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.event-type-chip {
  --background: rgba(34, 197, 94, 0.1);
  --color: var(--eco-primary, #22c55e);
  font-weight: 500;
  font-size: 0.875rem;
}

.event-type-chip ion-label {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Быстрые действия */
.actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.actions-grid ion-button {
  --background: var(--eco-gray-50, #f3f4f6);
  --background-hover: var(--eco-gray-200, #e5e7eb);
  --color: var(--eco-gray-700, #374151);
  --border-style: none;
  --box-shadow: none;
  height: 48px;
  font-weight: 500;
  border-radius: 12px;
}

.actions-grid ion-button ion-icon {
  font-size: 20px;
}

/* Настройки */
ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --background: var(--eco-gray-50, #f9fafb);
  --border-color: transparent;
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

ion-item:hover {
  --background: var(--eco-white, #ffffff);
}

ion-item:last-child {
  margin-bottom: 0;
}

ion-item ion-icon[slot="start"] {
  font-size: 30px;
  color: var(--eco-primary, #22c55e);
  margin-right: 12px;
}

ion-item ion-icon[color="danger"] {
  color: var(--eco-error, #ef4444) !important;
}

ion-item ion-label {
  color: var(--eco-gray-800, #1a1a1a);
  font-weight: 500;
  font-size: 1rem;
}

ion-item ion-label[color="danger"] {
  color: var(--eco-error, #ef4444) !important;
  font-weight: 500;
}

/* Чип верификации */
ion-chip {
  --background: rgba(34, 197, 94, 0.1);
  --color: var(--eco-primary, #22c55e);
  font-weight: 500;
}

ion-chip ion-icon {
  font-size: 16px;
  margin-right: 4px;
}

/* Отзывчивость */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    flex-direction: row;
    text-align: left;
    justify-content: flex-start;
  }
  
  .stat-item ion-icon {
    font-size: 40px;
    margin-right: 12px;
  }
  
  .event-types-section {
    margin-top: 16px;
    padding-top: 16px;
  }
  
  .event-types-title {
    font-size: 0.875rem;
    margin-bottom: 8px;
  }
  
  .event-types-list {
    gap: 6px;
  }
  
  .event-type-chip {
    font-size: 0.75rem;
  }
  
  .event-type-chip ion-label {
    font-size: 0.75rem;
  }
  
  .actions-grid {
    gap: 8px;
  }
  
  ion-card {
    margin: 12px;
  }
  
  .profile-card {
    margin: 12px;
  }
}
</style> 
