<template>
  <div class="splash-screen" :class="{ 'fade-out': !isVisible }">
    <div class="splash-content">
      <div class="logo-container">
        <img 
          src="@/assets/logo-blue.png" 
          alt="EcoEvents Logo" 
          class="logo"
        />
      </div>
      
      <div class="app-name">
        EcoEvents
      </div>
      
      <div class="tagline">
        Экологические события рядом с вами
      </div>

      <!-- Прогресс загрузки -->
      <div class="loading-section" v-if="showProgress">
        <div class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <div class="progress-text">
            {{ progressPercentage }}%
          </div>
        </div>
        
        <div class="loading-steps" v-if="loadingSteps.length > 0">
          <div 
            v-for="(step, index) in loadingSteps" 
            :key="index"
            class="step"
            :class="{ 
              'active': index < currentStep,
              'current': index === currentStep - 1
            }"
          >
            <div class="step-indicator">
              <div class="step-dot" :class="{ 'completed': index < currentStep }"></div>
            </div>
            <div class="step-text">{{ step }}</div>
          </div>
        </div>
      </div>

      <!-- Простой индикатор загрузки -->
      <div class="loading-indicator" v-else>
        <div class="loading-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';

export default defineComponent({
  name: 'SimpleAdvancedSplashScreen',
  props: {
    duration: {
      type: Number,
      default: 2000
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progressPercentage: {
      type: Number,
      default: 0
    },
    loadingSteps: {
      type: Array as () => string[],
      default: () => []
    },
    currentStep: {
      type: Number,
      default: 0
    }
  },
  emits: ['splash-complete'],
  setup(props, { emit }) {
    const isVisible = ref(true);

    onMounted(() => {
      if (!props.showProgress) {
        setTimeout(() => {
          isVisible.value = false;
          setTimeout(() => {
            emit('splash-complete');
          }, 500);
        }, props.duration);
      }
    });

    // Следим за прогрессом, если он включен
    watch(() => props.progressPercentage, (newProgress) => {
      if (newProgress >= 100) {
        setTimeout(() => {
          isVisible.value = false;
          setTimeout(() => {
            emit('splash-complete');
          }, 500);
        }, 300);
      }
    });

    return {
      isVisible
    };
  }
});
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.5s ease-out;
}

.splash-screen.fade-out {
  opacity: 0;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.logo-container {
  margin-bottom: 2rem;
}

.logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.app-name {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.tagline {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
}

.loading-section {
  width: 100%;
  margin-top: 1rem;
}

.progress-container {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: white;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.step.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.step.current {
  background-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.step-dot.completed {
  background-color: white;
  transform: scale(1.2);
}

.step-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  flex: 1;
  text-align: left;
}

.loading-indicator {
  margin-top: 2rem;
}

.loading-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Адаптивность для разных размеров экранов */
@media (max-width: 480px) {
  .logo {
    width: 100px;
    height: 100px;
  }
  
  .app-name {
    font-size: 1.5rem;
  }
  
  .tagline {
    font-size: 0.9rem;
  }
  
  .step-text {
    font-size: 0.8rem;
  }
}

@media (min-width: 768px) {
  .logo {
    width: 150px;
    height: 150px;
  }
  
  .app-name {
    font-size: 2.5rem;
  }
  
  .tagline {
    font-size: 1.2rem;
  }
}
</style> 