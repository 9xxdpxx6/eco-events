<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/event-details/${eventId}`"></ion-back-button>
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
              <ion-label position="stacked">Категория мероприятия</ion-label>
              <ion-select v-model="form.category" placeholder="Выберите категорию">
                <ion-select-option value="cleanup">Уборка территории</ion-select-option>
                <ion-select-option value="tree-planting">Посадка деревьев</ion-select-option>
                <ion-select-option value="education">Экологическое просвещение</ion-select-option>
                <ion-select-option value="recycling">Переработка отходов</ion-select-option>
                <ion-select-option value="conservation">Охрана природы</ion-select-option>
                <ion-select-option value="other">Другое</ion-select-option>
              </ion-select>
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
  IonCheckbox,
  IonSpinner,
  toastController,
  alertController
} from '@ionic/vue';
import { checkmarkOutline } from 'ionicons/icons';
import { ApiService } from '../services/apiService';

const router = useRouter();
const route = useRoute();
const apiService = ApiService.getInstance();

const eventId = computed(() => route.params.id as string);

const form = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  duration: 2,
  location: '',
  locationDetails: '',
  contactEmail: '',
  contactPhone: '',
  maxParticipants: null,
  category: '',
  requiresRegistration: true,
  providesEquipment: false,
  minAge: null,
  requirements: ''
});

const isLoading = ref(false);
const isSaving = ref(false);
const showErrors = ref(false);

const minDate = new Date().toISOString();

const isFormValid = computed(() => {
  return form.value.title && 
         form.value.description && 
         form.value.date && 
         form.value.time && 
         form.value.location;
});

const loadEvent = async () => {
  isLoading.value = true;
  try {
    const data = await apiService.getEventDetails(parseInt(eventId.value));
    
    // Заполняем форму данными мероприятия
    const eventDate = new Date((data as any).date);
    
    form.value = {
      title: (data as any).title || '',
      description: (data as any).description || '',
      date: eventDate.toISOString().split('T')[0],
      time: (data as any).time || '',
      duration: (data as any).duration || 2,
      location: (data as any).location || '',
      locationDetails: (data as any).locationDetails || '',
      contactEmail: (data as any).contactEmail || '',
      contactPhone: (data as any).contactPhone || '',
      maxParticipants: (data as any).maxParticipants || null,
      category: (data as any).category || '',
      requiresRegistration: (data as any).requiresRegistration ?? true,
      providesEquipment: (data as any).providesEquipment ?? false,
      minAge: (data as any).minAge || null,
      requirements: (data as any).requirements || ''
    };
  } catch (error) {
    console.error('Error loading event:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки данных мероприятия',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
    router.back();
  } finally {
    isLoading.value = false;
  }
};

const saveChanges = async () => {
  if (!isFormValid.value) {
    showErrors.value = true;
    const toast = await toastController.create({
      message: 'Пожалуйста, заполните все обязательные поля',
      duration: 3000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  const alert = await alertController.create({
    header: 'Сохранить изменения',
    message: 'Вы уверены, что хотите сохранить изменения?',
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Сохранить',
        handler: async () => {
          await updateEvent();
        }
      }
    ]
  });
  
  await alert.present();
};

const updateEvent = async () => {
  isSaving.value = true;
  
  try {
    // Объединяем дату и время
    const eventDateTime = new Date(`${form.value.date}T${form.value.time}`);
    
    const eventData = {
      ...form.value,
      date: eventDateTime.toISOString(),
      updatedAt: new Date().toISOString()
    };

    await apiService.updateEvent(parseInt(eventId.value), eventData);
    
    const toast = await toastController.create({
      message: 'Мероприятие успешно обновлено!',
      duration: 3000,
      color: 'success'
    });
    await toast.present();
    
    router.push(`/event-details/${eventId.value}`);
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

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-label {
  margin-bottom: 8px;
}
</style> 