<template>
  <div class="image-uploader">
    <div class="image-grid">
      <div 
        v-for="(image, index) in imagePreviews" 
        :key="index" 
        class="image-container"
        :class="{ 'preview': image.isPreview }"
      >
        <img :src="image.url" class="thumbnail" @dblclick="setAsPreview(index)" />
        <ion-icon :icon="star" class="preview-badge" v-if="image.isPreview" />
        <ion-button
          size="small"
          class="delete-button"
          color="danger"
          @click="removeImage(index)"
        >
          <ion-icon :icon="trashBinOutline" />
        </ion-button>
      </div>
      
      <ion-button 
        fill="outline" 
        @click="presentActionSheet" 
        class="add-button" 
        v-if="canAddMoreImages"
      >
        <div class="add-button-content">
          <ion-icon :icon="cameraOutline" />
          <span>Добавить фото</span>
        </div>
      </ion-button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div class="uploader-hint" v-if="images.length > 0">
      **Двойной клик по фото, чтобы сделать его главным.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { IonButton, IonIcon, actionSheetController, toastController } from '@ionic/vue';
import { cameraOutline, star, starOutline, trashBinOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { isPlatform } from '@ionic/vue';

interface ImageObject {
  file: File | null;
  url: string;
  isPreview: boolean;
  isNew: boolean;
}

const props = defineProps<{
  modelValue: (File | string)[]; // Can be File objects or image URL strings
  maxFiles?: number;
}>();

const emit = defineEmits(['update:modelValue', 'update:preview']);

const images = ref<ImageObject[]>([]);
const errorMessage = ref<string | null>(null);

const MAX_FILES = props.maxFiles || 10;
const MAX_FILE_SIZE_MB = 10;

const imagePreviews = computed(() => images.value);
const canAddMoreImages = computed(() => images.value.length < MAX_FILES);

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    images.value = newValue.map((item, index) => {
      if (typeof item === 'string') {
        return { file: null, url: item, isPreview: index === 0, isNew: false };
      }
      return { file: item, url: URL.createObjectURL(item), isPreview: index === 0, isNew: true };
    });
    if (images.value.length > 0) {
      const preview = images.value.find(img => img.isPreview);
      emit('update:preview', preview?.file || preview?.url);
    }
  }
}, { immediate: true });

async function takePicture(source: CameraSource) {
  if (!canAddMoreImages.value) {
    errorMessage.value = `Можно загрузить не более ${MAX_FILES} изображений.`;
    return;
  }
  
  try {
    if (source === CameraSource.Photos) {
      const remainingSlots = MAX_FILES - images.value.length;
      const result = await Camera.pickImages({
        quality: 90,
      });

      if (!result || result.photos.length === 0) {
        return;
      }

      const photosToProcess = result.photos.slice(0, remainingSlots);

      if (result.photos.length > remainingSlots) {
        const toast = await toastController.create({
            message: `Выбрано слишком много файлов. Будут добавлены первые ${remainingSlots}.`,
            duration: 3000,
            color: 'warning'
        });
        await toast.present();
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      let skippedFiles = 0;

      const newImageObjects: ImageObject[] = [];
      await Promise.all(photosToProcess.map(async (photo) => {
        if (photo.webPath) {
          const response = await fetch(photo.webPath);
          const blob = await response.blob();

          if (!allowedTypes.includes(blob.type)) {
            console.warn(`Файл пропущен, т.к. имеет недопустимый тип: ${blob.type}.`);
            skippedFiles++;
            return;
          }

          if (blob.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
             console.warn(`Файл пропущен, т.к. его размер превышает ${MAX_FILE_SIZE_MB} МБ.`);
             skippedFiles++;
             return;
          }
          
          const file = new File([blob], `photo_${Date.now()}.${photo.format}`, { type: blob.type });
          newImageObjects.push({ file, url: photo.webPath, isPreview: false, isNew: true });
        }
      }));

      if (skippedFiles > 0) {
        const toast = await toastController.create({
            message: `Пропущено ${skippedFiles} файлов из-за неверного формата или размера.`,
            duration: 3500,
            color: 'warning'
        });
        await toast.present();
      }

      const wasPreviewSet = images.value.some(img => img.isPreview);
      images.value.push(...newImageObjects);
      if (!wasPreviewSet && images.value.length > 0) {
        images.value[0].isPreview = true;
      }
      updateModelValue();
      errorMessage.value = null;

    } else { // Single photo from camera
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source
      });

      if (photo.webPath) {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();

        if (blob.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          errorMessage.value = `Размер файла не должен превышать ${MAX_FILE_SIZE_MB} МБ.`;
          return;
        }
        
        const file = new File([blob], `photo_${Date.now()}.${photo.format}`, { type: blob.type });

        const newImage: ImageObject = {
          file,
          url: photo.webPath,
          isPreview: images.value.length === 0,
          isNew: true
        };
        
        images.value.push(newImage);
        updateModelValue();
        errorMessage.value = null;
      }
    }
  } catch (error) {
    const errorMsg = String(error);
    if (!errorMsg.includes('cancelled') && !errorMsg.includes('cancel')) {
      console.error('Ошибка при выборе изображения:', error);
      errorMessage.value = 'Не удалось загрузить изображение.';
    }
  }
}

function removeImage(index: number) {
  const wasPreview = images.value[index].isPreview;
  images.value.splice(index, 1);
  if (wasPreview && images.value.length > 0) {
    images.value[0].isPreview = true;
  }
  updateModelValue();
}

function setAsPreview(index: number) {
  if (index < 0 || index >= images.value.length) return;

  // Move the selected image to the beginning of the array
  const [selectedImage] = images.value.splice(index, 1);
  images.value.unshift(selectedImage);

  // Set all images' isPreview to false, then the first one to true
  images.value.forEach((img, i) => {
    img.isPreview = (i === 0);
  });

  // Notify parent of all changes
  updateModelValue();
}

function updateModelValue() {
  const newModelValue = images.value.map(img => img.isNew ? img.file : img.url).filter(Boolean);
  emit('update:modelValue', newModelValue as (File | string)[]);

  const preview = images.value.find(img => img.isPreview);
  if (preview) {
    emit('update:preview', preview.isNew ? preview.file : preview.url);
  } else {
    emit('update:preview', null);
  }
}

async function presentActionSheet() {
  const buttons = [];

  if (isPlatform('hybrid')) {
    buttons.push({
      text: 'Сделать фото',
      icon: cameraOutline,
      handler: () => takePicture(CameraSource.Camera),
    });
  }

  buttons.push({
    text: 'Выбрать из галереи',
    icon: cameraOutline,
    handler: () => takePicture(CameraSource.Photos),
  });

  buttons.push({
    text: 'Отмена',
    role: 'cancel',
  });

  const actionSheet = await actionSheetController.create({
    header: 'Добавить изображение',
    buttons: buttons,
  });
  await actionSheet.present();
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.image-container {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease-in-out;
}

.image-container:hover {
  transform: scale(1.05);
}

.image-container.preview {
  border-color: var(--eco-primary);
  box-shadow: 0 0 12px rgba(var(--eco-primary-rgb), 0.5);
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.preview-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 20px;
  color: var(--eco-primary);
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.delete-button {
  position: absolute;
  bottom: 4px;
  left: 4px;
  --border-radius: 50%;
  width: 28px;
  height: 28px;
  --padding-start: 0;
  --padding-end: 0;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.image-container:hover .delete-button {
  opacity: 1;
}

.delete-button ion-icon {
  font-size: 14px;
}

.add-button {
  width: 100px;
  height: 100px;
  border-style: dashed;
  --border-color: var(--eco-gray-300);
  border-radius: var(--eco-radius-lg);
  transition: all 0.2s ease-in-out;
}

.add-button:hover {
  --border-color: var(--eco-primary);
  --background: rgba(var(--eco-primary-rgb), 0.05);
  transform: scale(1.05);
}

.add-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--eco-gray-500);
  transition: color 0.2s ease-in-out;
}

.add-button:hover .add-button-content {
  color: var(--eco-primary);
}

.add-button-content ion-icon {
  font-size: 28px;
}

.add-button-content span {
    font-size: 12px;
}

.error-message {
  color: var(--ion-color-danger);
  margin-top: 12px;
  font-size: var(--eco-font-size-sm);
}

.uploader-hint {
  font-size: 12px;
  color: var(--eco-gray-600);
  margin-top: 12px;
  text-align: center;
  width: 100%;
}
</style> 