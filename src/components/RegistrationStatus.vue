<template>
  <div :class="['reg-status', 'eco-status-badge', statusClass]">
    <ion-icon :icon="icon" class="reg-status-icon" />
    <span class="reg-status-label">{{ label }}</span>
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
  gap: var(--eco-space-2);
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-semibold);
  line-height: var(--eco-line-height-tight);
  border-radius: var(--eco-radius-md);
  padding: var(--eco-space-2) var(--eco-space-3);
  text-transform: capitalize;
  letter-spacing: 0.25px;
  transition: all var(--eco-transition-fast);
  white-space: nowrap;
}

.reg-status-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.reg-status-label {
  font-size: inherit;
  font-weight: inherit;
}

/* Статусы */
.reg-status-upcoming {
  color: var(--eco-primary);
  background: rgba(53, 90, 221, 0.1);
  border: 1px solid rgba(53, 90, 221, 0.2);
}



.reg-status-success {
  color: var(--eco-success);
  background: rgba(46, 220, 147, 0.1);
  border: 1px solid rgba(46, 220, 147, 0.2);
}



.reg-status-failed {
  color: var(--eco-error);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}



/* Компактная версия для мобильных устройств */
@media (max-width: 480px) {
  .reg-status {
    font-size: var(--eco-font-size-xs);
    padding: var(--eco-space-1) var(--eco-space-2);
    gap: var(--eco-space-1);
  }
  
  .reg-status-icon {
    font-size: 14px;
  }
}

/* Анимация при изменении статуса */
.reg-status {
  animation: statusFadeIn 0.3s ease-out;
}

@keyframes statusFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 