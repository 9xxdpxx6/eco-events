# Руководство по экранам загрузки

В приложении EcoEvents доступны четыре варианта экранов загрузки:

## 1. Базовый экран загрузки (`SplashScreen.vue`)

Простой экран с логотипом, анимированными точками и текстом.

### Использование:
```vue
<template>
  <SplashScreen 
    :duration="2000" 
    @splash-complete="onComplete"
  />
</template>
```

### Особенности:
- Анимированный логотип с эффектом пульсации
- Три анимированные точки загрузки
- Название приложения и слоган
- Градиентный фон в зеленых тонах

## 2. Продвинутый экран загрузки с иконками (`AdvancedSplashScreen.vue`)

Экран с прогресс-баром, пошаговой индикацией загрузки и иконками Ionic.

### Использование:
```vue
<template>
  <AdvancedSplashScreen 
    :duration="3000"
    :show-progress="true"
    :progress-percentage="loadingProgress"
    :loading-steps="loadingSteps"
    :current-step="currentStep"
    @splash-complete="onComplete"
  />
</template>
```

### Особенности:
- Прогресс-бар с процентами
- Список шагов загрузки с иконками Ionic
- Анимированные переходы между шагами
- Подробная информация о процессе загрузки

## 3. Упрощенный продвинутый экран загрузки (`SimpleAdvancedSplashScreen.vue`)

Экран с прогресс-баром и пошаговой индикацией без иконок (рекомендуется).

### Использование:
```vue
<template>
  <SimpleAdvancedSplashScreen 
    :duration="3000"
    :show-progress="true"
    :progress-percentage="loadingProgress"
    :loading-steps="loadingSteps"
    :current-step="currentStep"
    @splash-complete="onComplete"
  />
</template>
```

### Особенности:
- Прогресс-бар с процентами
- Список шагов загрузки с точками-индикаторами
- Анимированные переходы между шагами
- Подробная информация о процессе загрузки
- **Без зависимостей от иконок Ionic**

## 4. Минималистичный экран загрузки (`MinimalSplashScreen.vue`)

Простой и чистый дизайн с логотипом и спиннером.

### Использование:
```vue
<template>
  <MinimalSplashScreen 
    :duration="2000" 
    @splash-complete="onComplete"
  />
</template>
```

### Особенности:
- Минималистичный дизайн
- Белый логотип на зеленом фоне
- Анимированный спиннер
- Быстрые переходы

## Composable для управления загрузкой

Используйте `useAppLoading` для управления состоянием загрузки:

```typescript
import { useAppLoading } from '@/composables/useAppLoading';

const { 
  loadingProgress, 
  loadingSteps, 
  currentStep, 
  simulateLoading 
} = useAppLoading();

// Имитация загрузки
await simulateLoading([
  'Инициализация приложения...',
  'Загрузка данных...',
  'Проверка авторизации...',
  'Подготовка интерфейса...',
  'Готово!'
], 3000);
```

## Capacitor Splash Screen

### Настройка нативного splash screen

В `capacitor.config.ts` настроен нативный splash screen:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 0, // Не показывать стандартный splash screen
    backgroundColor: '#2ecc71', // Цвет фона
    showSpinner: false, // Не показывать спиннер
    androidSpinnerStyle: 'large',
    iosSpinnerStyle: 'small',
    spinnerColor: '#ffffff',
    splashFullScreen: true,
    splashImmersive: true
  }
}
```

### Управление нативным splash screen

Используйте `useCapacitorSplash` для управления нативным splash screen:

```typescript
import { useCapacitorSplash } from '@/composables/useCapacitorSplash';

const { 
  hideNativeSplash, 
  showNativeSplash, 
  hideNativeSplashAfterDelay 
} = useCapacitorSplash();

// Скрыть нативный splash screen
await hideNativeSplash();

// Скрыть через задержку
hideNativeSplashAfterDelay(1000);
```

## Последовательность загрузки в Capacitor

```
1. Запуск приложения
   ↓
2. Capacitor splash screen (нативный)
   ↓
3. Загрузка веб-приложения
   ↓
4. Ваш кастомный экран загрузки (Vue компонент)
   ↓
5. Основное приложение
```

## Настройка в App.vue

Для переключения между экранами загрузки измените импорт в `App.vue`:

```vue
<!-- Для базового экрана -->
import SplashScreen from '@/components/SplashScreen.vue';

<!-- Для продвинутого экрана с иконками -->
import AdvancedSplashScreen from '@/components/AdvancedSplashScreen.vue';

<!-- Для упрощенного продвинутого экрана (рекомендуется) -->
import SimpleAdvancedSplashScreen from '@/components/SimpleAdvancedSplashScreen.vue';

<!-- Для минималистичного экрана -->
import MinimalSplashScreen from '@/components/MinimalSplashScreen.vue';
```

## Решение проблем

### Ошибка с ion-icon

Если возникает ошибка `Failed to resolve component: ion-icon`, используйте `SimpleAdvancedSplashScreen.vue` вместо `AdvancedSplashScreen.vue`, так как он не зависит от иконок Ionic.

### Альтернативное решение для AdvancedSplashScreen

Если хотите использовать `AdvancedSplashScreen` с иконками, убедитесь что компонент правильно импортирован:

```vue
<script>
import { IonIcon } from '@ionic/vue';

export default {
  components: {
    IonIcon
  }
}
</script>
```

## Кастомизация

### Изменение цветов:
Отредактируйте CSS переменные в компонентах или переопределите стили.

### Изменение логотипа:
Замените путь к изображению в `src` атрибуте:
```vue
<img src="@/assets/your-logo.png" alt="Logo" />
```

### Изменение длительности:
Передайте нужное значение в миллисекундах:
```vue
<SplashScreen :duration="5000" />
```

### Настройка нативного splash screen:
Измените параметры в `capacitor.config.ts`:
```typescript
SplashScreen: {
  backgroundColor: '#your-color',
  launchShowDuration: 2000,
  showSpinner: true
}
```

## Рекомендации

1. **Длительность**: Рекомендуется 2-3 секунды для хорошего UX
2. **Контент**: Показывайте полезную информацию о процессе загрузки
3. **Анимации**: Используйте плавные переходы для лучшего восприятия
4. **Адаптивность**: Все экраны адаптированы под разные размеры экранов
5. **Capacitor**: Настройте нативный splash screen для плавного перехода
6. **Совместимость**: Используйте `SimpleAdvancedSplashScreen` для избежания проблем с иконками

## Отладка

Для отладки экранов загрузки в режиме разработки добавьте логи:

```typescript
onMounted(() => {
  console.log('Splash screen mounted');
  // Ваша логика загрузки
});
```

## Сборка для мобильных устройств

После настройки экранов загрузки:

```bash
# Сборка для Android
npm run build
npx cap sync android
npx cap open android

# Сборка для iOS
npm run build
npx cap sync ios
npx cap open ios
```

Ваш кастомный экран загрузки будет показываться после загрузки веб-приложения, а нативный Capacitor splash screen будет показываться до этого. 