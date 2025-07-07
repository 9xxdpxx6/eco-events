<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/events-management"></ion-back-button>
        </ion-buttons>
        <ion-title>Создать мероприятие</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="saveEvent" :disabled="!isFormValid || isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <form @submit.prevent="saveEvent">
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
            
            <ion-item>
              <ion-label position="stacked">Продолжительность (часов)</ion-label>
              <ion-input 
                type="number" 
                v-model="form.duration" 
                placeholder="2"
                min="1"
                max="12"
              ></ion-input>
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
            
            <ion-item>
              <ion-label position="stacked">Подробности места</ion-label>
              <ion-textarea 
                v-model="form.locationDetails" 
                placeholder="Дополнительная информация о месте встречи"
                :rows="2"
              ></ion-textarea>
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
            
            <ion-item>
              <ion-checkbox v-model="form.requiresRegistration" />
              <ion-label class="ion-margin-start">Требуется предварительная регистрация</ion-label>
            </ion-item>
            
            <ion-item>
              <ion-checkbox v-model="form.providesEquipment" />
              <ion-label class="ion-margin-start">Организация предоставляет инвентарь</ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Требования к участникам -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Требования к участникам</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Минимальный возраст</ion-label>
              <ion-input 
                type="number" 
                v-model="form.minAge" 
                placeholder="Без ограничений"
                min="0"
                max="100"
              ></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Что необходимо взять с собой</ion-label>
              <ion-textarea 
                v-model="form.requirements" 
                placeholder="Удобная одежда, перчатки, вода..."
                :rows="3"
              ></ion-textarea>
            </ion-item>
          </ion-card-content>
        </ion-card>
      </form>
    </ion-content>

    <!-- Кнопки действий -->
    <ion-footer>
      <ion-toolbar>
        <ion-button 
          expand="block" 
          @click="saveEvent" 
          :disabled="!isFormValid || isSaving"
        >
          <ion-icon :icon="checkmarkOutline" slot="start" />
          {{ isSaving ? 'Создание...' : 'Создать мероприятие' }}
        </ion-button>
      </ion-toolbar>
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
  toastController,
  alertController
} from '@ionic/vue';
import { checkmarkOutline } from 'ionicons/icons';
import { useEventsStore } from '../../stores';
import { useEventTypesStore } from '../../stores';
import { useAuthStore } from '../../stores/auth';
import type { EventTypeDTO } from '../../types/api';

const router = useRouter();
const eventsStore = useEventsStore();
const eventTypesStore = useEventTypesStore();
const authStore = useAuthStore();

const form = ref({
  title: '',
  description: '',
  eventTypeId: null as number | null,
  date: '',
  time: '',
  duration: 2,
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

const saveEvent = async () => {
  if (!isFormValid.value) {
    showErrors.value = true;
    return;
  }

  isSaving.value = true;
  try {
    // Получаем тип мероприятия полностью
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
    const eventData = {
      title: form.value.title,
      description: form.value.description,
      startTime,
      endTime,
      location: form.value.location,
      conducted: false,
      eventTypeId: eventType.id!,
      userId: authStore.user?.id || 1
    };
    await eventsStore.createEvent(eventData);
    const toast = await toastController.create({
      message: 'Мероприятие успешно создано',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    router.push('/tabs/events-management');
  } catch (error) {
    console.error('Error creating event:', error);
    const toast = await toastController.create({
      message: 'Ошибка при создании мероприятия: ' + ((error as any)?.message || error),
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadEventTypes();
});
</script>

<style scoped>
ion-card {
  margin: 16px;
}

ion-footer {
  padding: 16px;
}

.ion-invalid {
  --border-color: var(--ion-color-danger);
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-label {
  margin-bottom: 8px;
}
</style> 