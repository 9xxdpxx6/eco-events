<template>
  <ion-page class="profile-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title" @click="scrollToTop">Мой профиль</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content ref="contentRef" class="profile-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Hero секция профиля -->
      <div class="profile-hero">
        <div class="hero-background"></div>
        <div class="hero-content">
          <div class="profile-avatar">
            <ion-icon :icon="personCircleOutline" />
          </div>
            <div class="profile-info">
            <h1 class="profile-name">{{ user?.fullName || 'Волонтер' }}</h1>
            <p class="profile-role">Экологический волонтер</p>
            <div class="profile-status">
              <ion-chip class="status-chip active">
                <ion-icon :icon="checkmarkCircleOutline" />
                <ion-label>Активен</ion-label>
              </ion-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="stats-section">
        <h2 class="section-title">Моя активность</h2>
        
        <!-- Загрузка статистики -->
        <div v-if="isLoadingStatistics" class="stats-grid">
          <div v-for="n in 3" :key="n" class="stat-card eco-card loading">
            <div class="stat-icon">
              <ion-skeleton-text :animated="true" style="width: 32px; height: 32px; border-radius: 50%"></ion-skeleton-text>
            </div>
            <div class="stat-content">
              <ion-skeleton-text :animated="true" style="width: 60px; height: 24px; margin-bottom: 8px"></ion-skeleton-text>
              <ion-skeleton-text :animated="true" style="width: 80px; height: 14px"></ion-skeleton-text>
            </div>
          </div>
        </div>
        
        <!-- Данные статистики -->
        <div v-else class="stats-grid">
          <div class="stat-card eco-card">
            <div class="stat-icon events">
              <ion-icon :icon="calendarOutline" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.eventsAttended }}</div>
              <div class="stat-label">Мероприятий</div>
            </div>
          </div>
          
          <div class="stat-card eco-card">
            <div class="stat-icon points">
              <ion-icon :icon="trophyOutline" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.points }}</div>
              <div class="stat-label">Бонусов</div>
            </div>
          </div>
          
          <div class="stat-card eco-card">
            <div class="stat-icon hours">
              <ion-icon :icon="timeOutline" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.hoursVolunteered }}</div>
              <div class="stat-label">Часов</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Мероприятия -->
      <div class="events-section">
        <div class="events-card eco-card">
          
          <div class="events-tabs">
            <ion-segment v-model="selectedTab" class="custom-segment">
              <ion-segment-button value="upcoming" class="segment-button">
                <ion-label>Предстоящие</ion-label>
                <span class="tab-count upcoming-count" v-if="upcomingEventsCount > 0">{{ upcomingEventsCount }}</span>
              </ion-segment-button>
              <ion-segment-button value="past" class="segment-button">
                <ion-label>Прошедшие</ion-label>
                <span class="tab-count past-count" v-if="pastEventsCount > 0">{{ pastEventsCount }}</span>
              </ion-segment-button>
            </ion-segment>
          </div>

          <div class="events-content">
            <!-- Загрузка мероприятий -->
            <div v-if="isLoadingEvents" class="loading-events">
              <div class="loading-spinner">
                <ion-spinner name="crescent" color="primary"></ion-spinner>
              </div>
              <p class="loading-text">Загружаем мероприятия...</p>
            </div>
            
            <!-- Данные мероприятий -->
            <div v-else>
              <!-- Предстоящие мероприятия -->
              <div v-if="selectedTab === 'upcoming'" class="events-list">
                <div v-if="upcomingEvents.length > 0" class="event-items">
                  <div 
                    v-for="event in upcomingEvents" 
                    :key="event.event.id"
                    class="event-item eco-list-item"
                    @click="openEventDetails(event.event.id!)"
                  >
                    <div class="event-icon upcoming">
                      <ion-icon :icon="calendarOutline" />
                    </div>
                    <div class="event-content">
                      <h4 class="event-title">{{ event.event.title }}</h4>
                      <div class="event-meta">
                        <div class="meta-item">
                          <ion-icon :icon="timeOutline" />
                          <span>{{ formatDate(event.event.startTime) }}</span>
                        </div>
                        <div class="meta-item">
                          <ion-icon :icon="locationOutline" />
                          <span>{{ event.event.location || 'Место не указано' }}</span>
                        </div>
                      </div>
                    </div>
                    <ion-button 
                      fill="clear" 
                      size="small"
                      class="leave-button" 
                      @click.stop="leaveEvent(event)"
                    >
                      <ion-icon :icon="closeOutline" />
                    </ion-button>
                  </div>
                </div>
                
                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <ion-icon :icon="calendarOutline" />
                  </div>
                  <h3 class="empty-title">Нет предстоящих мероприятий</h3>
                  <p class="empty-subtitle">Найдите интересные экологические мероприятия и запишитесь!</p>
                  <ion-button fill="outline" @click="goToEvents" class="action-button">
                    Найти мероприятия
                  </ion-button>
                </div>
              </div>

              <!-- Прошедшие мероприятия -->
              <div v-if="selectedTab === 'past'" class="events-list">
                <div v-if="pastEvents.length > 0" class="event-items">
                  <div 
                    v-for="event in pastEvents" 
                    :key="event.event.id"
                    class="event-item eco-list-item completed"
                    @click="openEventDetails(event.event.id!)"
                  >
                    <div class="event-icon completed">
                      <ion-icon :icon="checkmarkCircleOutline" />
                    </div>
                    <div class="event-content">
                      <h4 class="event-title">{{ event.event.title }}</h4>
                      <div class="event-meta">
                        <div class="meta-item">
                          <ion-icon :icon="timeOutline" />
                          <span>{{ formatDate(event.event.startTime) }}</span>
                        </div>
                        <div class="meta-item">
                          <ion-icon :icon="locationOutline" />
                          <span>{{ event.event.location || 'Место не указано' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="completed-badge">
                      <ion-icon :icon="flagOutline" />
                    </div>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <ion-icon :icon="trophyOutline" />
                  </div>
                  <h3 class="empty-title">Нет завершённых мероприятий</h3>
                  <p class="empty-subtitle">Участвуйте в мероприятиях и зарабатывайте достижения!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Настройки -->
      <div class="settings-section">
        <div class="settings-card eco-card">
          <div class="card-header">
            <h2 class="section-title">Настройки</h2>
          </div>
          
          <div class="settings-content">
            <!-- Основные настройки -->
            <div class="settings-group">
              <h3 class="group-title">Аккаунт</h3>
              <div class="settings-items">
                <div class="setting-item" @click="editProfile">
                  <div class="setting-icon">
                    <ion-icon :icon="createOutline" />
                  </div>
                  <div class="setting-content">
                    <div class="setting-title">Редактировать профиль</div>
                    <div class="setting-subtitle">Имя, контакты и другая информация</div>
                  </div>
                  <ion-icon :icon="chevronForwardOutline" class="setting-arrow" />
                </div>
                
                <div class="setting-item" @click="showNotificationSettings">
                  <div class="setting-icon">
                    <ion-icon :icon="notificationsOutline" />
                  </div>
                  <div class="setting-content">
                    <div class="setting-title">Уведомления</div>
                    <div class="setting-subtitle">Настройки push-уведомлений</div>
                  </div>
                  <ion-icon :icon="chevronForwardOutline" class="setting-arrow" />
                </div>
              </div>
            </div>

            <!-- Информация -->
            <div class="settings-group">
              <h3 class="group-title">Информация</h3>
              <div class="settings-items">
                <div class="setting-item" @click="showAbout">
                  <div class="setting-icon">
                    <ion-icon :icon="informationCircleOutline" />
                  </div>
                  <div class="setting-content">
                    <div class="setting-title">О приложении</div>
                    <div class="setting-subtitle">Версия и информация</div>
                  </div>
                  <ion-icon :icon="chevronForwardOutline" class="setting-arrow" />
                </div>
              </div>
            </div>

            <!-- Выход -->
            <div class="settings-group">
              <div class="settings-items">
                <div class="setting-item danger" @click="logout">
                  <div class="setting-icon">
                    <ion-icon :icon="logOutOutline" />
                  </div>
                  <div class="setting-content">
                    <div class="setting-title">Выйти из аккаунта</div>
                    <div class="setting-subtitle">Завершить сеанс работы</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

    <!-- Eco Leave Event Dialog -->
    <EcoDialog
      :is-open="showLeaveEventDialog"
      title="Отменить участие"
      :message="eventToLeave ? `Вы уверены, что хотите отменить участие в мероприятии ${eventToLeave.event?.title}?` : 'Вы уверены, что хотите отменить участие?'"
      confirm-text="Да, отменить"
      cancel-text="Отмена"
      @confirm="handleLeaveEventConfirm"
      @cancel="handleLeaveEventCancel"
      @dismiss="handleLeaveEventCancel"
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
  IonButton,
  IonButtons,
  IonIcon,
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import {
  personCircleOutline,
  logOutOutline,
  checkmarkCircleOutline,
  calendarOutline,
  trophyOutline,
  timeOutline,
  closeOutline,
  createOutline,
  notificationsOutline,
  informationCircleOutline,
  chevronForwardOutline,
  locationOutline,
  flagOutline
} from 'ionicons/icons';
import { useAuthStore } from '../../stores';
import { useParticipantsStore } from '../../stores';
import EcoDialog from '../../components/EcoDialog.vue';
import type { EventParticipantWithEventDetailsDTO } from '../../types/api';
import { usersApi } from '../../api/users';
import { bonusHistoryApi } from '../../api/bonuses';
import { participantsApi } from '../../api/participants';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const router = useRouter();
const authStore = useAuthStore();
const participantsStore = useParticipantsStore();

const contentRef = ref();

const user = computed(() => {
  console.log('User:', authStore.user);
  return authStore.user;
});
const statistics = ref({
  eventsAttended: 0,
  points: 0,
  hoursVolunteered: 0
});
const selectedTab = ref('upcoming');
const upcomingEvents = ref<EventParticipantWithEventDetailsDTO[]>([]);
const pastEvents = ref<EventParticipantWithEventDetailsDTO[]>([]);
const upcomingEventsCount = ref(0);
const pastEventsCount = ref(0);

// Состояния загрузки
const isLoadingProfile = ref(true);
const isLoadingStatistics = ref(true);
const isLoadingEvents = ref(true);

// Dialog states
const showLogoutDialog = ref(false);
const showLeaveEventDialog = ref(false);
const showAboutDialog = ref(false);
const eventToLeave = ref<EventParticipantWithEventDetailsDTO | null>(null);

const loadStatistics = async () => {
  const userId = user.value?.id;
  if (!userId) {
    isLoadingStatistics.value = false;
    return;
  }
  
  isLoadingStatistics.value = true;
  try {
    // Загружаем статистику параллельно
    const [participants, bonusHistory] = await Promise.all([
      participantsStore.fetchUserParticipants(userId).then(() => participantsStore.getUserParticipants),
      bonusHistoryApi.getByUserId(userId)
    ]);

    // Подсчитываем статистику
    const totalBonusPoints = bonusHistory
      .filter(bonus => bonus.active)
      .reduce((sum, bonus) => sum + bonus.amount, 0);

    statistics.value = {
      eventsAttended: participants.length,
      points: totalBonusPoints,
      hoursVolunteered: participants.length * 2 // Примерно 2 часа на мероприятие
    };
  } catch (error: any) {
    console.error('Error loading statistics:', error);
    if (error?.response?.status === 401) {
      await showErrorToast('Не авторизован', 3000);
    } else if (error?.response?.status !== 404) {
      // Игнорируем 404 ошибки
    }
  } finally {
    isLoadingStatistics.value = false;
  }
};

const loadUserEvents = async () => {
  const userId = user.value?.id;
  if (!userId) {
    isLoadingEvents.value = false;
    return;
  }
  
  isLoadingEvents.value = true;
  try {
    console.log('Loading events for user:', userId);
    
    // Форматируем дату в YYYY-MM-DDTHH:mm:ss
    const now = new Date().toISOString().slice(0, 19);

    // Загружаем данные параллельно
    const [
      upcomingData,
      pastData,
    ] = await Promise.all([
      // Получаем 10 предстоящих событий
      participantsApi.search({ 
        userId: userId, 
        eventStartTimeFrom: now,
        status: 'CONFIRMED',
        membershipStatus: 'VALID',
        sortBy: 'event.startTime',
        sortOrder: 'ASC',
        page: 0,
        size: 10
      }),
      // Получаем 10 прошедших событий
      participantsApi.search({
        userId: userId, 
        eventStartTimeTo: now,
        status: 'CONFIRMED',
        membershipStatus: 'VALID',
        sortBy: 'event.startTime',
        sortOrder: 'DESC',
        page: 0,
        size: 10
      }),
    ]);

    // Обновляем общее количество для badge из результатов поиска
    upcomingEventsCount.value = upcomingData.totalElements;
    pastEventsCount.value = pastData.totalElements;
    
    upcomingEvents.value = upcomingData.content;
    pastEvents.value = pastData.content;

    console.log('Total Upcoming:', upcomingEventsCount.value, 'Total Past:', pastEventsCount.value);
    console.log('Displayed Upcoming:', upcomingEvents.value.length, 'Displayed Past:', pastEvents.value.length);

  } catch (error: any) {
    console.error('Error loading user events:', error);
    if (error?.response?.status === 401) {
      await showErrorToast('Не авторизован', 3000);
    } else if (error?.response?.status !== 404) {
      // Игнорируем 404 ошибки
      console.warn('API returned 404, no events found for user');
    }
  } finally {
    isLoadingEvents.value = false;
  }
};

const openEventDetails = (eventId: number) => {
  router.push(`/event/${eventId}`);
};

const goToEvents = () => {
  router.push('/tabs/events-list');
};

const leaveEvent = (event: EventParticipantWithEventDetailsDTO) => {
  if (!event.event.id) return;
  eventToLeave.value = event;
  showLeaveEventDialog.value = true;
};

const handleLeaveEventConfirm = async () => {
  const event = eventToLeave.value;
  if (!event?.event.id) return;
  
  showLeaveEventDialog.value = false;
  
  try {
    const userId = user.value?.id;
    if (!userId || !event.event.id) return;
    
    await participantsStore.unregisterFromEvent(userId, event.event.id);
    
    // Быстро обновляем UI - удаляем событие из списка
    upcomingEvents.value = upcomingEvents.value.filter(e => e.event.id !== event.event.id);
    
    // Перезагружаем статистику в фоне
    loadStatistics();
    
    await showSuccessToast('Участие отменено', 2000);
  } catch (error) {
    console.error('Error leaving event:', error);
    await showErrorToast('Ошибка при отмене участия', 3000);
  }
};

const handleLeaveEventCancel = () => {
  showLeaveEventDialog.value = false;
  eventToLeave.value = null;
};

const handleAboutConfirm = () => {
  showAboutDialog.value = false;
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

const handleRefresh = async (event: any) => {
  await Promise.all([loadStatistics(), loadUserEvents()]);
  event.target.complete();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const scrollToTop = async () => {
  if (contentRef.value) {
    await contentRef.value.$el.scrollToTop(300);
  }
};

onMounted(async () => {
  isLoadingProfile.value = true;
  
  try {
    // Проверяем, что пользователь авторизован (router guard уже восстановил данные)
    if (!user.value) {
      router.push('/login');
      return;
    }

    // Загружаем свежую информацию о пользователе, если её нет
    if (!user.value?.fullName) {
      const id = user.value?.id;
      if (id) {
        try {
          const freshUser = await usersApi.getById(id);
          authStore.user = { ...freshUser, token: authStore.user?.token ?? '' };
        } catch (e) {
          console.error('Error loading user data:', e);
          // Если не удалось загрузить данные пользователя, возможно токен истек
          if (e && typeof e === 'object' && 'response' in e && (e as any).response?.status === 401) {
            authStore.logout();
            router.push('/login');
            return;
          }
        }
      }
    }

    // Загружаем данные профиля параллельно для максимального ускорения
    const startTime = Date.now();
    await Promise.all([
      loadStatistics(),
      loadUserEvents()
    ]);
    const loadTime = Date.now() - startTime;
    console.log(`Profile data loaded in ${loadTime}ms`);
  } finally {
    isLoadingProfile.value = false;
  }
});
</script>

<style scoped>
.profile-page {
  --background: var(--eco-background-secondary);
}

/* Убираем тень у header */
.profile-page ion-header {
  box-shadow: none !important;
  --box-shadow: none !important;
  position: relative;
  z-index: 1000;
}

.profile-page ion-toolbar {
  box-shadow: none !important;
  --box-shadow: none !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-content {
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





/* Hero секция */
.profile-hero {
  position: relative;
  padding: var(--eco-space-8) var(--eco-space-3) var(--eco-space-6);
  margin-bottom: var(--eco-space-3);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-secondary) 100%);
  border-radius: 0 0 var(--eco-radius-xl) var(--eco-radius-xl);
  z-index: 1;
}

.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  z-index: 2;
}

.profile-avatar {
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-4);
}

.profile-avatar ion-icon {
  font-size: 80px;
  color: white;
}

.profile-name {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-2xl);
  font-weight: var(--eco-font-weight-bold);
  margin: 0 0 var(--eco-space-1) 0;
  color: white;
}

.profile-role {
  font-size: var(--eco-font-size-base);
  margin: 0 0 var(--eco-space-4) 0;
  color: rgba(255, 255, 255, 0.8);
}

.profile-status {
  display: flex;
  justify-content: center;
}

.status-chip {
  --background: rgba(255, 255, 255, 0.2);
  --color: white;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Статистика */
.stats-section {
  padding: var(--eco-space-3);
}

.section-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: var(--eco-space-2) 0 var(--eco-space-4) 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--eco-space-3);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--eco-space-5);
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  border-radius: var(--eco-radius-lg);
  margin-bottom: var(--eco-space-2);
  transition: all var(--eco-transition-normal);
}



.stat-icon {
  width: auto;
  height: auto;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-3);
  background: none;
}

.stat-icon.events ion-icon {
  color: var(--eco-primary);
}

.stat-icon.points ion-icon {
  color: var(--eco-warning);
}

.stat-icon.hours ion-icon {
  color: var(--eco-success);
}

.stat-icon ion-icon {
  font-size: 48px;
}

.stat-number {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-2xl);
  font-weight: var(--eco-font-weight-bold);
  color: var(--eco-gray-800);
  margin-bottom: var(--eco-space-1);
  line-height: 1;
}

.stat-label {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-500);
  font-weight: var(--eco-font-weight-medium);
}

/* Загрузка статистики */
.stat-card.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Мероприятия */
.events-section {
  padding: 0 var(--eco-space-3) var(--eco-space-3);
  margin-top: var(--eco-space-3);
}

/* === EVENTS TABS === */
.events-card.eco-card {
  background: var(--eco-white);
  border-radius: var(--eco-radius-xl);
  border: 1px solid var(--eco-gray-200);
  padding: 0; /* убираем отступы */
  box-shadow: none; /* убираем тень */
}

.custom-segment {
  --background: transparent;
  padding: 0;
  border-bottom: none;
  margin-bottom: var(--eco-space-3);
}

.segment-button {
  flex: 1;
  min-height: auto;
  --padding-top: 0.6rem;
  --padding-bottom: 0.6rem;
  --border-radius: 0px; /* Убираем глобальное скругление */
  --indicator-color: transparent !important;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: visible;
}

.segment-button:first-of-type {
  border-top-left-radius: var(--eco-radius-lg);
  border-bottom-left-radius: var(--eco-radius-lg);
}

.segment-button:last-of-type {
  border-top-right-radius: var(--eco-radius-lg);
  border-bottom-right-radius: var(--eco-radius-lg);
}

.segment-button:not(.segment-button-checked) {
  --background: var(--eco-gray-100);
  --color: var(--eco-gray-700);
}

.segment-button-checked {
  --background: var(--eco-primary);
  --color: white;
  font-weight: var(--eco-font-weight-semibold);
  transform: none; /* убираем эффект поднятия */
  box-shadow: none; /* убираем тень */
}

.events-content {
  padding: 0;
}

.tab-count {
  color: var(--eco-white);
  position: absolute;
  top: 2px; /* поднимаем */
  right: 2px; /* сдвигаем вправо */
  z-index: 2;
  font-size: var(--eco-font-size-xs);
  min-width: 18px;
  padding: 2px 5px;
  border-radius: 9px;
  line-height: 1.3;
}

.tab-count.upcoming-count {
  background: var(--eco-info);
}

.tab-count.past-count {
  background: var(--eco-success);
}

.events-content {
  min-height: 200px;
  padding: 0 var(--eco-space-4) var(--eco-space-4);
}

/* Загрузка мероприятий */
.loading-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--eco-space-6) 0;
}

.loading-spinner {
  margin-bottom: var(--eco-space-4);
}

.loading-text {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-600);
  margin: 0 0 var(--eco-space-6) 0;
  text-align: center;
}

.event-item.loading {
  opacity: 0.7;
  pointer-events: none;
  cursor: default;
}

.event-items {
  display: flex;
  flex-direction: column;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: var(--eco-space-3);
  padding: var(--eco-space-4);
  background: var(--eco-gray-50);
  border-radius: var(--eco-radius-lg);
  border: 1px solid var(--eco-gray-200);
  margin-bottom: var(--eco-space-2);
  cursor: pointer;
  transition: all var(--eco-transition-normal);
}



.event-item.completed {
  opacity: 0.8;
}

.event-icon {
  width: auto;
  height: auto;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: none;
}

.event-icon.upcoming ion-icon {
  color: var(--eco-primary);
}

.event-icon.completed ion-icon {
  color: var(--eco-success);
}

.event-icon ion-icon {
  font-size: 40px;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-2) 0;
  line-height: var(--eco-line-height-tight);
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-1);
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: var(--eco-space-2);
  font-size: var(--eco-font-size-xs);
  color: var(--eco-gray-500);
}

.meta-item ion-icon {
  font-size: 14px;
  color: var(--eco-gray-600);
  flex-shrink: 0;
}

.leave-button {
  --color: var(--eco-error);
  flex-shrink: 0;
}

.completed-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  color: var(--eco-info);
  flex-shrink: 0;
}

.completed-badge ion-icon {
  font-size: 20px;
}

/* Пустые состояния */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eco-space-8) var(--eco-space-4);
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-4);
}

.empty-icon ion-icon {
  font-size: 48px;
  color: var(--eco-gray-500);
}

.empty-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-700);
  margin: 0 0 var(--eco-space-2) 0;
}

.empty-text {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-600);
  line-height: var(--eco-line-height-relaxed);
  margin: 0 0 var(--eco-space-6) 0;
}

.empty-subtitle {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-500);
  margin: 0 0 var(--eco-space-4) 0;
  max-width: 280px;
}

.action-button {
  --border-color: var(--eco-gray-300);
  --color: var(--eco-gray-700);
}

/* Настройки */
.settings-section {
  padding: 0 var(--eco-space-3) var(--eco-space-3);
  margin-top: var(--eco-space-3);
}

.settings-card {
  background: var(--eco-white);
  border: 1px solid var(--eco-gray-200);
  margin-bottom: var(--eco-space-2);
}

.settings-group {
  margin-bottom: var(--eco-space-4);
}

.settings-group:last-child {
  margin-bottom: 0;
}

.settings-content {
  padding: 0 var(--eco-space-4) var(--eco-space-4);
}

.group-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-600);
  margin: 0 0 var(--eco-space-3) 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-items {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-3);
  padding: var(--eco-space-4);
  background: var(--eco-gray-50);
  border-radius: var(--eco-radius-lg);
  margin-bottom: var(--eco-space-2);
  cursor: pointer;
  transition: all var(--eco-transition-normal);
}



.setting-item.danger {
  background: var(--eco-error-light);
}



.setting-item.danger .setting-icon {
  background: none;
}

.setting-item.danger .setting-title {
  color: var(--eco-error);
}



.setting-icon {
  width: auto;
  height: auto;
  background: none;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.setting-icon ion-icon {
  font-size: 40px;
  color: var(--eco-primary);
}

.setting-item.danger .setting-icon ion-icon {
    color: var(--eco-error);
}

.setting-content {
  flex: 1;
  min-width: 0;
}

.setting-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-1) 0;
}

.setting-subtitle {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-500);
  margin: 0;
}

.setting-arrow {
  font-size: 16px;
  color: var(--eco-gray-600);
  flex-shrink: 0;
}

/* Отзывчивость */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--eco-space-3);
  }
  
  .stat-card {
    flex-direction: row;
    text-align: left;
  }
  
  .stat-icon {
    margin-bottom: 0;
    margin-right: var(--eco-space-3);
    flex-shrink: 0;
  }
  
  .profile-hero {
    padding: var(--eco-space-6) var(--eco-space-3) var(--eco-space-4);
    margin-bottom: var(--eco-space-3);
  }
  
  .profile-name {
    font-size: var(--eco-font-size-xl);
  }
  
  .event-meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--eco-space-3);
  }
  
  .meta-item {
    font-size: var(--eco-font-size-sm);
  }
  
  /* Адаптация загрузчиков для мобильных */
  .loading-events {
    padding: var(--eco-space-4) 0;
  }
  
  .loading-text {
    font-size: var(--eco-font-size-sm);
  }
}

.refresh-icon {
  font-size: 20px;
  color: var(--eco-gray-600);
}
</style> 
