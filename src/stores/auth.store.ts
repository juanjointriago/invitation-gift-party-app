import type { StateCreator } from "zustand";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { AuthService } from "../services/auth.service";
import type { 
  IUser, 
  LoginCredentials, 
  CreateUserData, 
  AuthResponse, 
  RegisterResponse 
} from "../interfaces/users.interface";
import type { LoadingState } from "../types/common";
import { createAsyncAction, StoreError } from "../utils/store.utils";

interface AuthState extends LoadingState {
  user: IUser | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: CreateUserData) => Promise<RegisterResponse>;
  logout: () => void;
  setUser: (user: IUser | null) => void;
  checkAuth: () => Promise<void>;
  initializeAuthListener: () => () => void; // Returns unsubscribe function
  clearError: () => void;
}

const createAuthStore: StateCreator<AuthState> = (set) => {
  // Helper function to update auth state
  const updateAuthState = (user: IUser | null, isAuthenticated: boolean) => {
    set({
      user,
      isAuthenticated,
      error: null
    });
  };

  // Helper function for setting loading and error states
  const setLoading = (loading: boolean) => set({ loading });
  const setError = (error: string | null) => set({ error });

  return {
    // Initial state
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,

    // Actions
    login: createAsyncAction(
      async ({ email, password }: LoginCredentials) => {
        const result: AuthResponse = await AuthService.login(email, password);
        
        if (result.isAuthenticated && result.user) {
          updateAuthState(result.user, true);
          console.debug("User authenticated successfully", result.user.email);
        } else {
          updateAuthState(null, false);
          throw new StoreError(result.message || 'Authentication failed');
        }
      },
      setLoading,
      setError
    ),

    register: createAsyncAction(
      async (userData: CreateUserData): Promise<RegisterResponse> => {
        const result: RegisterResponse = await AuthService.signUp(userData);
        
        // Only update auth state if registration was successful and user data is provided
        if (result.isAuthenticated && result.user) {
          updateAuthState(result.user, true);
        }
        
        return result;
      },
      setLoading,
      setError
    ),

    logout: () => {
      updateAuthState(null, false);
      AuthService.logout();
      console.debug("User logged out successfully");
    },

    setUser: (user: IUser | null) => {
      updateAuthState(user, !!user);
    },

    checkAuth: createAsyncAction(
      async () => {
        console.debug('Checking authentication status...');
        const user = await AuthService.checkStatus();
        
        if (user) {
          updateAuthState(user, true);
          console.debug('User is authenticated:', user.email);
        } else {
          updateAuthState(null, false);
          console.debug('User is not authenticated');
        }
      },
      setLoading,
      setError
    ),

    initializeAuthListener: () => {
      const auth = getAuth();
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
        if (firebaseUser) {
          // Usuario autenticado en Firebase, verificar en Firestore
          try {
            const userData = await AuthService.checkStatus();
            if (userData) {
              updateAuthState(userData, true);
              console.debug('Auth listener: User restored from Firebase Auth:', userData.email);
            } else {
              // Usuario en Firebase pero no en Firestore, logout
              updateAuthState(null, false);
              console.debug('Auth listener: User not found in Firestore, logging out');
              AuthService.logout();
            }
          } catch (error) {
            console.error('Auth listener error:', error);
            updateAuthState(null, false);
          }
        } else {
          // No hay usuario autenticado
          updateAuthState(null, false);
          console.debug('Auth listener: No user authenticated');
        }
      });

      return unsubscribe;
    },

    clearError: () => {
      set({ error: null });
    },
  };
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(createAuthStore, {
      name: 'goodent-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.debug('Auth store rehydrated:', state?.user?.email || 'No user');
        // Inicializar el listener de Firebase Auth después de la rehidratación
        if (state) {
          const unsubscribe = state.initializeAuthListener();
          // Guardar la función de limpieza para uso futuro
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__authUnsubscribe = unsubscribe;
        }
      },
    }),
    { name: 'AuthStore' }
  )
);