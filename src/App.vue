<template>
  <ion-app>
    <SimpleAdvancedSplashScreen 
      v-if="showSplash" 
      :duration="3000"
      :show-progress="true"
      :progress-percentage="loadingProgress"
      :loading-steps="loadingSteps"
      :current-step="currentStep"
      @splash-complete="onSplashComplete"
    />
    <ion-router-outlet v-else />
  </ion-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import SimpleAdvancedSplashScreen from '@/components/SimpleAdvancedSplashScreen.vue';
import { useAppLoading } from '@/composables/useAppLoading';
import { useCapacitorSplash } from '@/composables/useCapacitorSplash';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    SimpleAdvancedSplashScreen
  },
  setup() {
    const showSplash = ref(true);
    const { 
      loadingProgress, 
      loadingSteps, 
      currentStep, 
      simulateLoading 
    } = useAppLoading();
    
    const { hideNativeSplashAfterDelay } = useCapacitorSplash();

    const onSplashComplete = () => {
      showSplash.value = false;
    };

    onMounted(async () => {
      // Скрываем нативный splash screen через 1 секунду
      // чтобы дать время загрузиться веб-приложению
      hideNativeSplashAfterDelay(1000);

      // Имитируем процесс загрузки приложения
      const steps = [
        'Инициализация приложения...',
        'Загрузка данных...',
        'Проверка авторизации...',
        'Подготовка интерфейса...',
        'Готово!'
      ];
      
      await simulateLoading(steps, 3000);
    });

    return {
      showSplash,
      loadingProgress,
      loadingSteps,
      currentStep,
      onSplashComplete
    };
  }
});
</script>

<style>
:root {
  --ion-color-primary: #2ecc71;
  --ion-color-primary-rgb: 46, 204, 113;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #28b464;
  --ion-color-primary-tint: #43d17f;
}
</style>
