<template>
  <div :class="['reg-status', statusClass]">
    <ion-icon :icon="icon" class="reg-status-icon" />
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';

const props = defineProps<{ status: string }>();

const statusMap: Record<string, { label: string; icon: string; class: string }> = {
  REGISTERED: {
    label: 'предстоит',
    icon: timeOutline,
    class: 'reg-status-upcoming'
  },
  VISITED: {
    label: 'посещено',
    icon: checkmarkCircleOutline,
    class: 'reg-status-success'
  },
  MISSED: {
    label: 'пропущено',
    icon: closeCircleOutline,
    class: 'reg-status-failed'
  }
};

const label = computed(() => statusMap[props.status]?.label || props.status);
const icon = computed(() => statusMap[props.status]?.icon || timeOutline);
const statusClass = computed(() => statusMap[props.status]?.class || 'reg-status-upcoming');
</script>

<style scoped>
.reg-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
  padding: 2px 10px 2px 6px;
  background: var(--ion-color-step-50, #23272f);
}
.reg-status-icon {
  font-size: 18px;
}
.reg-status-upcoming {
  color: var(--ion-color-primary);
  background: rgba(0, 140, 255, 0.08);
}
.reg-status-success {
  color: var(--ion-color-success);
  background: rgba(40, 200, 80, 0.08);
}
.reg-status-failed {
  color: var(--ion-color-danger);
  background: rgba(255, 60, 60, 0.08);
}
</style> 