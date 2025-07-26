<template>
  <ion-page class="create-event-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="goBack" class="back-button">
            <ion-icon :icon="arrowBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title class="page-title">Создать мероприятие</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="saveEvent" :disabled="!isFormValid || isSaving" class="save-button">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="create-content">
      <!-- Hero секция -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-icon">
            <ion-icon :icon="addCircleOutline" />
          </div>
          <h1 class="hero-title">Новое мероприятие</h1>
          <p class="hero-subtitle">Создайте экологическое мероприятие и найдите единомышленников</p>
        </div>
      </div>

      <div class="form-container">
      <form @submit.prevent="saveEvent">
        <!-- Основная информация -->
          <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="informationCircleOutline" />
              <h2>Основная информация</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Название мероприятия *</label>
              <ion-input 
                v-model="form.title" 
                placeholder="Введите название"
                  class="eco-input"
                  :class="{ 'error': !form.title && showErrors }"
              ></ion-input>
              </div>
            
              <div class="field-group">
                <label class="field-label">Описание *</label>
              <ion-textarea 
                v-model="form.description" 
                placeholder="Опишите мероприятие, цели и задачи"
                :rows="4"
                  class="eco-textarea"
                  :class="{ 'error': !form.description && showErrors }"
              ></ion-textarea>
              </div>

              <div class="field-group">
                <label class="field-label">Тип мероприятия *</label>
                <EcoSelect
                  v-model="form.eventTypeId"
                  :options="eventTypeOptions"
                  placeholder="Выберите тип мероприятия"
                  :class="{ 'error': !form.eventTypeId && showErrors }"
                />
              </div>
            </div>
          </div>

        <!-- Дата и время -->
          <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="timeOutline" />
              <h2>Дата и время</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Дата проведения *</label>
                <ion-button 
                  @click="showCalendar = true" 
                  class="date-button"
                  :class="{ 'error': !form.date && showErrors }"
                >
                  <span>{{ form.date ? formatDateForDisplay(form.date) : 'Выберите дату' }}</span>
                  <ion-icon :icon="calendarOutline" slot="end" />
                </ion-button>
              </div>
            
              <div class="time-row">
                <div class="field-group half-width">
                  <label class="field-label">Время начала *</label>
                  <ion-input
                v-model="form.time"
                    placeholder="23:59"
                    :maxlength="5"
                    class="eco-input time-input"
                    :class="{ 'error': !form.time && showErrors }"
                    @ionInput="formatTimeInput"
                    @ionFocus="handleTimeFocus"
                  ></ion-input>
                </div>
            
                <div class="field-group half-width">
                  <label class="field-label">Длительность (часов)</label>
              <ion-input 
                type="number" 
                v-model="form.duration" 
                placeholder="2"
                min="1"
                max="12"
                    class="eco-input"
              ></ion-input>
                </div>
              </div>
            </div>
          </div>

        <!-- Место проведения -->
          <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="locationOutline" />
              <h2>Место проведения</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Адрес *</label>
              <ion-input 
                v-model="form.location" 
                placeholder="Укажите адрес или место сбора"
                  class="eco-input"
                  :class="{ 'error': !form.location && showErrors }"
              ></ion-input>
              </div>
            
              <!-- <div class="field-group">
                <label class="field-label">Подробности места</label>
              <ion-textarea 
                v-model="form.locationDetails" 
                placeholder="Дополнительная информация о месте встречи"
                :rows="2"
                  class="eco-textarea"
              ></ion-textarea>
              </div> -->
            </div>
          </div>

        <!-- Превью мероприятия -->
          <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="imageOutline" />
              <h2>Изображения мероприятия</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Фотографии</label>
                <p class="field-hint">Загрузите до 10 изображений (JPG, PNG, до 10MB). Первое фото будет главным.</p>
                
                <ImageUploader 
                  v-model="images"
                  @update:preview="updatePreview"
                  :max-files="10"
                  accept="image/png,image/jpeg,image/jpg"
                />
              </div>
            </div>
          </div>

        <!-- Дополнительные настройки -->
          <!-- <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="settingsOutline" />
              <h2>Дополнительные настройки</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Максимальное количество участников</label>
              <ion-input 
                type="number" 
                v-model="form.maxParticipants" 
                placeholder="Без ограничений"
                min="1"
                  class="eco-input"
              ></ion-input>
              </div>
              
              <div class="checkbox-group">
                <div class="checkbox-item">
                  <ion-checkbox v-model="form.requiresRegistration" class="eco-checkbox" />
                  <label class="checkbox-label">Требуется предварительная регистрация</label>
                </div>
            
                <div class="checkbox-item">
                  <ion-checkbox v-model="form.providesEquipment" class="eco-checkbox" />
                  <label class="checkbox-label">Организация предоставляет инвентарь</label>
                </div>
              </div>
            </div>
          </div> -->

        <!-- Требования к участникам -->
          <!-- <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="peopleOutline" />
              <h2>Требования к участникам</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Минимальный возраст</label>
              <ion-input 
                type="number" 
                v-model="form.minAge" 
                placeholder="Без ограничений"
                min="0"
                max="100"
                  class="eco-input"
              ></ion-input>
              </div>
            
              <div class="field-group">
                <label class="field-label">Что необходимо взять с собой</label>
              <ion-textarea 
                v-model="form.requirements" 
                placeholder="Удобная одежда, перчатки, вода..."
                :rows="3"
                  class="eco-textarea"
              ></ion-textarea>
              </div>
            </div>
          </div> -->
      </form>
      </div>
    </ion-content>

    <EcoCalendar v-model:show="showCalendar" v-model="form.date" title="Выберите дату проведения" />

    <!-- Кнопка действий -->
    <ion-footer class="action-footer">
      <div class="footer-content">
        <ion-button 
          expand="block" 
          @click="saveEvent" 
          :disabled="!isFormValid || isSaving"
          class="create-button"
        >
          <ion-icon :icon="checkmarkOutline" slot="start" />
          {{ isSaving ? 'Создание...' : 'Создать мероприятие' }}
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  alertController
} from '@ionic/vue';
import { checkmarkOutline, addCircleOutline, informationCircleOutline, timeOutline, locationOutline, mailOutline, settingsOutline, peopleOutline, imageOutline, trashOutline, refreshOutline, calendarOutline, arrowBackOutline } from 'ionicons/icons';
import { useEventsStore } from '../../stores';
import { useEventTypesStore } from '../../stores';
import { useAuthStore } from '../../stores/auth';
import type { EventTypeDTO } from '../../types/api';
import EcoCalendar from '../../components/EcoCalendar.vue';
import EcoSelect from '../../components/EcoSelect.vue';
import ImageUploader from '../../components/ImageUploader.vue';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const router = useRouter();
const goBack = () => { router.back(); };
const eventsStore = useEventsStore();
const eventTypesStore = useEventTypesStore();
const authStore = useAuthStore();

const form = ref({
  title: '',
  description: '',
  eventTypeId: null as number | null,
  date: '',
  time: '',
  duration: '2',
  location: '',
  locationDetails: '',
  maxParticipants: null as number | null,
  requiresRegistration: true,
  providesEquipment: false,
  minAge: null as number | null,
  requirements: ''
});

const showErrors = ref(false);
const isSaving = ref(false);
const eventTypes = ref<EventTypeDTO[]>([]);
const images = ref<(File)[]>([]);
const previewImage = ref<File | null>(null);
const showCalendar = ref(false);

const minDate = new Date().toISOString();

const isFormValid = computed(() => {
  return form.value.title &&
         form.value.description &&
         form.value.eventTypeId &&
         form.value.date &&
         form.value.time &&
         form.value.location;
});

const eventTypeOptions = computed(() => {
  return eventTypes.value.map(type => ({
    value: type.id!,
    label: type.name,
    icon: 'leafOutline'
  }));
});

const formatDateForDisplay = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const updatePreview = (file: File | string | null) => {
  if (file instanceof File) {
    previewImage.value = file;
  } else {
    previewImage.value = null; // Should not happen with current uploader logic
  }
};


const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    eventTypeId: null,
    date: '',
    time: '',
    duration: '2',
    location: '',
    locationDetails: '',
    maxParticipants: null,
    requiresRegistration: true,
    providesEquipment: false,
    minAge: null,
    requirements: ''
  };
  showErrors.value = false;
  images.value = [];
  previewImage.value = null;
};

const loadEventTypes = async () => {
  try {
    await eventTypesStore.fetchEventTypes();
    eventTypes.value = eventTypesStore.getEventTypes;
  } catch (error) {
    console.error('Error loading event types:', error);
    await showErrorToast('Ошибка загрузки типов мероприятий', 3000);
  }
};

const saveEvent = async () => {
  if (!isFormValid.value) {
    showErrors.value = true;
    return;
  }

  isSaving.value = true;
  try {
    const eventType = eventTypes.value.find(t => t.id === Number(form.value.eventTypeId));
    if (!eventType) throw new Error('Тип мероприятия не найден');
    
    let startTime = '';
    if (form.value.date && form.value.time) {
      const datePart = form.value.date.split('T')[0];
      let timePart = form.value.time;
      if (timePart.length === 5 && timePart.includes(':')) {
        timePart += ':00';
      }
      const fullDateTime = `${datePart}T${timePart}`;
      const testDate = new Date(fullDateTime);
      if (isNaN(testDate.getTime())) {
        throw new Error('Некорректная дата или время');
      }
      // Добавляем +3 часа для сервера
      const serverDate = new Date(testDate.getTime() + 3 * 60 * 60 * 1000);
      startTime = serverDate.toISOString();
    } else {
      throw new Error('Не указана дата или время');
    }
    
    const duration = Number(form.value.duration) || 2;
    const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 60 * 1000).toISOString();
    
    if (!authStore.user?.id) {
        throw new Error("Пользователь не авторизован");
    }

    const eventData = {
      title: form.value.title,
      description: form.value.description,
      startTime,
      endTime,
      location: form.value.location,
      conducted: false,
      eventTypeId: eventType.id!,
      userId: authStore.user.id
    };
    
    const formData = new FormData();
    formData.append('event', new Blob([JSON.stringify(eventData)], { type: 'application/json' }));
    
    if (previewImage.value) {
        formData.append('preview', previewImage.value);
    }

    const otherImages = images.value.filter(img => img !== previewImage.value);
    otherImages.forEach(imageFile => {
        if (imageFile instanceof File) {
            formData.append('images', imageFile);
        }
    });
    
    // Подробный вывод запроса в консоль
    console.log('=== CREATE EVENT REQUEST ===');
    console.log('URL:', '/api/events');
    console.log('Method:', 'POST');
    console.log('Event Data:', JSON.stringify(eventData, null, 2));
    console.log('Preview Image:', previewImage.value ? `${previewImage.value.name} (${previewImage.value.size} bytes)` : 'None');
    console.log('Additional Images:', otherImages.map(img => img instanceof File ? `${img.name} (${img.size} bytes)` : 'String URL').join(', '));
    console.log('FormData contents:');
    console.log('  event: JSON blob with event data');
    if (previewImage.value) {
      console.log(`  preview: ${previewImage.value.name} (${previewImage.value.size} bytes, ${previewImage.value.type})`);
    }
    otherImages.forEach((img, index) => {
      if (img instanceof File) {
        console.log(`  images[${index}]: ${img.name} (${img.size} bytes, ${img.type})`);
      }
    });
    console.log('=== END CREATE EVENT REQUEST ===');
    
    await eventsStore.createEventWithImages(formData);

    await showSuccessToast('Мероприятие успешно создано', 2000);
    
    resetForm();
    
    // Сброс и обновление стейта событий для актуального списка
    eventsStore.$reset();
    await eventsStore.fetchEventsSearch({
      userId: authStore.user?.id || 0,
      sortBy: 'id',
      sortOrder: 'DESC',
      size: 1000
    });
    
    router.push('/tabs/events-management');
  } catch (error) {
    console.error('Error creating event:', error);
    await showErrorToast(`Ошибка при создании мероприятия: ${((error as any)?.message || String(error))}`, 3000);
  } finally {
    isSaving.value = false;
  }
};

// Функции для форматирования времени
const formatTimeInput = (event: any) => {
  let value = event.target.value.replace(/[^\d]/g, ''); // Оставляем только цифры

  // Валидация часов (00-23)
  if (value.length >= 2) {
    const hours = parseInt(value.substring(0, 2));
    if (hours > 23) {
      value = '23' + value.substring(2);
    }
  }

  // Валидация минут (00-59)
  if (value.length >= 4) {
    const minutes = parseInt(value.substring(2, 4));
    if (minutes > 59) {
      value = value.substring(0, 2) + '59';
    }
    value = value.substring(0, 4); // Limit to 4 digits
  }

  let formattedValue = value;
  if (value.length > 2) {
    formattedValue = value.substring(0, 2) + ':' + value.substring(2);
  }

  form.value.time = formattedValue;
  if (event.target.value !== formattedValue) {
    event.target.value = formattedValue;
  }
};

const handleTimeFocus = (event: any) => {
  // При фокусе показываем placeholder или текущее значение
  if (!form.value.time) {
    event.target.placeholder = '00:00';
  }
};

onMounted(() => {
  loadEventTypes();
});
</script>

<style scoped>
.create-event-page {
  --background: var(--eco-background-secondary);
}

.create-content {
  --background: var(--eco-background-secondary);
}

.page-title {
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
}

.back-button,
.save-button {
  --color: var(--eco-gray-700);
}

/* Hero секция */
.hero-section {
  background: linear-gradient(135deg, var(--eco-primary) 0%, var(--eco-secondary) 100%);
  padding: var(--eco-space-8) var(--eco-space-4) var(--eco-space-12);
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 400px;
  margin: 0 auto;
}

.hero-icon {
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--eco-space-6) auto;
}

.hero-icon ion-icon {
  font-size: 60px;
  color: white;
}

.hero-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-2xl);
  font-weight: var(--eco-font-weight-bold);
  color: white;
  margin: 0 0 var(--eco-space-3) 0;
  line-height: var(--eco-line-height-tight);
}

.hero-subtitle {
  font-size: var(--eco-font-size-base);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: var(--eco-line-height-normal);
}

/* Контейнер формы */
.form-container {
  padding: var(--eco-space-6) var(--eco-space-4);
  max-width: 600px;
  margin: 0 auto;
}

/* Секции формы */
.form-section {
  margin-bottom: var(--eco-space-6);
  background: var(--eco-white);
  border-radius: var(--eco-radius-lg);
  padding: var(--eco-space-6);
  border: 1px solid var(--eco-gray-200);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--eco-space-3);
  margin-bottom: var(--eco-space-6);
  padding-bottom: var(--eco-space-4);
  border-bottom: 1px solid var(--eco-gray-100);
}

.section-header ion-icon {
  font-size: 24px;
  color: var(--eco-primary);
}

.section-header h2 {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-semibold);
  color: var(--eco-gray-800);
  margin: 0;
}

/* Поля формы */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-5);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-2);
}

/* Строка времени */
.time-row {
  display: flex;
  gap: var(--eco-space-4);
  align-items: flex-end;
}

.half-width {
  flex: 1;
}

.field-label {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-700);
  margin-bottom: var(--eco-space-1);
}

/* Специальные стили для time input */
.time-input {
  font-family: 'Courier New', monospace;
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-medium);
  text-align: center;
  letter-spacing: 1px;
}

.time-input::part(native) {
  font-family: 'Courier New', monospace;
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-medium);
  text-align: center;
  letter-spacing: 1px;
}

/* Стили input элементов */
.eco-input,
.eco-textarea,
.eco-select,
.eco-datetime {
  --background: var(--eco-gray-100);
  --color: var(--eco-gray-800);
  --border-radius: var(--eco-radius-lg);
  --padding-start: var(--eco-space-4);
  --padding-end: var(--eco-space-4);
  --padding-top: var(--eco-space-3);
  --padding-bottom: var(--eco-space-3);
  font-size: var(--eco-font-size-base);
  border: 1px solid transparent;
  transition: all var(--eco-transition-normal);
  --highlight-height: 0;
  --box-shadow: none;
}

/* iOS стилизация селекта */
.ios-select {
  --background: var(--eco-gray-100);
  --color: var(--eco-gray-800);
  border-radius: 12px;
  border: 1px solid transparent;
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
  transition: all 0.2s ease;
  --box-shadow: none;
}



/* Глобальные стили для iOS action sheet */
:root {
  --ion-action-sheet-background: #f2f2f7;
  --ion-action-sheet-button-background: white;
  --ion-action-sheet-button-background-selected: #007aff;
  --ion-action-sheet-button-color: #000;
  --ion-action-sheet-button-color-selected: white;
  --ion-action-sheet-group-background: white;
}

/* Стили для iOS селекта */
ion-action-sheet {
  --background: transparent;
}

ion-action-sheet .action-sheet-wrapper {
  background: transparent !important;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  margin: 0 8px 8px 8px;
}

ion-action-sheet .action-sheet-container {
  background: #f2f2f7 !important;
  border-radius: 20px 20px 0 0;
  padding: 16px 0;
}

ion-action-sheet .action-sheet-title {
  color: #8e8e93 !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  text-transform: none !important;
  padding: 16px 16px 8px 16px !important;
  background: white !important;
  margin: 0 16px 8px 16px !important;
  border-radius: 14px 14px 0 0 !important;
}

ion-action-sheet .action-sheet-group {
  background: white !important;
  border-radius: 14px !important;
  margin: 0 16px 8px 16px !important;
  overflow: hidden;
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
}

ion-action-sheet .action-sheet-button {
  background: white !important;
  color: #000 !important;
  font-size: 17px !important;
  font-weight: 400 !important;
  height: 56px !important;
  border-bottom: 0.5px solid #e5e5ea !important;
  padding: 0 20px !important;
  text-align: left !important;
  position: relative !important;
}

ion-action-sheet .action-sheet-button:last-child {
  border-bottom: none !important;
}

ion-action-sheet .action-sheet-button.action-sheet-selected {
  background: white !important;
  color: #007aff !important;
  font-weight: 600 !important;
}

ion-action-sheet .action-sheet-button.action-sheet-selected::after {
  content: '✓';
  position: absolute;
  right: 20px;
  color: #007aff;
  font-weight: 600;
  font-size: 18px;
}

ion-action-sheet .action-sheet-button.action-sheet-cancel {
  background: white !important;
  color: #007aff !important;
  font-weight: 600 !important;
  border-radius: 14px !important;
  margin: 0 16px 16px 16px !important;
  border-bottom: none !important;
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
}

.date-button {
  --background: var(--eco-gray-100);
  --color: var(--eco-gray-800);
  --border-radius: var(--eco-radius-lg);
  font-size: var(--eco-font-size-base);
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
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
  --box-shadow: none;
}

.date-button.error {
  border-color: var(--eco-error);
}



.date-button.ion-activated {
  --background: var(--eco-gray-200);
  transform: scale(0.98);
  --box-shadow: none;
}

.date-button.ion-focused {
  box-shadow: 0 0 0 2px var(--eco-primary);
}

/* Стили для кнопки времени */
.time-button {
  --background: var(--eco-white);
  --background-activated: var(--eco-gray-50);
  --border-color: var(--eco-gray-300);
  --border-radius: var(--eco-radius-md);
  --color: var(--eco-gray-800);
  --padding-start: var(--eco-space-4);
  --padding-end: var(--eco-space-4);
  height: 48px;
  font-size: var(--eco-font-size-base);
  text-transform: none;
  justify-content: flex-start;
}

.time-button.error {
  --border-color: var(--eco-error);
}

.time-button ion-icon {
  margin-right: var(--eco-space-2);
  color: var(--eco-gray-600);
}

/* Стили для модального окна выбора времени */
.time-modal-content {
  --background: var(--eco-white);
  padding: var(--eco-space-4);
}

.time-modal-picker {
  --color: var(--eco-gray-800);
  --background: var(--eco-white);
  margin: var(--eco-space-4) 0;
}

.time-modal-actions {
  padding: var(--eco-space-4) 0;
}

.confirm-time-button {
  --background: var(--eco-primary);
  --background-activated: var(--eco-primary-dark);
  --color: white;
  --border-radius: var(--eco-radius-lg);
  height: 48px;
  font-weight: var(--eco-font-weight-semibold);
}

/* Компактный datetime */
.eco-datetime-compact {
  --color: var(--eco-gray-800);
  --background: var(--eco-white);
  --background-rgb: 255, 255, 255;
  border: 1px solid var(--eco-gray-300);
  border-radius: var(--eco-radius-md);
  padding: var(--eco-space-2);
  max-height: 80px;
  overflow: hidden;
}

.eco-datetime-compact.error {
  border-color: var(--eco-error);
}

.eco-datetime-compact ion-picker-column {
  --color: var(--eco-gray-800);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-medium);
}

.eco-datetime-compact ion-picker-column-option {
  --color: var(--eco-gray-800);
  --background: transparent;
  height: 35px;
  line-height: 35px;
}

.eco-datetime-compact ion-picker-column-option.picker-opt-selected {
  --color: var(--eco-primary);
  --background: rgba(53, 90, 221, 0.1);
  font-weight: var(--eco-font-weight-semibold);
}

/* Специальные стили для селекта */
.eco-select {
  --placeholder-color: var(--eco-gray-600);
  --padding-end: 40px;
  color: var(--eco-gray-800) !important;
  background: var(--eco-white) !important;
  position: relative;
}

.eco-select::part(native) {
  color: var(--eco-gray-800);
  background: var(--eco-white);
  padding-right: 40px !important;
}

.eco-select::part(icon) {
  color: var(--eco-gray-600);
  opacity: 1;
  position: absolute !important;
  right: var(--eco-space-3) !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin: 0 !important;
}

.eco-input.error,
.eco-textarea.error,
.eco-select.error,
.eco-datetime.error {
  --border-color: var(--eco-error);
  border: 1px solid var(--border-color);
}

.eco-textarea {
  min-height: 100px;
  resize: vertical;
}

/* Checkbox группы */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--eco-space-4);
  margin-top: var(--eco-space-2);
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: var(--eco-space-3);
}

.eco-checkbox {
  --color: var(--eco-primary);
  --background: white;
  --background-checked: var(--eco-primary);
  --border-color: var(--eco-gray-300);
  --border-style: solid;
  --border-width: 2px;
  --checkmark-color: white;
  margin-top: 2px;
  background: white !important;
}

.eco-checkbox::part(container) {
  background: white !important;
  border: 2px solid var(--eco-gray-300) !important;
  border-radius: 4px;
}

.eco-checkbox.checkbox-checked::part(container) {
  background: var(--eco-primary) !important;
  border-color: var(--eco-primary) !important;
}

.checkbox-label {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-700);
  line-height: var(--eco-line-height-normal);
  cursor: pointer;
  flex: 1;
}

/* Footer */
.action-footer {
  padding: var(--eco-space-4);
  background: var(--eco-white);
  border-top: 1px solid var(--eco-gray-200);
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
}

.create-button {
  --background: var(--eco-success);
  --background-activated: var(--eco-success-dark);
  --color: white;
  --border-radius: var(--eco-radius-lg);
  height: 56px;
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
  --box-shadow: none;
}

.create-button:disabled {
  --opacity: 0.6;
}

/* Отзывчивость */
@media (max-width: 768px) and (min-width: 481px) {
  /* Средние экраны - сохраняем двухколоночный макет времени */
  .time-row {
    display: flex;
    gap: var(--eco-space-3);
  }
  
  .half-width {
    flex: 1;
  }
  
  .eco-time-picker {
    --height: 45px;
    --max-height: 45px;
  }
  
  .form-container {
    padding: var(--eco-space-5) var(--eco-space-3);
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--eco-space-6) var(--eco-space-3) var(--eco-space-8);
  }
  
  .hero-title {
    font-size: var(--eco-font-size-xl);
  }
  
  .form-container {
    padding: var(--eco-space-4) var(--eco-space-3);
  }
  
  .form-section {
    padding: var(--eco-space-4);
    margin-bottom: var(--eco-space-4);
  }
  
  .section-header {
    margin-bottom: var(--eco-space-4);
    padding-bottom: var(--eco-space-3);
  }
  
  .form-fields {
    gap: var(--eco-space-4);
  }
  
  /* Время на мобильных - всегда в две колонки */
  .time-row {
    display: flex;
    gap: var(--eco-space-3);
  }
  
  .half-width {
    flex: 1;
  }
  
  .eco-time-picker {
    --height: 45px;
    --max-height: 45px;
  }
  
  .action-footer {
    padding: var(--eco-space-3);
  }
}

/* Специальные стили для календаря */
.eco-datetime {
  --color: var(--eco-gray-800);
  background: var(--eco-white) !important;
}

.eco-datetime::part(native) {
  color: var(--eco-gray-800);
  background: var(--eco-white);
}

/* Компактный выбор времени */
.eco-time-picker {
  --max-height: 50px;
  --height: 50px;
  border-radius: var(--eco-radius-md);
  border: 1px solid var(--eco-gray-300);
  overflow: hidden;
}

.eco-time-picker ion-picker-column {
  --color: var(--eco-gray-800);
  font-size: var(--eco-font-size-base);
}

.eco-time-picker ion-picker-column-option {
  --color: var(--eco-gray-800);
  --background: transparent;
  font-weight: var(--eco-font-weight-medium);
  height: 40px;
  line-height: 40px;
}

.eco-time-picker ion-picker-column-option.picker-opt-selected {
  --color: var(--eco-primary);
  --background: rgba(53, 90, 221, 0.1);
  font-weight: var(--eco-font-weight-semibold);
}

/* Стили для календарного попапа */
ion-datetime {
  --color: var(--eco-gray-800);
  --background: var(--eco-white);
  --background-rgb: 255, 255, 255;
}

ion-datetime::part(calendar-day) {
  color: var(--eco-gray-800);
}

ion-datetime::part(calendar-day-today) {
  color: var(--eco-primary);
  font-weight: var(--eco-font-weight-semibold);
}

ion-datetime::part(calendar-day-active) {
  background: var(--eco-primary);
  color: white;
}

ion-datetime::part(month-year-button) {
  color: var(--eco-gray-800);
}

ion-datetime::part(calendar-day-disabled) {
  color: var(--eco-gray-600);
}

ion-datetime::part(time-button) {
  color: var(--eco-gray-800);
}

/* Стили для кнопки времени */
.time-button {
  --background: var(--eco-white);
  --background-activated: var(--eco-gray-50);
  --border-color: var(--eco-gray-300);
  --border-radius: var(--eco-radius-md);
  --color: var(--eco-gray-800);
  --padding-start: var(--eco-space-4);
  --padding-end: var(--eco-space-4);
  height: 48px;
  font-size: var(--eco-font-size-base);
  text-transform: none;
  justify-content: flex-start;
}

.time-button.error {
  --border-color: var(--eco-error);
}

.time-button ion-icon {
  margin-right: var(--eco-space-2);
  color: var(--eco-gray-600);
}

/* Стили для модального окна выбора времени */
.time-modal-content {
  --background: var(--eco-white);
  padding: var(--eco-space-4);
}

.time-modal-picker {
  --color: var(--eco-gray-800);
  --background: var(--eco-white);
  margin: var(--eco-space-4) 0;
}

.time-modal-actions {
  padding: var(--eco-space-4) 0;
}

.confirm-time-button {
  --background: var(--eco-primary);
  --background-activated: var(--eco-primary-dark);
  --color: white;
  --border-radius: var(--eco-radius-lg);
  height: 48px;
  font-weight: var(--eco-font-weight-semibold);
}

/* Компактный datetime */
.eco-datetime-compact {
  --color: var(--eco-gray-800);
  --background: var(--eco-white);
  --background-rgb: 255, 255, 255;
  border: 1px solid var(--eco-gray-300);
  border-radius: var(--eco-radius-md);
  padding: var(--eco-space-2);
  max-height: 80px;
  overflow: hidden;
}

.eco-datetime-compact.error {
  border-color: var(--eco-error);
}

.eco-datetime-compact ion-picker-column {
  --color: var(--eco-gray-800);
  font-size: var(--eco-font-size-lg);
  font-weight: var(--eco-font-weight-medium);
}

.eco-datetime-compact ion-picker-column-option {
  --color: var(--eco-gray-800);
  --background: transparent;
  height: 35px;
  line-height: 35px;
}

.eco-datetime-compact ion-picker-column-option.picker-opt-selected {
  --color: var(--eco-primary);
  --background: rgba(53, 90, 221, 0.1);
  font-weight: var(--eco-font-weight-semibold);
}

ion-action-sheet .action-sheet-button.action-sheet-cancel {
  background: white !important;
  color: #007aff !important;
  font-weight: 600 !important;
  border-radius: 14px !important;
  margin: 0 16px 16px 16px !important;
  border-bottom: none !important;
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
}

.download-placeholder ion-icon {
  font-size: 48px;
  color: var(--eco-gray-600);
}

/* Стили для загрузки изображения */
.field-hint {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-600);
  margin-bottom: var(--eco-space-3);
  line-height: var(--eco-line-height-normal);
}

.image-upload-container {
  border: 2px dashed var(--eco-gray-300);
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
  transition: all var(--eco-transition-normal);
}

.image-upload-container:hover {
  border-color: var(--eco-primary);
  background: rgba(53, 90, 221, 0.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--eco-space-8) var(--eco-space-4);
  text-align: center;
  cursor: pointer;
  transition: all var(--eco-transition-normal);
}

.upload-placeholder:hover {
  background: rgba(53, 90, 221, 0.05);
}

.upload-placeholder ion-icon {
  font-size: 48px;
  color: var(--eco-gray-400);
  margin-bottom: var(--eco-space-3);
  transition: color var(--eco-transition-normal);
}

.upload-placeholder:hover ion-icon {
  color: var(--eco-primary);
}

.upload-placeholder p {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-700);
  margin: 0 0 var(--eco-space-1) 0;
  font-weight: var(--eco-font-weight-medium);
}

.upload-placeholder small {
  font-size: var(--eco-font-size-sm);
  color: var(--eco-gray-600);
}

.image-preview {
  position: relative;
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--eco-gray-50);
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--eco-radius-md);
}

.image-overlay {
  position: absolute;
  top: var(--eco-space-3);
  right: var(--eco-space-3);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  backdrop-filter: blur(4px);
}

.remove-image-button {
  --color: white;
  --background: transparent;
  --background-activated: rgba(255, 255, 255, 0.1);
  --padding-start: 8px;
  --padding-end: 8px;
  --border-radius: 50%;
  width: 40px;
  height: 40px;
}

.remove-image-button ion-icon {
  font-size: 20px;
}

.change-image-button {
  --border-color: var(--eco-primary);
  --color: var(--eco-primary);
  --background: transparent;
  --background-activated: rgba(53, 90, 221, 0.1);
  --border-radius: var(--eco-radius-md);
  margin-top: var(--eco-space-3);
  height: 44px;
  font-weight: var(--eco-font-weight-medium);
}

.change-image-button ion-icon {
  font-size: 18px;
}

/* Отзывчивость для загрузки изображения */
@media (max-width: 480px) {
  .image-preview {
    min-height: 150px;
  }
  
  .preview-image {
    max-height: 200px;
  }
  
  .upload-placeholder {
    padding: var(--eco-space-6) var(--eco-space-3);
  }
  
  .upload-placeholder ion-icon {
    font-size: 40px;
  }
}
</style> 
