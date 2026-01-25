import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../stores/notification.store';
import { useThemeStore } from '../stores/theme.store';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();
  const { actualTheme } = useThemeStore();
  const isDarkMode = actualTheme === 'dark';

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    if (isDarkMode) {
      switch (type) {
        case 'success':
          return 'bg-success/20 border-success/40 dark:bg-success/15 dark:border-success/35';
        case 'error':
          return 'bg-error/20 border-error/40 dark:bg-error/15 dark:border-error/35';
        case 'warning':
          return 'bg-warning/20 border-warning/40 dark:bg-warning/15 dark:border-warning/35';
        default:
          return 'bg-primary/20 border-primary/40 dark:bg-primary/15 dark:border-primary/35';
      }
    }
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/30';
      case 'error':
        return 'bg-error/10 border-error/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      default:
        return 'bg-primary/10 border-primary/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification: any) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 400 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-3 p-4 rounded-lg border ${getBackgroundColor(notification.type)} pointer-events-auto`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text">{notification.title}</h3>
              {notification.message && (
                <p className="text-sm text-text-muted mt-1">{notification.message}</p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-text-muted hover:text-text transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
