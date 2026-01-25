import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  actualTheme: 'light' | 'dark'; // El tema actual resuelto (sin 'system')
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      actualTheme: 'light',

      setTheme: (theme: Theme) => {
        let actualTheme: 'light' | 'dark';
        
        if (theme === 'system') {
          actualTheme = getSystemTheme();
        } else {
          actualTheme = theme;
        }
        
        applyTheme(actualTheme);
        
        set({ theme, actualTheme });
      },

      toggleTheme: () => {
        const { actualTheme } = get();
        const newTheme = actualTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      initializeTheme: () => {
        const { theme } = get();
        
        // Escuchar cambios en las preferencias del sistema
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          
          const handleChange = () => {
            const { theme } = get();
            if (theme === 'system') {
              const systemTheme = getSystemTheme();
              applyTheme(systemTheme);
              set({ actualTheme: systemTheme });
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
          
          // Aplicar el tema inicial
          get().setTheme(theme);
        }
      },
    }),
    {
      name: 'goodent-theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);