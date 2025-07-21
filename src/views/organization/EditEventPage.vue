<template>
  <ion-page class="edit-event-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/event/${eventId}`" class="back-button"></ion-back-button>
        </ion-buttons>
        <ion-title class="page-title">Редактировать мероприятие</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="saveChanges" :disabled="!isFormValid || isSaving" class="save-button">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="edit-content">
      <!-- Лоадер -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>
        <p class="loading-text">Загружаем данные мероприятия...</p>
      </div>

      <!-- Hero секция -->
      <div v-else class="hero-section">
        <div class="hero-content">
          <div class="hero-icon">
            <ion-icon :icon="createOutline" />
          </div>
          <h1 class="hero-title">Редактирование</h1>
          <p class="hero-subtitle">Внесите изменения в своё мероприятие</p>
        </div>
      </div>

      <div v-if="!isLoading" class="form-container">
        <form @submit.prevent="saveChanges">
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

          <!-- Контактная информация -->
          <div class="form-section eco-card">
            <div class="section-header">
              <ion-icon :icon="mailOutline" />
              <h2>Контактная информация</h2>
            </div>
            
            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Email для связи</label>
                <ion-input 
                  type="email" 
                  v-model="form.contactEmail" 
                  placeholder="contact@organization.com"
                  class="eco-input"
                ></ion-input>
              </div>
              
              <div class="field-group">
                <label class="field-label">Телефон для связи</label>
                <ion-input 
                  type="tel" 
                  v-model="form.contactPhone" 
                  placeholder="+7 (999) 123-45-67"
                  class="eco-input"
                ></ion-input>
              </div>
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
    <ion-footer v-if="!isLoading" class="action-footer">
      <div class="footer-content">
        <ion-button 
          expand="block" 
          @click="saveChanges" 
          :disabled="!isFormValid || isSaving"
          class="save-button-main"
        >
          <ion-icon :icon="checkmarkOutline" slot="start" />
          {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
  IonSpinner
} from '@ionic/vue';
import { checkmarkOutline, createOutline, informationCircleOutline, timeOutline, locationOutline, mailOutline, settingsOutline, peopleOutline, imageOutline, trashOutline, refreshOutline, calendarOutline } from 'ionicons/icons';
import { useEventsStore } from '../../stores';
import { useEventTypesStore } from '../../stores';
import { useAuthStore } from '../../stores/auth';
import type { EventTypeDTO, EventResponseMediumDTO } from '../../types/api';
import { IMAGE_BASE_URL } from '../../api/client';
import { API_URL } from '../../api/client';
import EcoCalendar from '../../components/EcoCalendar.vue';
import EcoSelect from '../../components/EcoSelect.vue';
import ImageUploader from '../../components/ImageUploader.vue';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const router = useRouter();
const route = useRoute();
const eventsStore = useEventsStore();
const eventTypesStore = useEventTypesStore();
const authStore = useAuthStore();

const eventId = parseInt(route.params.id as string);
const form = ref({
  title: '',
  description: '',
  eventTypeId: null as number | null,
  date: '',
  time: '',
  duration: '2',
  location: '',
  locationDetails: '',
  contactEmail: '',
  contactPhone: '',
  maxParticipants: null as number | null,
  requiresRegistration: true,
  providesEquipment: false,
  minAge: null as number | null,
  requirements: ''
});

const showErrors = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const eventTypes = ref<EventTypeDTO[]>([]);
const images = ref<(File | string)[]>([]);
const previewImage = ref<File | string | null>(null);
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
  previewImage.value = file;
};


const loadEvent = async () => {
  isLoading.value = true;
  try {
    await eventsStore.fetchEventById(eventId);
    const event = eventsStore.getCurrentEvent as any;

    if (event) {
      const eventDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);
      const durationHours = Math.round((endDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60));
      
      form.value = {
        title: event.title,
        description: event.description,
        eventTypeId: Number(event.eventType.id),
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        duration: durationHours.toString(),
        location: event.location,
        locationDetails: (event as any).locationDetails || '',
        contactEmail: (event as any).contactEmail || '',
        contactPhone: (event as any).contactPhone || '',
        maxParticipants: (event as any).maxParticipants ?? null,
        requiresRegistration: (event as any).requiresRegistration ?? true,
        providesEquipment: (event as any).providesEquipment ?? false,
        minAge: (event as any).minAge ?? null,
        requirements: (event as any).requirements || ''
      };
      
      images.value = [];
      // Устанавливаем превью и другие изображения
      if (event.preview) {
        images.value.push(
          event.preview.startsWith('uploads/')
            ? `${API_URL}/${event.preview}`
            : `${IMAGE_BASE_URL}/${event.preview}`
        );
      }
      if (event.images) {
        const otherImages = event.images
          .map((img: { filePath: string; }) =>
            img.filePath.startsWith('uploads/')
              ? `${API_URL}/${img.filePath}`
              : `${IMAGE_BASE_URL}/${img.filePath}`
          )
          .filter((path: string) => path !== (event.preview
            ? (event.preview.startsWith('uploads/')
                ? `${API_URL}/${event.preview}`
                : `${IMAGE_BASE_URL}/${event.preview}`)
            : ''));
        images.value.push(...otherImages);
      }

      if (images.value.length > 0) {
        // Устанавливаем превью, если оно есть
        const previewUrl = event.preview
          ? (event.preview.startsWith('uploads/')
              ? `${API_URL}/${event.preview}`
              : `${IMAGE_BASE_URL}/${event.preview}`)
          : '';
        const previewIndex = images.value.findIndex(img => img === previewUrl);
        if (previewIndex !== -1) {
          // Перемещаем превью в начало массива
          const [preview] = images.value.splice(previewIndex, 1);
          images.value.unshift(preview);
          previewImage.value = preview;
        } else {
          previewImage.value = images.value[0];
        }
      }
    }
  } catch (error) {
    console.error('Error loading event:', error);
    await showErrorToast('Ошибка загрузки мероприятия', 3000);
    router.push('/tabs/events-management');
  } finally {
    isLoading.value = false;
  }
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

const loadUserContactInfo = () => {
  if (authStore.user) {
    const user = authStore.user as any;
    if (!form.value.contactEmail && user.email) {
      form.value.contactEmail = user.email;
    }
    if (!form.value.contactPhone && user.phoneNumber) {
      form.value.contactPhone = user.phoneNumber;
    }
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

const saveChanges = async () => {
  if (!isFormValid.value) {
    showErrors.value = true;
    return;
  }

  isSaving.value = true;
  try {
    const eventType = eventTypes.value.find(t => t.id === Number(form.value.eventTypeId));
    if (!eventType) throw new Error('Тип мероприятия не найден');
    
    let startTime = '';
    if (form.value.time && form.value.time.includes('T')) {
      startTime = form.value.time;
    } else if (form.value.date && form.value.time) {
      const datePart = form.value.date.split('T')[0];
      let timePart = form.value.time;
      if (timePart.length <= 5) timePart += ':00';
      startTime = new Date(`${datePart}T${timePart}`).toISOString();
    }
    if (!startTime || isNaN(Date.parse(startTime))) throw new Error('Некорректная дата/время');
    
    const duration = Number(form.value.duration) || 2;
    const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 60 * 1000).toISOString();
    
    let previewPath: string | undefined = undefined;
    if (previewImage.value) {
      if (typeof previewImage.value === 'string') {
        previewPath = previewImage.value.replace(IMAGE_BASE_URL, '');
      } else {
        // Если превью - новый файл, то на бэке он определится из multipart-поля 'preview'
        previewPath = undefined;
      }
    }

    const eventData = {
      id: eventId,
      title: form.value.title,
      description: form.value.description,
      startTime,
      endTime,
      location: form.value.location,
      eventTypeId: eventType.id!,
      userId: authStore.user?.id || 1,
      preview: previewPath,
      currentImages: images.value
        .filter(img => typeof img === 'string')
        .map(url => ({ filePath: (url as string).replace(IMAGE_BASE_URL, '') }))
    };

    const formData = new FormData();
    formData.append('event', new Blob([JSON.stringify(eventData)], { type: 'application/json' }));
    
    const newFiles = images.value.filter(img => img instanceof File) as File[];

    if (previewImage.value instanceof File) {
      formData.append('preview', previewImage.value);
    } 

    newFiles.forEach(file => {
        if(file !== previewImage.value) {
            formData.append('images', file);
        }
    });

    await eventsStore.updateEventWithImages(eventId, formData);
    
    await showSuccessToast('Мероприятие успешно обновлено', 2000);
    
    // Сброс и обновление стейта событий для актуального списка и деталей
    eventsStore.$reset();
    await eventsStore.fetchEventsSearch({
      userId: authStore.user?.id || 0,
      sortBy: 'id',
      sortOrder: 'DESC',
      size: 1000
    });
    
    router.push(`/tabs/events-management`);
  } catch (error) {
    console.error('Error updating event:', error);
    await showErrorToast(`Ошибка при обновлении мероприятия: ${((error as any)?.message || String(error))}`, 3000);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadEvent();
  loadEventTypes();
  loadUserContactInfo();
});
</script>

<style scoped>
.edit-event-page {
  --background: var(--eco-background-secondary);
}

.edit-content {
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

/* Лоадер */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  padding: var(--eco-space-6);
}

.loading-spinner {
  margin-bottom: var(--eco-space-4);
}

.loading-text {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-500);
  margin: 0;
}

/* Hero секция */
.hero-section {
  background: linear-gradient(135deg, var(--eco-secondary) 0%, var(--eco-success) 100%);
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
  color: var(--eco-secondary);
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
  box-shadow: 0 0 0 2px var(--eco-secondary);
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
  --color: var(--eco-secondary);
  --background: white;
  --background-checked: var(--eco-secondary);
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
  background: var(--eco-secondary) !important;
  border-color: var(--eco-secondary) !important;
}

.checkbox-label {
  font-size: var(--eco-font-size-base);
  color: var(--eco-gray-700);
  line-height: var(--eco-line-height-normal);
  cursor: pointer;
  flex: 1;
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
  border-color: var(--eco-secondary);
  background: rgba(25, 158, 255, 0.02);
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
  background: rgba(25, 158, 255, 0.05);
}

.upload-placeholder ion-icon {
  font-size: 48px;
  color: var(--eco-gray-400);
  margin-bottom: var(--eco-space-3);
  transition: color var(--eco-transition-normal);
}

.upload-placeholder:hover ion-icon {
  color: var(--eco-secondary);
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
  --border-color: var(--eco-secondary);
  --color: var(--eco-secondary);
  --background: transparent;
  --background-activated: rgba(25, 158, 255, 0.1);
  --border-radius: var(--eco-radius-md);
  margin-top: var(--eco-space-3);
  height: 44px;
  font-weight: var(--eco-font-weight-medium);
}

.change-image-button ion-icon {
  font-size: 18px;
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
  color: var(--eco-secondary);
  font-weight: var(--eco-font-weight-semibold);
}

ion-datetime::part(calendar-day-active) {
  background: var(--eco-secondary);
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

.save-button-main {
  --background: var(--eco-secondary);
  --background-activated: var(--eco-secondary-dark);
  --color: white;
  --border-radius: var(--eco-radius-lg);
  height: 56px;
  font-size: var(--eco-font-size-base);
  font-weight: var(--eco-font-weight-semibold);
  --box-shadow: none;
}

.save-button-main:disabled {
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
  
  /* Отзывчивость для загрузки изображения */
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
