import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PartyContextData, ThemeConfig } from '../types/party';

interface PartyContextState {
  // Estado de la fiesta actual
  currentPartyUuid: string | null;
  currentParty: PartyContextData | null;
  
  // Idioma/localización del contexto
  language: 'es' | 'en';

  // Acciones
  setPartyUuid: (uuid: string | null) => void;
  setPartyData: (data: PartyContextData | null) => void;
  setLanguage: (language: 'es' | 'en') => void;
  clearPartyContext: () => void;
  
  // Helper para aplicar tema de fiesta
  applyPartyTheme: (themeConfig?: ThemeConfig) => void;
  clearPartyTheme: () => void;
}

const applyThemeToDOM = (themeConfig?: ThemeConfig) => {
  const root = document.documentElement;
  
  if (!themeConfig) {
    // Remover atributo y estilos custom
    root.removeAttribute('data-party-theme');
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-secondary');
    root.style.removeProperty('--color-accent');
    root.style.removeProperty('--color-background');
    return;
  }

  // Aplicar atributo para CSS
  root.setAttribute('data-party-theme', 'true');

  // Aplicar variables CSS personalizadas si existen
  if (themeConfig.primaryColor) {
    root.style.setProperty('--color-primary', themeConfig.primaryColor);
  }
  if (themeConfig.secondaryColor) {
    root.style.setProperty('--color-secondary', themeConfig.secondaryColor);
  }
  if (themeConfig.accentColor) {
    root.style.setProperty('--color-accent', themeConfig.accentColor);
  }
  if (themeConfig.backgroundColor) {
    root.style.setProperty('--color-background', themeConfig.backgroundColor);
  }
};

export const usePartyContextStore = create<PartyContextState>()(
  persist(
    (set) => ({
      // Initial state
      currentPartyUuid: null,
      currentParty: null,
      language: 'es',

      // Actions
      setPartyUuid: (uuid: string | null) => {
        set({ currentPartyUuid: uuid });
        
        // Mantener el p_uuid en la URL si es posible
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          if (uuid) {
            searchParams.set('p_uuid', uuid);
          } else {
            searchParams.delete('p_uuid');
          }
          
          const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
          window.history.replaceState(null, '', newUrl);
        }
      },

      setPartyData: (data: PartyContextData | null) => {
        set({ currentParty: data });
        
        // Aplicar tema si existe
        if (data?.themeConfig) {
          applyThemeToDOM(data.themeConfig);
        }
      },

      setLanguage: (language: 'es' | 'en') => {
        set({ language });
      },

      clearPartyContext: () => {
        set({
          currentPartyUuid: null,
          currentParty: null,
        });
        applyThemeToDOM();
      },

      applyPartyTheme: (themeConfig?: ThemeConfig) => {
        applyThemeToDOM(themeConfig);
        if (themeConfig) {
          set((state) => ({
            currentParty: state.currentParty
              ? { ...state.currentParty, themeConfig }
              : null,
          }));
        }
      },

      clearPartyTheme: () => {
        applyThemeToDOM();
        set((state) => ({
          currentParty: state.currentParty
            ? { ...state.currentParty, themeConfig: undefined }
            : null,
        }));
      },
    }),
    {
      name: 'party-context-storage',
      partialize: (state) => ({
        currentPartyUuid: state.currentPartyUuid,
        language: state.language,
      }),
    }
  )
);
