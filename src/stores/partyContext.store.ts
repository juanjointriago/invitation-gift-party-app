import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PartyContextData, ThemeConfig } from '../types/party';

interface PartyContextState {
  currentPartyUuid: string | null;
  currentParty: PartyContextData | null;
  language: 'es' | 'en';

  setPartyUuid: (uuid: string | null) => void;
  setPartyData: (data: PartyContextData | null) => void;
  setLanguage: (language: 'es' | 'en') => void;
  clearPartyContext: () => void;
  /** Update themeConfig in state only — DOM scoping is handled by PartyGuestLayout */
  applyPartyTheme: (themeConfig?: ThemeConfig) => void;
  clearPartyTheme: () => void;
}

export const usePartyContextStore = create<PartyContextState>()(
  persist(
    (set) => ({
      currentPartyUuid: null,
      currentParty: null,
      language: 'es',

      setPartyUuid: (uuid) => {
        set({ currentPartyUuid: uuid });
        if (typeof window !== 'undefined') {
          const sp = new URLSearchParams(window.location.search);
          if (uuid) sp.set('p_uuid', uuid);
          else sp.delete('p_uuid');
          window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
        }
      },

      setPartyData: (data) => {
        // No DOM side-effects here — PartyGuestLayout reads themeConfig and scopes it to its div
        set({ currentParty: data });
      },

      setLanguage: (language) => set({ language }),

      clearPartyContext: () => {
        set({ currentPartyUuid: null, currentParty: null });
      },

      applyPartyTheme: (themeConfig) => {
        set((state) => ({
          currentParty: state.currentParty
            ? { ...state.currentParty, themeConfig }
            : null,
        }));
      },

      clearPartyTheme: () => {
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
