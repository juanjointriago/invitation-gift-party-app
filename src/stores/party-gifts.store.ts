import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import type { GiftWithAvailability } from '../types/party';
import type { LoadingState } from '../types/common';

interface PartyGiftsState extends LoadingState {
  // Datos
  gifts: GiftWithAvailability[];
  selectedGiftId: string | null;
  
  // Acciones
  setGifts: (gifts: GiftWithAvailability[]) => void;
  updateGift: (giftId: string, updates: Partial<GiftWithAvailability>) => void;
  selectGift: (giftId: string) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const createPartyGiftsStore: StateCreator<PartyGiftsState> = (set) => ({
  // Initial state
  gifts: [],
  selectedGiftId: null,
  loading: false,
  error: null,

  // Actions
  setGifts: (gifts: GiftWithAvailability[]) => {
    set({ gifts });
  },

  updateGift: (giftId: string, updates: Partial<GiftWithAvailability>) => {
    set((state) => ({
      gifts: state.gifts.map((g) =>
        g.id === giftId ? { ...g, ...updates } : g
      ),
    }));
  },

  selectGift: (giftId: string) => {
    set({ selectedGiftId: giftId });
  },

  clearSelection: () => {
    set({ selectedGiftId: null });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
});

export const usePartyGiftsStore = create<PartyGiftsState>()(
  devtools(createPartyGiftsStore, { name: 'PartyGiftsStore' })
);

// Selector para regalo seleccionado
export const useSelectedGift = () => {
  const selectedGiftId = usePartyGiftsStore((state) => state.selectedGiftId);
  const gifts = usePartyGiftsStore((state) => state.gifts);

  return gifts.find((g) => g.id === selectedGiftId) || null;
};

// Selector para regalos disponibles
export const useAvailableGifts = () => {
  const gifts = usePartyGiftsStore((state) => state.gifts);
  return gifts.filter((g) => g.isAvailable);
};
