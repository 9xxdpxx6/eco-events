<template>
  <div class="eco-select-container">
    <ion-button 
      fill="clear" 
      class="select-trigger"
      :class="{ 'icon-only': !showTextOnly }"
      @click="openPopover"
    >
      <span v-if="showTextOnly" class="select-text">{{ displayText }}</span>
      <ion-icon v-else :icon="triggerIcon" />
      <ion-icon v-if="showTextOnly" :icon="chevronDownOutline" slot="end" />
    </ion-button>

    <ion-popover 
      :is-open="showPopover" 
      @didDismiss="showPopover = false" 
      :event="popoverEvent"
      trigger-action="click"
      class="eco-select-popover"
      :alignment="'start'"
      :side="'bottom'"
      :reference="'trigger'"
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
            <ion-icon v-if="option.icon" :icon="option.icon" slot="start" />
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
import { ref, computed } from 'vue';
import {
  IonButton,
  IonIcon,
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/vue';
import { checkmarkOutline, chevronDownOutline } from 'ionicons/icons';

interface SelectOption {
  value: string | number;
  label: string;
  icon?: string;
}

interface Props {
  modelValue: string | number | null;
  options: SelectOption[];
  placeholder?: string;
  triggerId?: string;
  showTextOnly?: boolean;
  triggerIcon?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  triggerId: 'selectTrigger',
  placeholder: 'Выберите...',
  showTextOnly: true,
  triggerIcon: 'swapVerticalOutline'
});

const emit = defineEmits<Emits>();

const showPopover = ref(false);
const popoverEvent = ref<Event | undefined>(undefined);

const displayText = computed(() => {
  if (props.modelValue === null || props.modelValue === '') {
    return props.placeholder;
  }
  const selectedOption = props.options.find(option => option.value === props.modelValue);
  return selectedOption ? selectedOption.label : props.placeholder;
});

const openPopover = (event: Event) => {
  popoverEvent.value = event;
  showPopover.value = true;
};

const selectOption = (value: string | number) => {
  emit('update:modelValue', value);
  showPopover.value = false;
};
</script>

<style scoped>
.eco-select-container {
  display: block;
}

.select-trigger {
  --color: var(--eco-gray-800);
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  width: 100%;
  height: auto;
  min-height: 48px;
  text-transform: none;
  justify-content: space-between;
  --padding-start: var(--eco-space-4);
  --padding-end: var(--eco-space-4);
  --padding-top: var(--eco-space-3);
  --padding-bottom: var(--eco-space-3);
  border: 1px solid transparent;
  transition: all var(--eco-transition-normal);
  --box-shadow: none;
}

.select-trigger.icon-only {
  width: 48px;
  min-width: 48px;
  max-width: 48px;
  height: 48px;
  min-height: 48px;
  max-height: 48px;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  justify-content: center;
  align-items: center;
}

.select-trigger:hover {
  --background: var(--eco-gray-200);
}

.select-trigger:active {
  transform: scale(0.98);
}

.select-text {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-800);
  text-align: left;
  flex: 1;
}

.select-trigger ion-icon {
  font-size: 18px;
  color: var(--eco-gray-600);
  margin-left: var(--eco-space-2);
}

.select-trigger.icon-only ion-icon {
  font-size: 20px;
  color: var(--eco-gray-600);
  margin-left: 0;
}

/* iOS стили для popover */
.eco-select-popover {
  --width: 280px;
  --max-width: 90vw;
  --backdrop-opacity: 0.3;
  z-index: 100000;
}

.eco-select-popover::part(content) {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.eco-select-popover::part(backdrop) {
  /* z-index управляется через хост */
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