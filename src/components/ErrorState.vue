<template>
  <div class="error-state-component">
    <div class="error-icon-wrapper">
      <ion-icon :icon="icon" />
    </div>
    <h3 class="error-title">{{ title }}</h3>
    <p class="error-subtitle">{{ message }}</p>
    <ion-button v-if="showRetry" fill="clear" @click="$emit('retry')" class="retry-button">
      Попробовать снова
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';

interface Props {
  title?: string;
  message: string;
  icon?: string;
  showRetry?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: 'Ошибка загрузки',
  icon: alertCircleOutline,
  showRetry: true,
});

defineEmits(['retry']);
</script>

<style scoped>
.error-state-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eco-space-12) var(--eco-space-6);
  text-align: center;
}

.error-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--eco-space-6);
}

.error-icon-wrapper ion-icon {
  font-size: 64px;
  color: var(--eco-error);
}

.error-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-700);
  margin: 0 0 var(--eco-space-3) 0;
}

.error-subtitle {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-600);
  margin: 0 0 var(--eco-space-6) 0;
  max-width: 320px;
  line-height: var(--eco-line-height-normal);
}

.retry-button {
  --color: var(--eco-primary);
  font-weight: var(--eco-font-weight-medium);
  --ripple-color: var(--eco-primary-tint);
}
</style> 