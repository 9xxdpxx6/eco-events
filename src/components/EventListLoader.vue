<template>
  <div class="event-list-loader">
    <div class="custom-spinner">
      <div class="spinner-circle"></div>
    </div>
    <p>Загружаем мероприятия...</p>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';
</script>

<style scoped>
.event-list-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 24px 0 0 0;
  color: var(--eco-gray-600);
}

.event-list-loader p {
  margin-top: 8px;
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
}

.custom-spinner {
  width: 32px;
  height: 32px;
  position: relative;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 3px solid var(--eco-gray-200);
  border-top: 3px solid var(--eco-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 