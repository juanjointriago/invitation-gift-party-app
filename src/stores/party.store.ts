import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import type { Party } from '../types/party';
import type { LoadingState } from '../types/common';

interface PartyStoreState extends LoadingState {
  // Datos
  parties: Party[];
  selectedParty: Party | null;
  
  // Filtros
  filterByStatus: 'all' | 'draft' | 'published' | 'archived';
  
  // Acciones
  setParties: (parties: Party[]) => void;
  addParty: (party: Party) => void;
  updateParty: (partyUuid: string, updates: Partial<Party>) => void;
  deleteParty: (partyUuid: string) => void;
  setSelectedParty: (party: Party | null) => void;
  setFilterByStatus: (status: 'all' | 'draft' | 'published' | 'archived') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const createPartyStore: StateCreator<PartyStoreState> = (set) => ({
  // Initial state
  parties: [],
  selectedParty: null,
  loading: false,
  error: null,
  filterByStatus: 'all',

  // Actions
  setParties: (parties: Party[]) => {
    set({ parties });
  },

  addParty: (party: Party) => {
    set((state) => ({
      parties: [party, ...state.parties],
    }));
  },

  updateParty: (partyUuid: string, updates: Partial<Party>) => {
    set((state) => ({
      parties: state.parties.map((p) =>
        p.party_uuid === partyUuid ? { ...p, ...updates } : p
      ),
      selectedParty:
        state.selectedParty?.party_uuid === partyUuid
          ? { ...state.selectedParty, ...updates }
          : state.selectedParty,
    }));
  },

  deleteParty: (partyUuid: string) => {
    set((state) => ({
      parties: state.parties.filter((p) => p.party_uuid !== partyUuid),
      selectedParty:
        state.selectedParty?.party_uuid === partyUuid
          ? null
          : state.selectedParty,
    }));
  },

  setSelectedParty: (party: Party | null) => {
    set({ selectedParty: party });
  },

  setFilterByStatus: (status: 'all' | 'draft' | 'published' | 'archived') => {
    set({ filterByStatus: status });
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

export const usePartyStore = create<PartyStoreState>()(
  devtools(createPartyStore, { name: 'PartyStore' })
);

// Selector para fiestas filtradas
export const useFilteredParties = () => {
  const parties = usePartyStore((state) => state.parties);
  const filterByStatus = usePartyStore((state) => state.filterByStatus);

  if (filterByStatus === 'all') {
    return parties;
  }

  return parties.filter((p) => p.status === filterByStatus);
};
