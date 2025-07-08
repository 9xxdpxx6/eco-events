<template>
  <div class="event-list-loader">
    <ion-spinner name="crescent"></ion-spinner>
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
  color: var(--ion-color-medium);
}
.event-list-loader p {
  margin-top: 8px;
}
</style> 
