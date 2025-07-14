<template>
  <ion-page class="profile-page">
    <ion-header>
      <ion-toolbar>
        <ion-title class="page-title">Мой профиль</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="edit-button" @click="editProfile">
            <ion-icon :icon="createOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="profile-content">
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
              
              <!-- Skeleton для мероприятий -->
              <div class="event-items">
                <div v-for="n in 3" :key="n" class="event-item loading">
                  <div class="event-icon">
                    <ion-skeleton-text :animated="true" style="width: 40px; height: 40px; border-radius: 50%"></ion-skeleton-text>
                  </div>
                  <div class="event-content">
                    <ion-skeleton-text :animated="true" style="width: 70%; height: 18px; margin-bottom: 8px"></ion-skeleton-text>
                    <ion-skeleton-text :animated="true" style="width: 50%; height: 14px; margin-bottom: 4px"></ion-skeleton-text>
                    <ion-skeleton-text :animated="true" style="width: 60%; height: 14px"></ion-skeleton-text>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Данные мероприятий -->
            <div v-else>
              <!-- Предстоящие мероприятия -->
              <div v-if="selectedTab === 'upcoming'" class="events-list">
                <div v-if="upcomingEvents.length > 0" class="event-items">
                  <div 
                    v-for="event in upcomingEvents" 
                    :key="event.id"
                    class="event-item eco-list-item"
                    @click="openEventDetails(event.id!)"
                  >
                    <div class="event-icon upcoming">
                      <ion-icon :icon="calendarOutline" />
                    </div>
                    <div class="event-content">
                      <h4 class="event-title">{{ event.title }}</h4>
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
                    :key="event.id"
                    class="event-item eco-list-item completed"
                    @click="openEventDetails(event.id!)"
                  >
                    <div class="event-icon completed">
                      <ion-icon :icon="checkmarkCircleOutline" />
                    </div>
                    <div class="event-content">
                      <h4 class="event-title">{{ event.title }}</h4>
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
                    <div class="completed-badge">
                      <ion-icon :icon="checkmarkCircleOutline" />
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
  alertController,
  toastController
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
  locationOutline
} from 'ionicons/icons';
import { useAuthStore } from '../../stores';
import { useEventsStore } from '../../stores';
import { useParticipantsStore } from '../../stores';
import type { EventResponseMediumDTO } from '../../types/api';
import { usersApi } from '../../api/users';
import { eventsApi } from '../../api/events';
import { bonusHistoryApi } from '../../api/bonuses';

const router = useRouter();
const authStore = useAuthStore();
const eventsStore = useEventsStore();
const participantsStore = useParticipantsStore();

const user = computed(() => authStore.user);
const statistics = ref({
  eventsAttended: 0,
  points: 0,
  hoursVolunteered: 0
});
const selectedTab = ref('upcoming');
const upcomingEvents = ref<EventResponseMediumDTO[]>([]);
const pastEvents = ref<EventResponseMediumDTO[]>([]);
const upcomingEventsCount = ref(0);
const pastEventsCount = ref(0);

// Состояния загрузки
const isLoadingProfile = ref(true);
const isLoadingStatistics = ref(true);
const isLoadingEvents = ref(true);

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
      const toast = await toastController.create({
        message: 'Не авторизован',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
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
    
    // Загружаем участия пользователя
    await participantsStore.fetchUserParticipants(userId);
    const participants = participantsStore.getUserParticipants;
    
    // Получаем уникальные ID событий
    const eventIds = participants.map(p => p.event.id);
    const uniqueEventIds = Array.from(new Set(eventIds));
    
    console.log(`Found ${uniqueEventIds.length} unique events for user`);
    
    // Загружаем только нужные события параллельно (максимум 50)
    const eventsToLoad = uniqueEventIds.slice(0, 50);
    const eventPromises = eventsToLoad.map(eventId => 
      eventsApi.getById(eventId).catch(error => {
        console.warn(`Failed to load event ${eventId}:`, error);
        return null;
      })
    );
    
    const loadedEvents = await Promise.all(eventPromises);
    const userEvents = loadedEvents.filter(event => event !== null) as EventResponseMediumDTO[];

    console.log('Successfully loaded', userEvents.length, 'events');

    // Сортируем по дате начала
    userEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    const now = new Date();
    
    // Фильтруем
    const upcoming = userEvents.filter(event => new Date(event.startTime) > now);
    const past = userEvents.filter(event => new Date(event.startTime) <= now);
    
    // Сохраняем общее количество
    upcomingEventsCount.value = upcoming.length;
    pastEventsCount.value = past.length;
    
    // Ограничиваем количество для отображения
    upcomingEvents.value = upcoming.slice(0, 10);
    pastEvents.value = past.slice(-10).reverse(); // Последние 10 в обратном порядке

    console.log('Total Upcoming:', upcomingEventsCount.value, 'Total Past:', pastEventsCount.value);
  } catch (error: any) {
    console.error('Error loading user events:', error);
    if (error?.response?.status === 401) {
      const toast = await toastController.create({
        message: 'Не авторизован',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
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

const leaveEvent = async (event: EventResponseMediumDTO) => {
  if (!event.id) return;
  const alert = await alertController.create({
    header: 'Отменить участие',
    message: `Вы уверены, что хотите отменить участие в "${event.title}"?`,
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Да, отменить',
        handler: async () => {
          try {
            const userId = user.value?.id;
            if (!userId || !event.id) return;
            
            await participantsStore.unregisterFromEvent(userId, event.id);
            
            // Быстро обновляем UI - удаляем событие из списка
            upcomingEvents.value = upcomingEvents.value.filter(e => e.id !== event.id);
            
            // Перезагружаем статистику в фоне
            loadStatistics();
            
            const toast = await toastController.create({
              message: 'Участие отменено',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          } catch (error) {
            console.error('Error leaving event:', error);
            const toast = await toastController.create({
              message: 'Ошибка при отмене участия',
              duration: 3000,
              color: 'danger'
            });
            await toast.present();
          }
        }
      }
    ]
  });
  await alert.present();
};

const editProfile = () => {
  router.push('/edit-profile');
};

const showNotificationSettings = () => {
  router.push('/notification-settings');
};

const showAbout = async () => {
  const alert = await alertController.create({
    header: 'О приложении',
    message: 'EcoEvents - приложение для организации и участия в экологических мероприятиях. Версия 1.0.0',
    buttons: ['Закрыть']
  });
  await alert.present();
};

const logout = async () => {
  const alert = await alertController.create({
    header: 'Выйти',
    message: 'Вы уверены, что хотите выйти из аккаунта?',
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Выйти',
        handler: async () => {
          try {
            await authStore.logout();
            router.push('/login');
          } catch (error) {
            console.error('Error logging out:', error);
            const toast = await toastController.create({
              message: 'Ошибка при выходе из аккаунта',
              duration: 3000,
              color: 'danger'
            });
            await toast.present();
          }
        }
      }
    ]
  });
  await alert.present();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
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
    if (!user.value?.fullName || !user.value?.login) {
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

.profile-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
}

.edit-button {
  --color: var(--eco-gray-700);
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
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-4);
  backdrop-filter: blur(8px);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.profile-avatar ion-icon {
  font-size: 48px;
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

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--eco-shadow-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-3);
}

.stat-icon.events {
  background: var(--eco-primary);
}

.stat-icon.points {
  background: var(--eco-warning);
}

.stat-icon.hours {
  background: var(--eco-success);
}

.stat-icon ion-icon {
  font-size: 24px;
  color: white;
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
  align-items: center;
  gap: var(--eco-space-3);
  padding: var(--eco-space-4);
  background: var(--eco-gray-50);
  border-radius: var(--eco-radius-lg);
  border: 1px solid var(--eco-gray-200);
  margin-bottom: var(--eco-space-2);
  cursor: pointer;
  transition: all var(--eco-transition-normal);
}

.event-item:hover {
  background: var(--eco-white);
  border-color: var(--eco-gray-300);
  transform: translateY(-1px);
}

.event-item.completed {
  opacity: 0.8;
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-icon.upcoming {
  background: var(--eco-primary);
}

.event-icon.completed {
  background: var(--eco-success);
}

.event-icon ion-icon {
  font-size: 20px;
  color: white;
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

.leave-button {
  --color: var(--eco-error);
  flex-shrink: 0;
}

.completed-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--eco-success);
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
  width: 64px;
  height: 64px;
  background: var(--eco-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-4);
}

.empty-icon ion-icon {
  font-size: 64px;
  color: var(--eco-gray-600);
  margin-bottom: var(--eco-space-4);
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

.setting-item:hover {
  background: var(--eco-white);
  transform: translateY(-1px);
}

.setting-item.danger {
  background: var(--eco-error-light);
}

.setting-item.danger:hover {
  background: var(--eco-error);
}

.setting-item.danger .setting-icon {
  background: var(--eco-error);
}

.setting-item.danger .setting-title {
  color: var(--eco-error);
}

.setting-item.danger:hover .setting-title,
.setting-item.danger:hover .setting-subtitle {
  color: white;
}

.setting-icon {
  width: 40px;
  height: 40px;
  background: var(--eco-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.setting-icon ion-icon {
  font-size: 20px;
  color: white;
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
  
  .profile-avatar {
    width: 64px;
    height: 64px;
  }
  
  .profile-avatar ion-icon {
    font-size: 40px;
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
