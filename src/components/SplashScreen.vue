<template>
  <div class="splash-screen" :class="{ 'fade-out': isVisible }">
    <div class="splash-content">
      <div class="logo-container">
        <img 
          src="@/assets/logo-blue.png" 
          alt="EcoEvents Logo" 
          class="logo"
        />
      </div>
      <div class="loading-indicator">
        <div class="loading-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
      <div class="app-name">
        EcoEvents
      </div>
      <div class="tagline">
        Экологические события рядом с вами
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'SplashScreen',
  props: {
    duration: {
      type: Number,
      default: 2000
    }
  },
  emits: ['splash-complete'],
  setup(props, { emit }) {
    const isVisible = ref(true);

    onMounted(() => {
      setTimeout(() => {
        isVisible.value = false;
        setTimeout(() => {
          emit('splash-complete');
        }, 500); // Время анимации fade-out
      }, props.duration);
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

.loading-indicator {
  margin-bottom: 2rem;
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