<template>
  <Transition name="toast">
    <div 
      v-if="isVisible"
      ref="toastRef"
      class="custom-toast"
      :class="[`toast-${color}`, { 'swiping': isSwiping }]"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
    >
      <div class="toast-content">
        <ion-icon v-if="icon" :icon="icon" class="toast-icon" />
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { checkmarkCircleOutline, closeCircleOutline, warningOutline } from 'ionicons/icons';

interface Props {
  message: string;
  color?: 'success' | 'danger' | 'warning';
  duration?: number;
  position?: 'top' | 'bottom';
}

const props = withDefaults(defineProps<Props>(), {
  color: 'success',
  duration: 3000,
  position: 'top'
});

const emit = defineEmits<{
  close: [];
}>();

const toastRef = ref<HTMLElement>();
const isVisible = ref(true);
const isSwiping = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const currentY = ref(0);
const isMouseDown = ref(false);

const SWIPE_THRESHOLD = 50;

const icon = computed(() => {
  switch (props.color) {
    case 'success': return checkmarkCircleOutline;
    case 'danger': return closeCircleOutline;
    case 'warning': return warningOutline;
    default: return checkmarkCircleOutline;
  }
});

const onTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0];
  startX.value = touch.clientX;
  startY.value = touch.clientY;
  currentX.value = touch.clientX;
  currentY.value = touch.clientY;
  isSwiping.value = false;
};

const onTouchMove = (event: TouchEvent) => {
  if (!startX.value || !startY.value) return;
  
  const touch = event.touches[0];
  currentX.value = touch.clientX;
  currentY.value = touch.clientY;
  
  const deltaX = currentX.value - startX.value;
  const deltaY = currentY.value - startY.value;
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
    isSwiping.value = true;
    if (toastRef.value) {
      const transformX = deltaX * 0.5;
      const transformY = deltaY * 0.5;
      toastRef.value.style.transform = `translate(${transformX}px, ${transformY}px)`;
      toastRef.value.style.opacity = String(Math.max(0.3, 1 - Math.abs(deltaX + deltaY) / 200));
    }
  }
};

const onTouchEnd = () => {
  if (!isSwiping.value) return;
  
  const deltaX = currentX.value - startX.value;
  const deltaY = currentY.value - startY.value;
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
    // Закрываем toast
    closeToast();
  } else {
    // Возвращаем в исходное положение
    if (toastRef.value) {
      toastRef.value.style.transition = 'all 0.2s ease-out';
      toastRef.value.style.transform = 'translate(0, 0)';
      toastRef.value.style.opacity = '1';
    }
  }
  
  // Сброс состояния
  setTimeout(() => {
    isSwiping.value = false;
    startX.value = 0;
    startY.value = 0;
    currentX.value = 0;
    currentY.value = 0;
    if (toastRef.value) {
      toastRef.value.style.transition = '';
      toastRef.value.style.transform = '';
      toastRef.value.style.opacity = '';
    }
  }, 200);
};

const onMouseDown = (event: MouseEvent) => {
  isMouseDown.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  currentX.value = event.clientX;
  currentY.value = event.clientY;
  isSwiping.value = false;
};

const onMouseMove = (event: MouseEvent) => {
  if (!isMouseDown.value || !startX.value || !startY.value) return;
  
  currentX.value = event.clientX;
  currentY.value = event.clientY;
  
  const deltaX = currentX.value - startX.value;
  const deltaY = currentY.value - startY.value;
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
    isSwiping.value = true;
    if (toastRef.value) {
      const transformX = deltaX * 0.5;
      const transformY = deltaY * 0.5;
      toastRef.value.style.transform = `translate(${transformX}px, ${transformY}px)`;
      toastRef.value.style.opacity = String(Math.max(0.3, 1 - Math.abs(deltaX + deltaY) / 200));
    }
  }
};

const onMouseUp = () => {
  if (!isMouseDown.value) return;
  
  const deltaX = currentX.value - startX.value;
  const deltaY = currentY.value - startY.value;
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
    closeToast();
  } else {
    if (toastRef.value) {
      toastRef.value.style.transition = 'all 0.2s ease-out';
      toastRef.value.style.transform = 'translate(0, 0)';
      toastRef.value.style.opacity = '1';
    }
  }
  
  setTimeout(() => {
    isSwiping.value = false;
    startX.value = 0;
    startY.value = 0;
    currentX.value = 0;
    currentY.value = 0;
    isMouseDown.value = false;
    if (toastRef.value) {
      toastRef.value.style.transition = '';
      toastRef.value.style.transform = '';
      toastRef.value.style.opacity = '';
    }
  }, 200);
};

const onMouseLeave = () => {
  if (isMouseDown.value) {
    onMouseUp();
  }
};

const closeToast = () => {
  isVisible.value = false;
  emit('close');
};

// Автоматическое закрытие
onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      closeToast();
    }, props.duration);
  }
});
</script>

<style scoped>
.custom-toast {
  position: fixed;
  left: 16px;
  right: 16px;
  z-index: 9999;
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: pan-x pan-y;
  transition: all 0.3s ease-out;
}

.custom-toast:active {
  cursor: grabbing;
}

.custom-toast.swiping {
  transition: none;
}

.toast-success {
  background: var(--eco-success);
  color: white;
}

.toast-danger {
  background: var(--eco-error);
  color: white;
}

.toast-warning {
  background: var(--eco-warning);
  color: white;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--eco-font-family);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
}

/* Позиционирование */
.custom-toast {
  bottom: 16px;
}

/* Анимации */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style> 