import React, { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { useThemeStore } from '../stores/theme.store';
import { AlertTriangle, Loader } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  children?: ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { actualTheme } = useThemeStore();
  const isDarkMode = actualTheme === 'dark';

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className={`fixed inset-0 z-40 ${isDarkMode ? 'bg-black/60' : 'bg-black/40'}`}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className={`border rounded-lg shadow-xl max-w-md w-full mx-4 ${isDarkMode ? 'bg-surface-dark border-border' : 'bg-background border-border'}`}>
              {/* Header */}
              <div className={`p-6 border-b ${isDangerous ? (isDarkMode ? 'bg-error/15 border-error/20' : 'bg-error/10 border-error/20') : isDarkMode ? 'bg-surface-dark border-border' : 'border-border'}`}>
                <div className="flex items-start gap-3">
                  {isDangerous && <AlertTriangle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-text">{title}</h2>
                    <p className="text-sm text-text-muted mt-1">{message}</p>
                    {description && <p className="text-xs text-text-muted mt-2">{description}</p>}
                  </div>
                </div>
              </div>

              {/* Content */}
              {children && <div className={`p-6 border-b ${isDarkMode ? 'border-border' : 'border-border'}`}>{children}</div>}

              {/* Actions */}
              <div className={`p-6 flex items-center justify-end gap-3 ${isDarkMode ? 'bg-surface-dark' : 'bg-background'}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing || isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  variant={isDangerous ? 'danger' : 'primary'}
                  onClick={handleConfirm}
                  disabled={isProcessing || isLoading}
                  className="gap-2"
                >
                  {isProcessing || isLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    confirmText
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
