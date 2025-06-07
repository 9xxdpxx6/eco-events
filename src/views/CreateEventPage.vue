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
import { ref, computed } from 'vue';
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
import { ApiService } from '../services/apiService';

const router = useRouter();
const apiService = ApiService.getInstance();

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

const isSaving = ref(false);
const showErrors = ref(false);

const minDate = new Date().toISOString();

const isFormValid = computed(() => {
  const isValid = form.value.title && 
         form.value.description && 
         form.value.date && 
         form.value.time && 
         form.value.location;
  
  console.log('📝 Валидация формы:', {
    title: !!form.value.title,
    description: !!form.value.description,
    date: !!form.value.date,
    time: !!form.value.time,
    location: !!form.value.location,
    isValid
  });
  
  return isValid;
});

const saveEvent = async () => {
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
    header: 'Создать мероприятие',
    message: 'Вы уверены, что хотите создать это мероприятие?',
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Создать',
        handler: async () => {
          await createEvent();
        }
      }
    ]
  });
  
  await alert.present();
};

const createEvent = async () => {
  isSaving.value = true;
  
  try {
    console.log('🔍 Данные формы перед созданием события:', form.value);
    
    // Получаем дату в формате YYYY-MM-DD
    let dateStr = form.value.date;
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    
    // Получаем время в формате HH:MM
    let timeStr = form.value.time;
    if (timeStr.includes('T')) {
      timeStr = timeStr.split('T')[1].substring(0, 5);
    }
    
    console.log('📅 Обработанные дата и время:', { dateStr, timeStr });
    
    // Создаем корректную дату
    const eventDateTime = new Date(`${dateStr}T${timeStr}:00`);
    
    console.log('⏰ Создана дата события:', eventDateTime);
    
    if (isNaN(eventDateTime.getTime())) {
      throw new Error('Неправильный формат даты или времени');
    }
    
    const eventData = {
      ...form.value,
      date: eventDateTime.toISOString(),
      createdAt: new Date().toISOString(),
      organization: 'Экологи города' // добавляем организацию
    };
    
    console.log('📋 Данные для отправки:', eventData);

    await apiService.createEvent(eventData);
    
    const toast = await toastController.create({
      message: 'Мероприятие успешно создано!',
      duration: 3000,
      color: 'success'
    });
    await toast.present();
    
    router.push('/tabs/events-management');
  } catch (error) {
    console.error('❌ Ошибка при создании события:', error);
    const toast = await toastController.create({
      message: `Ошибка при создании мероприятия: ${(error as Error).message || 'неизвестная ошибка'}`,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isSaving.value = false;
  }
};
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