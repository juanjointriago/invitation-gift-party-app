import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { VenueLayout, VenueItem, VenueSeat } from '../types/venue.types';
import { VenueService } from '../services/venue.service';

interface VenueState {
  layout: VenueLayout | null;
  selectedItemId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  loadLayout: (partyUuid: string) => Promise<void>;
  saveLayout: () => Promise<void>;
  addItem: (item: VenueItem) => void;
  updateItem: (itemId: string, updates: Partial<VenueItem>) => void;
  removeItem: (itemId: string) => void;
  moveItem: (itemId: string, x: number, y: number) => void;
  rotateItem: (itemId: string) => void;
  updateSeats: (itemId: string, seats: VenueSeat[]) => void;
  setCapacity: (itemId: string, capacity: number) => void;
  selectItem: (itemId: string | null) => void;
  publishLayout: (partyUuid: string, published: boolean) => Promise<void>;
  clearLayout: () => void;
}

export const useVenueStore = create<VenueState>()(
  devtools(
    (set, get) => ({
      layout: null,
      selectedItemId: null,
      loading: false,
      saving: false,
      error: null,

      loadLayout: async (partyUuid) => {
        set({ loading: true, error: null });
        try {
          let layout = await VenueService.getLayout(partyUuid);
          if (!layout) layout = await VenueService.createEmptyLayout(partyUuid);
          set({ layout });
        } catch {
          set({ error: 'Error cargando el plano' });
        } finally {
          set({ loading: false });
        }
      },

      saveLayout: async () => {
        const { layout } = get();
        if (!layout) return;
        set({ saving: true, error: null });
        try {
          await VenueService.saveLayout(layout);
        } catch (e) {
          set({ error: 'Error guardando el plano' });
          throw e;
        } finally {
          set({ saving: false });
        }
      },

      addItem: (item) =>
        set((s) => ({
          layout: s.layout ? { ...s.layout, items: [...s.layout.items, item] } : s.layout,
        })),

      updateItem: (itemId, updates) =>
        set((s) => ({
          layout: s.layout
            ? { ...s.layout, items: s.layout.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
            : s.layout,
        })),

      removeItem: (itemId) =>
        set((s) => ({
          layout: s.layout
            ? { ...s.layout, items: s.layout.items.filter((i) => i.id !== itemId) }
            : s.layout,
          selectedItemId: s.selectedItemId === itemId ? null : s.selectedItemId,
        })),

      moveItem: (itemId, x, y) => {
        const { layout } = get();
        if (!layout) return;
        const item = layout.items.find((i) => i.id === itemId);
        if (!item) return;
        const cx = Math.max(0, Math.min(x, layout.canvasWidth - item.width));
        const cy = Math.max(0, Math.min(y, layout.canvasHeight - item.height));
        set((s) => ({
          layout: s.layout
            ? { ...s.layout, items: s.layout.items.map((i) => (i.id === itemId ? { ...i, x: cx, y: cy } : i)) }
            : s.layout,
        }));
      },

      rotateItem: (itemId) =>
        set((s) => ({
          layout: s.layout
            ? {
                ...s.layout,
                items: s.layout.items.map((i) =>
                  i.id === itemId ? { ...i, rotation: (i.rotation + 45) % 360 } : i
                ),
              }
            : s.layout,
        })),

      updateSeats: (itemId, seats) =>
        set((s) => ({
          layout: s.layout
            ? { ...s.layout, items: s.layout.items.map((i) => (i.id === itemId ? { ...i, seats } : i)) }
            : s.layout,
        })),

      setCapacity: (itemId, capacity) => {
        const item = get().layout?.items.find((i) => i.id === itemId);
        if (!item) return;
        const updated = VenueService.rebuildSeats(item, capacity);
        set((s) => ({
          layout: s.layout
            ? { ...s.layout, items: s.layout.items.map((i) => (i.id === itemId ? updated : i)) }
            : s.layout,
        }));
      },

      selectItem: (itemId) => set({ selectedItemId: itemId }),

      publishLayout: async (partyUuid, published) => {
        set({ loading: true, error: null });
        try {
          await VenueService.updateLayout(partyUuid, { isPublished: published });
          set((s) => ({
            layout: s.layout ? { ...s.layout, isPublished: published } : s.layout,
          }));
        } catch {
          set({ error: 'Error actualizando visibilidad del plano' });
        } finally {
          set({ loading: false });
        }
      },

      clearLayout: () => set({ layout: null, selectedItemId: null, error: null }),
    }),
    { name: 'venue-store' }
  )
);
