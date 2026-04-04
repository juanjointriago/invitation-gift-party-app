import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

interface ThemeState {
  theme: ThemeMode;
  actualTheme: 'light' | 'dark';

  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
  /** Apply user brand colors to :root (dashboard scope — overrides CSS defaults) */
  applyUserBrandColors: (colors: BrandColors) => void;
  /** Remove user brand colors from :root */
  clearUserBrandColors: () => void;
}

const BRAND_VARS: Array<[keyof BrandColors, string]> = [
  ['primary', '--color-primary'],
  ['secondary', '--color-secondary'],
  ['accent', '--color-accent'],
];

const getSystemTheme = (): 'light' | 'dark' =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const applyThemeClass = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      actualTheme: 'light',

      setTheme: (theme: ThemeMode) => {
        const actual = theme === 'system' ? getSystemTheme() : theme;
        applyThemeClass(actual);
        set({ theme, actualTheme: actual });
      },

      toggleTheme: () => {
        const next = get().actualTheme === 'light' ? 'dark' : 'light';
        get().setTheme(next);
      },

      initializeTheme: () => {
        const { theme, setTheme } = get();
        setTheme(theme);

        if (typeof window !== 'undefined') {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (get().theme === 'system') {
              const actual = getSystemTheme();
              applyThemeClass(actual);
              set({ actualTheme: actual });
            }
          });
        }
      },

      applyUserBrandColors: (colors: BrandColors) => {
        if (typeof window === 'undefined') return;
        BRAND_VARS.forEach(([key, cssVar]) => {
          const val = colors[key];
          if (val) document.documentElement.style.setProperty(cssVar, val);
          else document.documentElement.style.removeProperty(cssVar);
        });
      },

      clearUserBrandColors: () => {
        if (typeof window === 'undefined') return;
        BRAND_VARS.forEach(([, cssVar]) => {
          document.documentElement.style.removeProperty(cssVar);
        });
      },
    }),
    {
      name: 'partygifts-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
