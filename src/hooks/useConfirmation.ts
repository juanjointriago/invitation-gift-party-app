import { useState, useCallback } from 'react';
import { useNotificationStore } from '../stores/notification.store';

interface ConfirmOptions {
  title: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => Promise<void> | void;
  onError?: (error: Error) => void;
  onSuccess?: (message?: string) => void;
}

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await options?.onConfirm();
      options?.onSuccess?.();
      addNotification({
        type: 'success',
        title: 'Operación completada',
        message: 'Los cambios se han guardado correctamente',
        duration: 5000,
      });
      setIsOpen(false);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      options?.onError?.(err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: err.message,
        duration: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [options, addNotification]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    options,
    isLoading,
    confirm,
    handleConfirm,
    handleCancel,
  };
};
