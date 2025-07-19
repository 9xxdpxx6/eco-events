import { createApp, h } from 'vue';
import CustomToast from '../components/CustomToast.vue';

interface ToastOptions {
  message: string;
  color?: 'success' | 'danger' | 'warning';
  duration?: number;
}

export const showToast = (options: ToastOptions) => {
  const { message, color = 'success', duration = 3000 } = options;

  // Создаем контейнер для toast
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);

  // Создаем Vue приложение
  const app = createApp({
    render() {
      return h(CustomToast, {
        message,
        color,
        duration,
        onClose: () => {
          // Удаляем приложение и контейнер
          app.unmount();
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        }
      });
    }
  });

  // Монтируем приложение
  app.mount(container);

  return {
    dismiss: () => {
      app.unmount();
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };
};

// Удобные функции
export const showSuccessToast = (message: string, duration?: number) => {
  return showToast({ message, color: 'success', duration: duration || 2000 });
};

export const showErrorToast = (message: string, duration?: number) => {
  return showToast({ message, color: 'danger', duration: duration || 3000 });
};

export const showWarningToast = (message: string, duration?: number) => {
  return showToast({ message, color: 'warning', duration: duration || 2500 });
}; 