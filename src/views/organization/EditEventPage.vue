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
                <ion-select 
                  v-model="form.eventTypeId" 
                  placeholder="Выберите тип мероприятия"
                  class="eco-select"
                  :class="{ 'error': !form.eventTypeId && showErrors }"
                >
                  <ion-select-option v-for="type in eventTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </ion-select-option>
                </ion-select>
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
                <ion-datetime 
                  v-model="form.date"
                  presentation="date"
                  :min="minDate"
                  class="eco-datetime"
                  :class="{ 'error': !form.date && showErrors }"
                ></ion-datetime>
              </div>
              
              <div class="field-group">
                <label class="field-label">Время начала *</label>
                <ion-datetime 
                  v-model="form.time"
                  presentation="time"
                  class="eco-datetime"
                  :class="{ 'error': !form.time && showErrors }"
                ></ion-datetime>
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

          <!-- Дополнительные настройки -->
          <div class="form-section eco-card">
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
            </div>
          </div>
        </form>
      </div>
    </ion-content>

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
  IonSpinner,
  toastController
} from '@ionic/vue';
import { checkmarkOutline, createOutline, informationCircleOutline, timeOutline, locationOutline, mailOutline, settingsOutline } from 'ionicons/icons';
import { useEventsStore } from '../../stores';
import { useEventTypesStore } from '../../stores';
import { useAuthStore } from '../../stores/auth';
import type { EventTypeDTO } from '../../types/api';

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
  location: '',
  contactEmail: '',
  contactPhone: '',
  maxParticipants: null as number | null
});

const showErrors = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const eventTypes = ref<EventTypeDTO[]>([]);

const minDate = new Date().toISOString();

const isFormValid = computed(() => {
  return form.value.title &&
         form.value.description &&
         form.value.eventTypeId &&
         form.value.date &&
         form.value.time &&
         form.value.location;
});

const loadEvent = async () => {
  isLoading.value = true;
  try {
    await eventsStore.fetchEventById(eventId);
    const event = eventsStore.getCurrentEvent;
    if (event) {
      const eventDate = new Date(event.startTime);
      form.value = {
        title: event.title,
        description: event.description,
        eventTypeId: Number(event.eventType.id),
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        location: event.location,
        contactEmail: (event as any).contactEmail || '',
        contactPhone: (event as any).contactPhone || '',
        maxParticipants: (event as any).maxParticipants ?? null,
      };
    }
  } catch (error) {
    console.error('Error loading event:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки мероприятия',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
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
    const toast = await toastController.create({
      message: 'Ошибка загрузки типов мероприятий',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
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
    const eventData = {
      title: form.value.title,
      description: form.value.description,
      startTime: new Date(`${form.value.date}T${form.value.time}`).toISOString(),
      endTime: new Date(new Date(form.value.date).getTime() + 3600000).toISOString(),
      location: form.value.location,
      conducted: false,
      eventTypeId: eventType?.id!,
      userId: authStore.user?.id || 1
    };

    await eventsStore.updateEvent(eventId, eventData);
    const toast = await toastController.create({
      message: 'Мероприятие успешно обновлено',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    router.push(`/event/${eventId}`);
  } catch (error) {
    console.error('Error updating event:', error);
    const toast = await toastController.create({
      message: 'Ошибка при обновлении мероприятия',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadEvent();
  loadEventTypes();
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
  background: linear-gradient(135deg, var(--eco-secondary) 0%, var(--eco-tertiary) 100%);
  padding: var(--eco-space-6) var(--eco-space-4) var(--eco-space-8);
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 400px;
  margin: 0 auto;
}

.hero-icon {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--eco-space-4) auto;
  backdrop-filter: blur(8px);
}

.hero-icon ion-icon {
  font-size: 36px;
  color: white;
}

.hero-title {
  font-family: var(--eco-font-family);
  font-size: var(--eco-font-size-xl);
  font-weight: var(--eco-font-weight-bold);
  color: white;
  margin: 0 0 var(--eco-space-2) 0;
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

.field-label {
  font-size: var(--eco-font-size-sm);
  font-weight: var(--eco-font-weight-medium);
  color: var(--eco-gray-700);
  margin-bottom: var(--eco-space-1);
}

/* Стили input элементов */
.eco-input,
.eco-textarea,
.eco-select,
.eco-datetime {
  --background: var(--eco-white);
  --color: var(--eco-gray-800);
  --border-color: var(--eco-gray-300);
  --border-radius: var(--eco-radius-md);
  --padding-start: var(--eco-space-4);
  --padding-end: var(--eco-space-4);
  --padding-top: var(--eco-space-3);
  --padding-bottom: var(--eco-space-3);
  font-size: var(--eco-font-size-base);
  border: 1px solid var(--border-color);
  transition: all var(--eco-transition-normal);
}

.eco-input:focus,
.eco-textarea:focus,
.eco-select:focus,
.eco-datetime:focus {
  --border-color: var(--eco-secondary);
  box-shadow: 0 0 0 3px rgba(25, 158, 255, 0.1);
}

.eco-input.error,
.eco-textarea.error,
.eco-select.error,
.eco-datetime.error {
  --border-color: var(--eco-error);
}

.eco-textarea {
  min-height: 100px;
  resize: vertical;
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
}

.save-button-main:disabled {
  --opacity: 0.6;
}

/* Отзывчивость */
@media (max-width: 480px) {
  .hero-section {
    padding: var(--eco-space-4) var(--eco-space-3) var(--eco-space-6);
  }
  
  .hero-title {
    font-size: var(--eco-font-size-lg);
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
  
  .action-footer {
    padding: var(--eco-space-3);
  }
}
</style> 
