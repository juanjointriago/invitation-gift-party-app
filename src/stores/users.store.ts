import { create } from 'zustand';
import type { IUser } from '../interfaces/users.interface';
import { UsersService } from '../services/users.service';

interface UsersState {
  usersCache: Map<string, IUser>;
  loading: boolean;
  
  // Actions
  getUserById: (userId: string) => IUser | undefined;
  getUsersByIds: (userIds: string[]) => Promise<Map<string, IUser>>;
  clearCache: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  usersCache: new Map(),
  loading: false,

  getUserById: (userId: string) => {
    return get().usersCache.get(userId);
  },

  getUsersByIds: async (userIds: string[]) => {
    const { usersCache } = get();
    const missingIds = userIds.filter(id => !usersCache.has(id));
    
    // Si todos los usuarios ya están en cache, devolverlos
    if (missingIds.length === 0) {
      const result = new Map<string, IUser>();
      userIds.forEach(id => {
        const user = usersCache.get(id);
        if (user) result.set(id, user);
      });
      return result;
    }

    // Cargar usuarios faltantes
    set({ loading: true });
    try {
      const newUsers = await UsersService.getUsersByIds(missingIds);
      
      // Actualizar cache
      const updatedCache = new Map(usersCache);
      newUsers.forEach((user, id) => {
        updatedCache.set(id, user);
      });
      
      set({ usersCache: updatedCache, loading: false });
      
      // Devolver todos los usuarios solicitados
      const result = new Map<string, IUser>();
      userIds.forEach(id => {
        const user = updatedCache.get(id);
        if (user) result.set(id, user);
      });
      return result;
    } catch (error) {
      console.error('Error loading users:', error);
      set({ loading: false });
      return new Map();
    }
  },

  clearCache: () => {
    set({ usersCache: new Map() });
  },
}));
