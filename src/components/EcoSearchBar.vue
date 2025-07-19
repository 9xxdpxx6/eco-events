<template>
  <div class="search-section">
    <div class="search-wrapper">
      <ion-searchbar 
        :model-value="modelValue" 
        :placeholder="placeholder"
        class="custom-searchbar"
        :clear-input="true"
        @ion-input="onInput"
        @ion-clear="onClear"
      ></ion-searchbar>
      
      <!-- Кнопка переключения режима просмотра (опциональная) -->
      <ion-button 
        v-if="showViewToggle"
        fill="clear" 
        class="view-toggle-button"
        @click="$emit('toggle-view')"
      >
        <ion-icon :icon="viewToggleIcon" />
      </ion-button>
      
      <!-- Селектор сортировки (опциональный) -->
      <EcoSelect
        v-if="showSortSelect && sortOptions"
        :model-value="sortValue"
        :options="sortOptions"
        :trigger-icon="swapVerticalOutline"
        trigger-id="sortBtn"
        :show-text-only="false"
        @update:model-value="(value: string | number | null) => $emit('update:sortValue', String(value || ''))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  IonSearchbar,
  IonButton,
  IonIcon
} from '@ionic/vue';
import { 
  swapVerticalOutline
} from 'ionicons/icons';
import EcoSelect from './EcoSelect.vue';

interface SortOption {
  value: string;
  label: string;
  icon: string;
}

interface Props {
  modelValue: string;
  placeholder?: string;
  showViewToggle?: boolean;
  viewToggleIcon?: string;
  showSortSelect?: boolean;
  sortOptions?: SortOption[];
  sortValue?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'update:sortValue', value: string): void;
  (e: 'toggle-view'): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Поиск...',
  showViewToggle: false,
  showSortSelect: false,
  viewToggleIcon: '',
  sortValue: ''
});

const emit = defineEmits<Emits>();

function onInput(event: any) {
  const value = event.target.value;
  emit('update:modelValue', value);
}

function onClear() {
  emit('update:modelValue', '');
  emit('clear');
}
</script>

<style scoped>
.search-section {
  margin-bottom: var(--eco-space-4);
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: var(--eco-space-2);
}

/* Переопределяем внутренние паддинги через deep селекторы */
ion-searchbar :deep(.searchbar-input-container) {
  padding-top: 0;
  padding-bottom: 0;
  height: 48px;
}

ion-searchbar :deep(.searchbar-input) {
  padding-top: 0;
  padding-bottom: 0;
  height: 48px;
  line-height: 48px;
}

ion-searchbar :deep(.searchbar-search-icon) {
  padding-top: 2px;
  padding-bottom: 0;
}

ion-searchbar :deep(.searchbar-clear-button) {
  padding-top: 0;
  padding-bottom: 0;
}

.custom-searchbar {
  flex: 1;
  min-width: 200px;
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  --border-width: 2px;
  --border-color: var(--eco-gray-200);
  --border-color-focused: var(--eco-primary);
  --color: var(--eco-gray-800);
  --placeholder-color: var(--eco-gray-600);
  --padding-start: 16px;
  --padding-end: 48px;
  --box-shadow: none !important;
  margin: 0;
  height: 48px;
  padding-left: 2px !important;
  padding-right: 2px !important;
  --padding-top: 0 !important;
  --padding-bottom: 0 !important;
  min-height: 48px;
  max-height: 48px;
}

.view-toggle-button {
  --color: var(--eco-gray-600);
  --background: var(--eco-gray-100);
  --border-radius: var(--eco-radius-lg);
  width: 48px;
  height: 48px;
  --box-shadow: none !important;
}


</style> 