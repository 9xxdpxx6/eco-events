<template>
  <ion-page class="notification-settings-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/volunteer-profile" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="page-title">Настройки уведомлений</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="notifications-content">
      <!-- Hero секция -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-icon">
            <ion-icon :icon="notificationsOutline" />
          </div>
          <h1 class="hero-title">Уведомления</h1>
          <p class="hero-subtitle">Настройте получение важных сообщений</p>
        </div>
      </div>

      <div class="content-container">
        <!-- Информация о статусе -->
        <div class="info-section eco-card">
          <div class="section-header">
            <ion-icon :icon="informationCircleOutline" />
            <h2>Текущий статус</h2>
          </div>
          
          <div class="status-content">
            <div class="status-item">
              <div class="status-icon web">
                <ion-icon :icon="globeOutline" />
              </div>
              <div class="status-info">
                <h3>Веб-версия</h3>
                <p>Push-уведомления недоступны в браузере</p>
                <span class="status-badge unavailable">Недоступно</span>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-icon mobile">
                <ion-icon :icon="phonePortraitOutline" />
              </div>
              <div class="status-info">
                <h3>Мобильное приложение</h3>
                <p>Полная поддержка push-уведомлений</p>
                <span class="status-badge available">Доступно</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Типы уведомлений -->
        <div class="notifications-section eco-card">
          <div class="section-header">
            <ion-icon :icon="listOutline" />
            <h2>Типы уведомлений</h2>
          </div>
          
          <div class="notification-types">
            <div class="notification-type">
              <div class="type-icon">
                <ion-icon :icon="calendarOutline" />
              </div>
              <div class="type-info">
                <h4>Новые мероприятия</h4>
                <p>Уведомления о добавлении новых экологических мероприятий</p>
              </div>
            </div>
            
            <div class="notification-type">
              <div class="type-icon">
                <ion-icon :icon="timeOutline" />
              </div>
              <div class="type-info">
                <h4>Напоминания</h4>
                <p>Уведомления за час до начала мероприятия</p>
              </div>
            </div>
            
            <div class="notification-type">
              <div class="type-icon">
                <ion-icon :icon="megaphoneOutline" />
              </div>
              <div class="type-info">
                <h4>Важные объявления</h4>
                <p>Изменения в мероприятиях и системные уведомления</p>
              </div>
            </div>
            
            <div class="notification-type">
              <div class="type-icon">
                <ion-icon :icon="trophyOutline" />
              </div>
              <div class="type-info">
                <h4>Бонусы и достижения</h4>
                <p>Уведомления о заработанных баллах и наградах</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Информация о мобильном приложении -->
        <div class="mobile-info-section eco-card">
          <div class="section-header">
            <ion-icon :icon="downloadOutline" />
            <h2>Мобильное приложение</h2>
          </div>
          
          <div class="mobile-content">
            <div class="mobile-features">
              <h4>Преимущества мобильного приложения:</h4>
              <ul>
                <li>Push-уведомления в реальном времени</li>
                <li>Работа в офлайн режиме</li>
                <li>Быстрый доступ к мероприятиям</li>
                <li>Геолокация для поиска ближайших событий</li>
              </ul>
            </div>
            
            <div class="download-placeholder">
              <ion-icon :icon="phonePortraitOutline" />
              <p>Мобильное приложение будет доступно в ближайшее время</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon
} from '@ionic/vue';
import {
  notificationsOutline,
  informationCircleOutline,
  globeOutline,
  phonePortraitOutline,
  listOutline,
  calendarOutline,
  timeOutline,
  megaphoneOutline,
  trophyOutline,
  downloadOutline
} from 'ionicons/icons';
</script>

<style scoped>
.notification-settings-page {
  --background: var(--eco-background-secondary);
}

.notifications-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
}

.back-button {
  --color: var(--eco-gray-700);
}

/* Hero секция */
.hero-section {
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-secondary) 100%);
  padding: var(--eco-space-6) var(--eco-space-4) var(--eco-space-8);
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 400px;
  margin: 0 auto;
}

.hero-icon {
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--eco-space-4) auto;
}

.hero-icon ion-icon {
  font-size: 60px;
  color: white;
}

.hero-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-bold);
  color: white;
  margin: 0 0 var(--eco-space-2) 0;
  line-height: var(--eco-line-height-tight);
}

.hero-subtitle {
  font-size: var(--eco-font-size-base);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: var(--eco-line-height-normal);
}

/* Контейнер контента */
.content-container {
  padding: var(--eco-space-6) var(--eco-space-4);
  max-width: 600px;
  margin: 0 auto;
}

/* Секции */
.info-section,
.notifications-section,
.mobile-info-section {
  margin-bottom: var(--eco-space-6);
  background: var(--eco-white);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-6);
  border: 1px solid var(--eco-gray-200);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--eco-space-3);
  margin-bottom: var(--eco-space-6);
  padding-bottom: var(--eco-space-4);
  border-bottom: 1px solid var(--eco-gray-100);
}

.section-header ion-icon {
  font-size: 24px;
  color: var(--eco-secondary);
}

.section-header h2 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
}

/* Статус контент */
.status-content {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-5);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--eco-space-4);
  padding: var(--eco-space-4);
  background: var(--eco-gray-50);
  border-radius: var(--eco-radius-lg);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--eco-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-icon.web {
  background: transparent;
}

.status-icon.web ion-icon {
  font-size: 40px;
  color: var(--eco-gray-600);
}

.status-icon.mobile {
  background: transparent;
}

.status-icon.mobile ion-icon {
  font-size: 40px;
  color: var(--eco-secondary);
}

.status-info h3 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-1) 0;
}

.status-info p {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-600);
  margin: 0 0 var(--eco-space-2) 0;
  line-height: var(--eco-line-height-normal);
}

.status-badge {
  padding: var(--eco-space-1) var(--eco-space-3);
  border-radius: var(--eco-radius-md);
  font-size: var(--eco-font-size-xs);
  font-weight: var(--eco-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.available {
  background: var(--eco-secondary);
  color: white;
}

.status-badge.unavailable {
  background: var(--eco-gray-500);
  color: white;
}

/* Типы уведомлений */
.notification-types {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
}

.notification-type {
  display: flex;
  align-items: flex-start;
  gap: var(--eco-space-3);
  padding: var(--eco-space-3);
  border-radius: var(--eco-radius-md);
  transition: all var(--eco-transition-normal);
}



.type-icon {
  width: 48px;
  height: 48px;
  background: transparent;
  border-radius: var(--eco-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-icon ion-icon {
  font-size: 32px;
  color: var(--eco-secondary);
}

.type-info h4 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-1) 0;
}

.type-info p {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-600);
  margin: 0;
  line-height: var(--eco-line-height-normal);
}

/* Мобильная информация */
.mobile-content {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-6);
}

.mobile-features h4 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-3) 0;
}

.mobile-features ul {
  margin: 0;
  padding-left: var(--eco-space-5);
}

.mobile-features li {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-600);
  line-height: var(--eco-line-height-relaxed);
  margin-bottom: var(--eco-space-2);
}

.download-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--eco-space-3);
  padding: var(--eco-space-6);
  background: var(--eco-gray-50);
  border-radius: var(--eco-radius-lg);
  text-align: center;
}

.download-placeholder ion-icon {
  font-size: 48px;
  color: var(--eco-gray-600);
}

.download-placeholder p {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-600);
  margin: 0;
  line-height: var(--eco-line-height-normal);
}

/* Отзывчивость */
@media (max-width: 480px) {
  .hero-section {
    padding: var(--eco-space-4) var(--eco-space-3) var(--eco-space-6);
  }
  
  .hero-title {
    font-size: var(--eco-font-size-lg);
  }
  
  .content-container {
    padding: var(--eco-space-4) var(--eco-space-3);
  }
  
  .info-section,
  .notifications-section,
  .mobile-info-section {
    padding: var(--eco-space-4);
    margin-bottom: var(--eco-space-4);
  }
  
  .section-header {
    margin-bottom: var(--eco-space-4);
    padding-bottom: var(--eco-space-3);
  }
  
  .status-item {
    flex-direction: column;
    text-align: center;
  }
  
  .mobile-content {
    gap: var(--eco-space-4);
  }
}
</style> 
