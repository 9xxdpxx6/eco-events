<template>
  <div class="eco-select-container">
    <ion-button 
      fill="clear" 
      class="select-trigger"
      :id="triggerId"
      @click="openPopover"
    >
      <ion-icon :icon="triggerIcon" />
    </ion-button>

    <ion-popover 
      :is-open="showPopover" 
      @didDismiss="showPopover = false" 
      :trigger="triggerId" 
      trigger-action="click"
      class="eco-select-popover"
    >
      <ion-content>
        <ion-list class="select-options">
          <ion-item 
            v-for="option in options" 
            :key="option.value" 
            button 
            @click="selectOption(option.value)"
            class="select-option-item"
          >
            <ion-icon :icon="option.icon" slot="start" />
            <ion-label :class="{ 'selected': modelValue === option.value }">
              {{ option.label }}
            </ion-label>
            <ion-icon 
              v-if="modelValue === option.value" 
              :icon="checkmarkOutline" 
              slot="end" 
              color="primary" 
            />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-popover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonIcon,
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/vue';
import { checkmarkOutline } from 'ionicons/icons';

interface SelectOption {
  value: string;
  label: string;
  icon: string;
}

interface Props {
  modelValue: string;
  options: SelectOption[];
  triggerIcon: string;
  triggerId?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  triggerId: 'selectTrigger'
});

const emit = defineEmits<Emits>();

const showPopover = ref(false);

const openPopover = () => {
  showPopover.value = true;
};

const selectOption = (value: string) => {
  emit('update:modelValue', value);
  showPopover.value = false;
};
</script>

<style scoped>
.eco-select-container {
  display: inline-block;
}

.select-trigger {
  --color: var(--eco-gray-600);
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  width: 48px;
  height: 48px;
  --box-shadow: none !important;
  transition: all var(--eco-transition-normal);
}

.select-trigger:hover {
  --background: var(--eco-gray-200);
  transform: scale(1.05);
}

.select-trigger:active {
  transform: scale(0.95);
}

.select-trigger ion-icon {
  font-size: 20px;
  color: var(--eco-gray-600);
}

/* iOS стили для popover */
.eco-select-popover {
  --width: 280px;
  --max-width: 90vw;
}

.eco-select-popover::part(content) {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.select-options {
  background: transparent;
  padding: 8px;
  margin: 0;
}

.select-option-item {
  --background: transparent;
  --border-radius: 12px;
  --color: var(--eco-gray-700);
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  margin-bottom: 4px;
  font-family: var(--eco-font-family);
  font-size: 16px;
  font-weight: 400;
  transition: all var(--eco-transition-fast);
  border: none;
  --border-width: 0;
  --inner-border-width: 0;
}

.select-option-item:hover {
  --background: rgba(53, 90, 221, 0.08);
  transform: scale(1.02);
}

.select-option-item:active {
  --background: rgba(53, 90, 221, 0.12);
  transform: scale(0.98);
}

.select-option-item ion-icon[slot="start"] {
  font-size: 18px;
  color: var(--eco-gray-500);
  margin-right: 12px;
  flex-shrink: 0;
}

.select-option-item ion-label {
  font-weight: 400;
  color: var(--eco-gray-700);
  margin: 0;
}

.select-option-item ion-label.selected {
  color: var(--eco-primary);
  font-weight: 600;
}

.select-option-item ion-icon[slot="end"] {
  font-size: 18px;
  color: var(--eco-primary);
  margin-left: 8px;
  flex-shrink: 0;
}

/* Анимации */
.select-option-item {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 480px) {
  .eco-select-popover {
    --width: 260px;
  }
  
  .select-option-item {
    --padding-start: 12px;
    --padding-end: 12px;
    font-size: 15px;
  }
}
</style> 