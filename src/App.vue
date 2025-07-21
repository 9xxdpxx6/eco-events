<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
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
