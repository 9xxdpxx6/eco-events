<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/event/${eventId}`"></ion-back-button>
        </ion-buttons>
        <ion-title>Редактировать мероприятие</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="saveChanges" :disabled="!isFormValid || isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Загружаем данные мероприятия...</p>
      </div>

      <form v-else @submit.prevent="saveChanges">
        <!-- Основная информация -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Основная информация</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Название мероприятия *</ion-label>
              <ion-input 
                v-model="form.title" 
                placeholder="Введите название"
                :class="{ 'ion-invalid': !form.title && showErrors }"
              ></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Описание *</ion-label>
              <ion-textarea 
                v-model="form.description" 
                placeholder="Опишите мероприятие, цели и задачи"
                :rows="4"
                :class="{ 'ion-invalid': !form.description && showErrors }"
              ></ion-textarea>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Тип мероприятия *</ion-label>
              <ion-select 
                v-model="form.eventTypeId" 
                placeholder="Выберите тип мероприятия"
                :class="{ 'ion-invalid': !form.eventTypeId && showErrors }"
              >
                <ion-select-option v-for="type in eventTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Дата и время -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Дата и время</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Дата проведения *</ion-label>
              <ion-datetime 
                v-model="form.date"
                presentation="date"
                :min="minDate"
                :class="{ 'ion-invalid': !form.date && showErrors }"
              ></ion-datetime>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Время начала *</ion-label>
              <ion-datetime 
                v-model="form.time"
                presentation="time"
                :class="{ 'ion-invalid': !form.time && showErrors }"
              ></ion-datetime>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Место проведения -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Место проведения</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Адрес *</ion-label>
              <ion-input 
                v-model="form.location" 
                placeholder="Укажите адрес или место сбора"
                :class="{ 'ion-invalid': !form.location && showErrors }"
              ></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Контактная информация -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Контактная информация</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Email для связи</ion-label>
              <ion-input 
                type="email" 
                v-model="form.contactEmail" 
                placeholder="contact@organization.com"
              ></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Телефон для связи</ion-label>
              <ion-input 
                type="tel" 
                v-model="form.contactPhone" 
                placeholder="+7 (999) 123-45-67"
              ></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Дополнительные настройки -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Дополнительные настройки</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Максимальное количество участников</ion-label>
              <ion-input 
                type="number" 
                v-model="form.maxParticipants" 
                placeholder="Без ограничений"
                min="1"
              ></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>
      </form>
    </ion-content>

    <!-- Кнопки действий -->
    <ion-footer v-if="!isLoading">
      <ion-toolbar>
        <ion-button 
          expand="block" 
          @click="saveChanges" 
          :disabled="!isFormValid || isSaving"
        >
          <ion-icon :icon="checkmarkOutline" slot="start" />
          {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
        </ion-button>
      </ion-toolbar>
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
import { checkmarkOutline } from 'ionicons/icons';
import { useEventsStore } from '../stores';
import { useEventTypesStore } from '../stores';
import type { EventTypeDTO } from '../types/api';

const router = useRouter();
const route = useRoute();
const eventsStore = useEventsStore();
const eventTypesStore = useEventTypesStore();

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
      contactEmail: form.value.contactEmail,
      contactPhone: form.value.contactPhone,
      maxParticipants: form.value.maxParticipants,
      requiresRegistration: false,
      providesEquipment: false,
      minAge: null,
      requirements: '',
      conducted: false,
      eventType: {
        id: eventType?.id,
        name: eventType?.name || '',
        description: eventType?.description || ''
      }
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
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--ion-color-medium);
}

ion-card {
  margin: 16px;
}

ion-footer {
  padding: 16px;
}

.ion-invalid {
  --border-color: var(--ion-color-danger);
}
</style> 