<template>
  <transition name="gallery-fade">
    <div v-if="visible" class="custom-gallery-overlay" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <div class="gallery-header">
        <div v-if="images.length > 1" class="gallery-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
        <button class="gallery-close" @click="close" aria-label="Закрыть галерею">✕</button>
      </div>
      <div class="gallery-image-container">
        <template v-if="isSliding">
          <template v-if="!brokenImages[currentIndex]">
            <img
              :src="images[currentIndex]"
              class="gallery-image slide-current"
              :class="slideDirection"
              :style="imageStyle as CSSProperties"
              draggable="false"
              alt="Фото"
              @error="onImgError(currentIndex)"
            />
          </template>
          <template v-else>
            <BrokenImagePlaceholder class="gallery-image slide-current gallery-broken-half" />
          </template>
          <template v-if="nextIndex !== null">
            <template v-if="!brokenImages[nextIndex]">
              <img
                :src="images[nextIndex]"
                class="gallery-image slide-next"
                :class="slideDirection"
                :style="imageStyle as CSSProperties"
                draggable="false"
                alt="Фото"
                @error="onImgError(nextIndex)"
              />
            </template>
            <template v-else>
              <BrokenImagePlaceholder class="gallery-image slide-next gallery-broken-half" />
            </template>
          </template>
        </template>
        <template v-else>
          <template v-if="!brokenImages[currentIndex]">
            <img
              :src="images[currentIndex]"
              class="gallery-image"
              :style="imageStyle as CSSProperties"
              draggable="false"
              alt="Фото"
              @error="onImgError(currentIndex)"
            />
          </template>
          <template v-else>
            <BrokenImagePlaceholder class="gallery-image gallery-broken-half" />
          </template>
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { CSSProperties } from 'vue';
import BrokenImagePlaceholder from './BrokenImagePlaceholder.vue';

const props = defineProps<{
  images: string[];
  modelValue: boolean;
  startIndex?: number;
}>();
const emit = defineEmits(['update:modelValue', 'change']);

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
});

const currentIndex = ref(props.startIndex ?? 0);
const nextIndex = ref<number|null>(null);
const slideDirection = ref(''); // 'slide-left' | 'slide-right' | ''
const isSliding = ref(false);
const closingBySwipe = ref(false);
const brokenImages = ref<{ [key: number]: boolean }>({});

function onImgError(idx: number) {
  brokenImages.value[idx] = true;
}

watch(() => props.startIndex, idx => {
  if (typeof idx === 'number') currentIndex.value = idx;
});
watch(() => props.images, imgs => {
  if (currentIndex.value >= imgs.length) currentIndex.value = 0;
});

function close() {
  visible.value = false;
}
async function animateSlide(direction: 'left' | 'right', toIdx: number) {
  if (isSliding.value) return;
  nextIndex.value = toIdx;
  slideDirection.value = direction === 'left' ? 'slide-left' : 'slide-right';
  isSliding.value = true;
  await nextTick();
  setTimeout(() => {
    currentIndex.value = toIdx;
    nextIndex.value = null;
    slideDirection.value = '';
    isSliding.value = false;
    emit('change', toIdx);
  }, 400);
}
async function prev() {
  if (props.images.length > 1) {
    const toIdx = (currentIndex.value - 1 + props.images.length) % props.images.length;
    await animateSlide('right', toIdx);
  }
}
async function next() {
  if (props.images.length > 1) {
    const toIdx = (currentIndex.value + 1) % props.images.length;
    await animateSlide('left', toIdx);
  }
}

// Touch/swipe logic
let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
let isSwiping = false;
function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }
}
function onTouchMove(e: TouchEvent) {
  if (!isSwiping) return;
  touchEndX = e.touches[0].clientX;
  touchEndY = e.touches[0].clientY;
}
async function onTouchEnd() {
  if (!isSwiping) return;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) await next();
    else await prev();
  } else if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx)) {
    closingBySwipe.value = true;
    setTimeout(() => {
      closingBySwipe.value = false;
      close();
    }, 250);
  }
  isSwiping = false;
}

// Pinch-to-zoom logic (без изменений)
const scale = ref(1);
const lastScale = ref(1);
let pinchStartDist = 0;
let pinchCenter = { x: 0, y: 0 };
function getDistance(touches: TouchList) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
function onImgTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    pinchStartDist = getDistance(e.touches);
    lastScale.value = scale.value;
    pinchCenter = {
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2
    };
  }
}
function onImgTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    const newDist = getDistance(e.touches);
    scale.value = Math.max(1, Math.min(4, lastScale.value * (newDist / pinchStartDist)));
    e.preventDefault();
  }
}
function onImgTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) {
    lastScale.value = scale.value;
  }
}
// Mouse zoom (desktop)
let mouseDown = false;
let mouseStartX = 0, mouseStartY = 0;
function onMouseDown(e: MouseEvent) {
  mouseDown = true;
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
}
function onMouseMove(e: MouseEvent) {
  if (!mouseDown) return;
  // Можно реализовать drag для панорамирования, если нужно
}
function onMouseUp() {
  mouseDown = false;
}

const imageStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transition: closingBySwipe.value ? 'transform 0.25s, opacity 0.25s' : '',
  opacity: closingBySwipe.value ? 0 : 1,
  'touch-action': 'none',
  'user-select': 'none',
  'max-width': '100vw',
  'width': '100vw',
  'height': 'auto',
  'max-height': '100vh',
  'border-radius': '0',
}));

// Закрытие по ESC
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}
onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<style scoped>
.custom-gallery-overlay {
  position: fixed;
  z-index: 99999;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10,10,20,0.98);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overscroll-behavior: contain;
}
.gallery-header {
  position: absolute;
  top: 0; left: 0; right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 24px 24px 0 24px;
  z-index: 2;
  pointer-events: none;
}
.gallery-counter {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  margin-right: 16px;
  background: rgba(0,0,0,0.4);
  border-radius: 8px;
  padding: 4px 12px;
  pointer-events: auto;
}
.gallery-close {
  background: rgba(0,0,0,0);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.gallery-close:hover {
  background: rgba(0,0,0,0.7);
}
.gallery-image-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.gallery-image {
  max-width: 100vw;
  width: 100vw;
  height: auto;
  max-height: 100vh;
  object-fit: contain;
  background: #222;
  border-radius: 0;
  box-shadow: 0 4px 32px rgba(0,0,0,0.25);
  user-select: none;
  touch-action: none;
  transition: box-shadow 0.2s, transform 0.4s cubic-bezier(.4,0,.2,1), opacity 0.4s;
  display: block;
  margin: auto;
  top: 0; bottom: 0; left: 0; right: 0;
  position: static;
}
.slide-left.slide-current, .slide-left.slide-next,
.slide-right.slide-current, .slide-right.slide-next {
  position: absolute;
}
.slide-left.slide-current {
  z-index: 1;
  transform: translateX(0);
  animation: slideCurrentLeft 0.4s forwards;
}
.slide-left.slide-next {
  z-index: 2;
  transform: translateX(100vw);
  animation: slideNextLeft 0.4s forwards;
}
@keyframes slideCurrentLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100vw); }
}
@keyframes slideNextLeft {
  0% { transform: translateX(100vw); }
  100% { transform: translateX(0); }
}
.slide-right.slide-current {
  z-index: 1;
  transform: translateX(0);
  animation: slideCurrentRight 0.4s forwards;
}
.slide-right.slide-next {
  z-index: 2;
  transform: translateX(-100vw);
  animation: slideNextRight 0.4s forwards;
}
@keyframes slideCurrentRight {
  0% { transform: translateX(0); }
  100% { transform: translateX(100vw); }
}
@keyframes slideNextRight {
  0% { transform: translateX(-100vw); }
  100% { transform: translateX(0); }
}
.gallery-broken-half {
  height: 50vh !important;
  min-height: 200px;
  max-height: 60vh;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
</style> 