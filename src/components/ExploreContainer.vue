<template>
  <div class="explore-container eco-card">
    <!-- Иконка -->
    <div class="explore-icon">
      <ion-icon :icon="leafOutline" />
    </div>
    
    <!-- Контент -->
    <div class="explore-content">
      <h2 class="explore-title">{{ name || 'EcoEvents' }}</h2>
      <p class="explore-description">
        Присоединяйтесь к экологическому движению! 
        Участвуйте в мероприятиях и делайте мир чище.
      </p>
      
      <!-- Статистика -->
      <div class="explore-stats">
        <div class="stat-item">
          <ion-icon :icon="calendarOutline" />
          <span>Мероприятия</span>
        </div>
        <div class="stat-item">
          <ion-icon :icon="peopleOutline" />
          <span>Волонтёры</span>
        </div>
        <div class="stat-item">
          <ion-icon :icon="trophyOutline" />
          <span>Достижения</span>
        </div>
      </div>
      
      <!-- Действия -->
      <div class="explore-actions">
        <ion-button class="action-button primary" size="default">
          <ion-icon :icon="addOutline" slot="start" />
          Начать участие
        </ion-button>
        <ion-button class="action-button secondary" fill="outline" size="default">
          <ion-icon :icon="informationCircleOutline" slot="start" />
          Узнать больше
        </ion-button>
      </div>
    </div>
    
    <!-- Фоновый элемент -->
    <div class="explore-background">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';
import {
  leafOutline,
  calendarOutline,
  peopleOutline,
  trophyOutline,
  addOutline,
  informationCircleOutline
} from 'ionicons/icons';

defineProps({
  name: String,
});
</script>

<style scoped>
.explore-container {
  position: relative;
  text-align: center;
  padding: var(--eco-space-8);
  margin: var(--eco-space-4);
  background: linear-gradient(135deg, 
    rgba(53, 90, 221, 0.03) 0%, 
    rgba(46, 220, 147, 0.03) 100%);
  border: 1px solid var(--eco-gray-200);
  overflow: hidden;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.explore-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-tertiary) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--eco-space-6) auto;
  position: relative;
  z-index: 2;
}

.explore-icon ion-icon {
  font-size: 40px;
  color: white;
}

.explore-content {
  position: relative;
  z-index: 2;
  max-width: 500px;
}

.explore-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-2xl);
  font-weight: var(--eco-font-weight-bold);
  color: var(--eco-gray-800);
  margin: 0 0 var(--eco-space-4) 0;
  line-height: var(--eco-line-height-tight);
}

.explore-description {
  font-size: var(--eco-font-size-lg);
  color: var(--eco-gray-600);
  line-height: var(--eco-line-height-relaxed);
  margin: 0 0 var(--eco-space-8) 0;
}

.explore-stats {
  display: flex;
  justify-content: center;
  gap: var(--eco-space-6);
  margin-bottom: var(--eco-space-8);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--eco-space-2);
  padding: var(--eco-space-3);
  border-radius: var(--eco-radius-lg);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 80px;
}

.stat-item ion-icon {
  font-size: 24px;
  color: var(--eco-primary);
}

.stat-item span {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-700);
}

.explore-actions {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-3);
  align-items: center;
}

.action-button.primary {
  --background: var(--eco-primary);
  --background-activated: var(--eco-primary-dark);
  --color: white;
  --border-radius: var(--eco-radius-lg);
  height: 48px;
  min-width: 200px;
  font-weight: var(--eco-font-weight-semibold);
}

.action-button.secondary {
  --color: var(--eco-primary);
  --border-color: var(--eco-primary);
  --border-radius: var(--eco-radius-lg);
  height: 48px;
  min-width: 200px;
  font-weight: var(--eco-font-weight-semibold);
}

/* Фоновые элементы */
.explore-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(53, 90, 221, 0.05) 0%, 
    rgba(46, 220, 147, 0.05) 100%);
  opacity: 0.6;
}

.bg-circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
}

.bg-circle-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: -30px;
}

.bg-circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: -20px;
  transform: translateY(-50%);
}

/* Адаптивность */
@media (max-width: 768px) {
  .explore-container {
    padding: var(--eco-space-6);
    margin: var(--eco-space-3);
  }
  
  .explore-title {
    font-size: var(--eco-font-size-xl);
  }
  
  .explore-description {
    font-size: var(--eco-font-size-base);
  }
  
  .explore-stats {
    gap: var(--eco-space-4);
  }
  
  .stat-item {
    min-width: 60px;
    padding: var(--eco-space-2);
  }
  
  .explore-actions {
    gap: var(--eco-space-3);
  }
  
  .action-button {
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .explore-stats {
    flex-direction: column;
    gap: var(--eco-space-3);
  }
  
  .stat-item {
    flex-direction: row;
    min-width: auto;
    width: 100%;
    justify-content: center;
  }
  
  .action-button {
    width: 100%;
    min-width: auto;
  }
}

/* Анимации */
.explore-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-item {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.stat-item:nth-child(1) { animation-delay: 0.1s; }
.stat-item:nth-child(2) { animation-delay: 0.2s; }
.stat-item:nth-child(3) { animation-delay: 0.3s; }
</style>
