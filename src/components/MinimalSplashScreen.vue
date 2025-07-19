<template>
  <div class="minimal-splash" :class="{ 'fade-out': !isVisible }">
    <div class="content">
      <div class="logo-wrapper">
        <img 
          src="@/assets/logo-white.png" 
          alt="EcoEvents" 
          class="logo"
        />
      </div>
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'MinimalSplashScreen',
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
        }, 300);
      }, props.duration);
    });

    return {
      isVisible
    };
  }
});
</script>

<style scoped>
.minimal-splash {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #2ecc71;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.3s ease-out;
}

.minimal-splash.fade-out {
  opacity: 0;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Адаптивность */
@media (max-width: 480px) {
  .logo {
    width: 60px;
    height: 60px;
  }
  
  .spinner {
    width: 30px;
    height: 30px;
    border-width: 2px;
  }
}

@media (min-width: 768px) {
  .logo {
    width: 100px;
    height: 100px;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border-width: 4px;
  }
}
</style> 