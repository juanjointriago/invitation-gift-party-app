import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number | null; // ms, null = persistent
  createdAt: number;
}

export interface SyncOperation {
  id: string;
  action: string;
  status: SyncStatus;
  progress?: number; // 0-100
  error?: string;
}

interface NotificationState {
  notifications: Notification[];
  syncOperations: Map<string, SyncOperation>;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Sync operations
  startSync: (id: string, action: string) => void;
  updateSync: (id: string, status: SyncStatus, progress?: number, error?: string) => void;
  endSync: (id: string, status: SyncStatus, error?: string) => void;
  getSyncStatus: (id: string) => SyncStatus;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      syncOperations: new Map(),

      addNotification: (notification) => {
        const id = `notif-${Date.now()}-${Math.random()}`;
        const newNotif: Notification = {
          ...notification,
          id,
          createdAt: Date.now(),
        };

        set((state) => ({
          notifications: [...state.notifications, newNotif],
        }));

        // Auto-remove after duration
        if (notification.duration !== null) {
          const duration = notification.duration || 5000;
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }

        return id;
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      startSync: (id: string, action: string) => {
        set((state) => {
          const newOps = new Map(state.syncOperations);
          newOps.set(id, {
            id,
            action,
            status: 'loading',
            progress: 0,
          });
          return { syncOperations: newOps };
        });
      },

      updateSync: (id: string, status: SyncStatus, progress = 0, error = '') => {
        set((state) => {
          const newOps = new Map(state.syncOperations);
          const existing = newOps.get(id);
          if (existing) {
            newOps.set(id, {
              ...existing,
              status,
              progress,
              error,
            });
          }
          return { syncOperations: newOps };
        });
      },

      endSync: (id: string, status: SyncStatus, error = '') => {
        set((state) => {
          const newOps = new Map(state.syncOperations);
          const existing = newOps.get(id);
          if (existing) {
            newOps.set(id, {
              ...existing,
              status,
              error,
              progress: status === 'success' ? 100 : existing.progress,
            });
          }
          return { syncOperations: newOps };
        });

        // Auto-clear after 3s
        setTimeout(() => {
          set((state) => {
            const newOps = new Map(state.syncOperations);
            newOps.delete(id);
            return { syncOperations: newOps };
          });
        }, 3000);
      },

      getSyncStatus: (id: string) => {
        return get().syncOperations.get(id)?.status || 'idle';
      },
    }),
    { name: 'NotificationStore' }
  )
);
