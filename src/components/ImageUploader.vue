<template>
  <div class="image-uploader">
    <div class="image-grid">
      <div 
        v-for="(image, index) in imagePreviews" 
        :key="image.url + '-' + index" 
        class="image-container"
        :class="{ 'preview': image.isPreview }"
      >
        <template v-if="!brokenImages[image.url]">
          <img :src="image.url" class="thumbnail" @dblclick="setAsPreview(index)" @touchend="onTouchEnd(index, $event)" @error="handleImgError(image.url)" />
        </template>
        <template v-else>
          <BrokenImagePlaceholder />
        </template>
        <ion-icon :icon="star" class="preview-badge" v-if="image.isPreview" />
        <button
          type="button"
          class="delete-button"
          @click.stop="askRemoveImage(index)"
          aria-label="Удалить изображение"
        >
          <ion-icon :icon="closeOutline" />
        </button>
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
      Двойной тап по фото, чтобы сделать его главным.
    </div>
    <div v-if="showDeleteAlert" class="ios-alert-backdrop">
      <div class="ios-alert">
        <div v-if="imageToDeleteIndex !== null">
          <template v-if="!brokenImages[imagePreviews[imageToDeleteIndex]?.url]">
            <img :src="imagePreviews[imageToDeleteIndex]?.url" class="ios-alert-img" />
          </template>
          <template v-else>
            <BrokenImagePlaceholder class="ios-alert-img" />
          </template>
        </div>
        <div class="ios-alert-title">Удалить изображение?</div>
        <div class="ios-alert-message">Действие не подлежит отмене.</div>
        <div class="ios-alert-actions" v-if="imageToDeleteIndex !== null">
          <button class="ios-alert-btn cancel" @click="cancelRemoveImage">Отмена</button>
          <div class="ios-alert-divider"></div>
          <button class="ios-alert-btn delete" @click="confirmRemoveImage">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { IonButton, IonIcon, actionSheetController, IonAlert } from '@ionic/vue';
import { cameraOutline, star, starOutline, closeOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { showSuccessToast, showErrorToast, showWarningToast } from '../utils/toast';
import { isPlatform } from '@ionic/vue';
import { ref as vueRef } from 'vue';
import BrokenImagePlaceholder from './BrokenImagePlaceholder.vue';
import { clearFileUrlCache, fileToUrlMap } from '../utils/imageUploaderCache';

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

const showDeleteAlert = ref(false);
const imageToDeleteIndex = ref<number|null>(null);

function askRemoveImage(index: number) {
  imageToDeleteIndex.value = index;
  showDeleteAlert.value = true;
}

function confirmRemoveImage() {
  if (imageToDeleteIndex.value !== null) {
    removeImage(imageToDeleteIndex.value);
    imageToDeleteIndex.value = null;
    showDeleteAlert.value = false;
  }
}

function cancelRemoveImage() {
  imageToDeleteIndex.value = null;
  showDeleteAlert.value = false;
}

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    images.value = [];
    clearFileUrlCache();
    brokenImages.value = {};
    emit('update:preview', null);
    return;
  }

  // Сравниваем массивы: если совпадают по длине и содержимому, не пересоздаём
  const current = images.value.map(img => img.file || img.url);
  const incoming = newValue.map(item => (typeof item === 'string' ? item : item));
  const isSame = current.length === incoming.length && current.every((val, idx) => val === incoming[idx]);
  if (isSame) return;

  // Найти текущее превью (по isPreview)
  let previewUrlOrFile = null;
  const currentPreview = images.value.find(img => img.isPreview);
  if (currentPreview) {
    previewUrlOrFile = currentPreview.file || currentPreview.url;
  }

  images.value = newValue.map((item) => {
    let url, file;
    if (typeof item === 'string') {
      url = item;
      file = null;
    } else {
      file = item;
      if (fileToUrlMap.has(file)) {
        url = fileToUrlMap.get(file)!;
      } else {
        url = URL.createObjectURL(file);
        fileToUrlMap.set(file, url);
      }
    }
    const isPreview = !!((file && previewUrlOrFile === file) || (url && previewUrlOrFile === url));
    return { file, url, isPreview, isNew: !!file };
  });

  // Если ни у кого не выставлен isPreview, делаем первый превью
  if (!images.value.some(img => img.isPreview) && images.value.length > 0) {
    images.value[0].isPreview = true;
  }

  const preview = images.value.find(img => img.isPreview);
  emit('update:preview', preview?.file || preview?.url);
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
        await showWarningToast(`Выбрано слишком много файлов. Будут добавлены первые ${remainingSlots}.`, 3000);
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
        await showWarningToast(`Пропущено ${skippedFiles} файлов из-за неверного формата или размера.`, 3500);
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
  clearFileUrlCache();
  brokenImages.value = {};
  updateModelValue();
}

function setAsPreview(index: number) {
  if (index < 0 || index >= images.value.length) return;
  console.log('setAsPreview called', { index, images: images.value.map(i => i.url) });
  images.value.forEach((img, i) => {
    img.isPreview = (i === index);
  });
  console.log('images after setAsPreview', images.value.map(i => ({ url: i.url, isPreview: i.isPreview })));
  // Обновить brokenImages чтобы реактивно обновить рамку
  nextTick(() => {
    const newBroken: Record<string, boolean> = {};
    images.value.forEach(img => {
      if (brokenImages.value[img.url]) {
        newBroken[img.url] = true;
      }
    });
    brokenImages.value = newBroken;
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

// Для отслеживания битых картинок по url
const brokenImages = vueRef<{ [key: string]: boolean }>({});
function handleImgError(url: string) {
  brokenImages.value[url] = true;
}

// Сброс brokenImages при изменении imagePreviews
watch(imagePreviews, (newVal) => {
  const newBroken: Record<string, boolean> = {};
  newVal.forEach(img => {
    if (brokenImages.value[img.url]) {
      newBroken[img.url] = true;
    }
  });
  brokenImages.value = newBroken;
});

const lastTapMap = ref<{ [key: number]: number }>({});
function onTouchEnd(index: number, event: TouchEvent) {
  event.preventDefault();
  const now = Date.now();
  console.log('onTouchEnd', { index, now, lastTap: lastTapMap.value[index] });
  if (lastTapMap.value[index] && now - lastTapMap.value[index] < 350) {
    setAsPreview(index);
    lastTapMap.value[index] = 0; // сбросить, чтобы не было ложных срабатываний
  } else {
    lastTapMap.value[index] = now;
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  align-items: stretch;
}

.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  margin: 0;
  border-radius: var(--eco-radius-lg);
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
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

/* Звезда превью — в левом нижнем углу */
.preview-badge {
  position: absolute;
  left: 6px;
  bottom: 6px;
  font-size: 20px;
  color: var(--eco-primary);
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.delete-button {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 1;
  z-index: 2;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Визуальный отклик при клике */
.image-container:active {
  box-shadow: 0 0 0 2px var(--eco-primary-light);
  border-color: var(--eco-primary-light);
}

.delete-button ion-icon {
  font-size: 22px;
  color: #e53935;
  background: none;
}

.add-button {
  width: 100%;
  aspect-ratio: 1/1;
  border: 2px dashed var(--eco-primary);
  border-radius: var(--eco-radius-lg);
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  box-sizing: border-box;
  margin: 0;
}



.add-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--eco-gray-500);
  transition: color 0.2s ease-in-out;
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
/* iOS-style alert */
.ios-alert-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ios-alert {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  min-width: 270px;
  max-width: 90vw;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 24px 0 0 0;
  overflow: hidden;
}
.ios-alert-img {
  max-width: 180px;
  max-height: 180px;
  border-radius: 10px;
  margin: 0 auto 12px auto;
  display: block;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.ios-alert-title {
  font-size: 17px;
  font-weight: 600;
  color: #111;
  margin-bottom: 8px;
  padding: 0 20px;
}
.ios-alert-message {
  font-size: 14px;
  color: #e53935;
  margin-bottom: 18px;
  padding: 0 20px;
}
.ios-alert-actions {
  display: flex;
  flex-direction: row;
  border-top: 1px solid #e0e0e0;
  width: 100%;
  min-height: 44px;
}
.ios-alert-btn {
  flex: 1 1 0;
  border: none;
  background: none;
  font-size: 17px;
  font-weight: 400;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.15s;
  outline: none;
}
.ios-alert-btn.cancel {
  color: #007aff;
}
.ios-alert-btn.delete {
  color: #e53935;
}
.ios-alert-btn:active {
  background: #f2f2f7;
}
.ios-alert-divider {
  width: 1px;
  background: #e0e0e0;
  margin: 0;
}
.broken-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(135deg, #f3f3f3, #f3f3f3 16px, #fff 16px, #fff 32px);
  color: #b0b0b0;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border-radius: var(--eco-radius-lg);
  user-select: none;
}
</style> 