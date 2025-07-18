import { ref } from 'vue';

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  hideCancel?: boolean;
}

interface DialogState {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDestructive: boolean;
  hideCancel: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useEcoDialog() {
  const dialogState = ref<DialogState>({
    isOpen: false,
    message: '',
    confirmText: 'OK',
    cancelText: 'Отменить',
    isDestructive: false,
    hideCancel: false
  });

  const showDialog = (options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      dialogState.value = {
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Отменить',
        isDestructive: options.isDestructive || false,
        hideCancel: options.hideCancel || false,
        onConfirm: () => {
          dialogState.value.isOpen = false;
          resolve(true);
        },
        onCancel: () => {
          dialogState.value.isOpen = false;
          resolve(false);
        }
      };
    });
  };

  const showConfirmDialog = (message: string, title?: string): Promise<boolean> => {
    return showDialog({
      title,
      message,
      confirmText: 'Да',
      cancelText: 'Отмена'
    });
  };

  const showDestructiveDialog = (message: string, title?: string, confirmText?: string): Promise<boolean> => {
    return showDialog({
      title,
      message,
      confirmText: confirmText || 'Удалить',
      cancelText: 'Отмена',
      isDestructive: true
    });
  };

  const showInfoDialog = (message: string, title?: string): Promise<boolean> => {
    return showDialog({
      title,
      message,
      confirmText: 'OK',
      hideCancel: true
    });
  };

  const hideDialog = () => {
    dialogState.value.isOpen = false;
  };

  const handleConfirm = () => {
    if (dialogState.value.onConfirm) {
      dialogState.value.onConfirm();
    }
  };

  const handleCancel = () => {
    if (dialogState.value.onCancel) {
      dialogState.value.onCancel();
    }
  };

  const handleDismiss = () => {
    handleCancel();
  };

  return {
    dialogState,
    showDialog,
    showConfirmDialog,
    showDestructiveDialog,
    showInfoDialog,
    hideDialog,
    handleConfirm,
    handleCancel,
    handleDismiss
  };
} 