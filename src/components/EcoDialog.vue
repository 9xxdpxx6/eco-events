<template>
  <ion-modal 
    :is-open="isOpen" 
    @did-dismiss="handleDismiss" 
    :backdrop-dismiss="true"
    class="eco-modal"
    :animated="false"
  >
    <div class="eco-dialog-container" @click="handleBackdropClick">
      <div class="eco-dialog" @click.stop>
        <div class="eco-dialog-content">
          <h2 v-if="title" class="eco-dialog-title">{{ title }}</h2>
          <p class="eco-dialog-message">{{ message }}</p>
        </div>
        
        <div class="eco-dialog-buttons">
          <button 
            v-if="!hideCancel"
            class="eco-dialog-button eco-dialog-button-cancel"
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button 
            class="eco-dialog-button eco-dialog-button-confirm"
            :class="{ 'eco-dialog-button-destructive': isDestructive }"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal } from '@ionic/vue';

interface Props {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  hideCancel?: boolean;
}

interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'dismiss'): void;
}

withDefaults(defineProps<Props>(), {
  confirmText: 'OK',
  cancelText: 'Отменить',
  isDestructive: false,
  hideCancel: false,
});

const emit = defineEmits<Emits>();

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const handleDismiss = () => {
  emit('dismiss');
};

const handleBackdropClick = () => {
  // При клике на фон закрываем диалог (как кнопка "Отмена")
  handleCancel();
};
</script>

<style>
/* Глобальные стили для переопределения ion-modal */
.eco-modal {
  --border-radius: 0px !important;
  --background: transparent !important;
}

.eco-modal ion-backdrop {
  background: transparent !important;
  backdrop-filter: none !important;
}

.eco-modal .modal-wrapper {
  border-radius: 0px !important;
  background: transparent !important;
  position: static !important;
  transform: none !important;
  animation: none !important;
}

/* Дополнительное переопределение стилей */
.eco-modal::part(backdrop) {
  background: transparent !important;
}

.eco-modal::part(content) {
  background: transparent !important;
  border-radius: 0px !important;
  box-shadow: none !important;
  position: static !important;
  transform: none !important;
  animation: none !important;
}
</style>

<style scoped>
.eco-dialog-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  padding: var(--eco-space-4);
  background: rgba(0, 0, 0, 0.3);
  animation: eco-backdrop-appear 0.2s ease-out;
}

.eco-dialog {
  background: var(--eco-background);
  border-radius: 14px;
  width: 100%;
  max-width: 270px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: eco-dialog-appear 0.25s ease-out;
  transform-origin: center center;
}

@keyframes eco-backdrop-appear {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes eco-dialog-appear {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.eco-dialog-content {
  padding: 20px 16px 16px 16px;
  text-align: center;
}

.eco-dialog-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.eco-dialog-message {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #000000;
  margin: 0;
  line-height: 1.4;
  opacity: 0.85;
}

.eco-dialog-buttons {
  border-top: 0.5px solid #d1d1d6;
  display: flex;
}

.eco-dialog-button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 17px;
  font-weight: 400;
  color: #007aff;
  cursor: pointer;
  transition: background-color 0.1s ease;
  position: relative;
}

.eco-dialog-button:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 0.5px;
  background: #d1d1d6;
}

.eco-dialog-button:active {
  background-color: #f0f0f0;
}

.eco-dialog-button-confirm {
  font-weight: 600;
}

.eco-dialog-button-destructive {
  color: #ff3b30;
}

.eco-dialog-button-cancel {
  color: #007aff;
}

/* Убираем тёмную тему - всегда показываем светлый диалог */
</style> 