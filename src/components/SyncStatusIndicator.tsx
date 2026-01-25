import React from 'react';
import { motion } from 'framer-motion';
import { useNotificationStore } from '../stores/notification.store';
import { useThemeStore } from '../stores/theme.store';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';

export const SyncStatusIndicator: React.FC = () => {
  const syncOperations = useNotificationStore((state: any) => state.syncOperations);
  const { actualTheme } = useThemeStore();
  const isDarkMode = actualTheme === 'dark';

  if (syncOperations.size === 0) return null;

  const operations = Array.from(syncOperations.values());
  const activeOp = operations[operations.length - 1] as any; // Last operation

  if (!activeOp) return null;

  const getStatusIcon = () => {
    switch (activeOp.status) {
      case 'loading':
        return <Loader className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (activeOp.status) {
      case 'loading':
        return `${activeOp.action}...`;
      case 'success':
        return `${activeOp.action} completado`;
      case 'error':
        return `Error: ${activeOp.error || 'Operación fallida'}`;
      default:
        return activeOp.action;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg z-40 border ${isDarkMode ? 'bg-surface-dark border-border' : 'bg-background border-border'}`}
    >
      {getStatusIcon()}
      <span className="text-sm font-medium text-text">{getStatusText()}</span>
      {activeOp.progress !== undefined && activeOp.progress > 0 && activeOp.progress < 100 && (
        <div className={`w-24 h-1 rounded-full overflow-hidden ml-2 ${isDarkMode ? 'bg-surface-light/20' : 'bg-surface-light'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${activeOp.progress}%` }}
            className="h-full bg-primary"
          />
        </div>
      )}
    </motion.div>
  );
};
