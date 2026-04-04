import { v4 as uuidv4 } from 'uuid';
import type { VenueItem, VenueLayout, VenueSeat, SeatSearchResult } from '../types/venue.types';
import { getTableRadius, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/venue.types';
import { setItem, updateItem, deleteItem, getItemById } from '../db/fb.helper';

const COLLECTION_VENUES = import.meta.env.VITE_COLLECTION_VENUES || 'venueLayouts';

function cleanUndefined<T>(val: T): T {
  if (Array.isArray(val)) {
    return val.map(cleanUndefined) as unknown as T;
  }
  if (val !== null && typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        cleaned[key] = cleanUndefined(obj[key]);
      }
    }
    return cleaned as T;
  }
  return val;
}

function buildSeats(capacity: number): VenueSeat[] {
  return Array.from({ length: capacity }, (_, i) => ({
    id: `seat-${i + 1}`,
    seatNumber: i + 1,
  }));
}

export class VenueService {
  static async getLayout(partyUuid: string): Promise<VenueLayout | null> {
    try {
      const layout = await getItemById<VenueLayout>(COLLECTION_VENUES, partyUuid);
      return layout && layout.id ? layout : null;
    } catch (error) {
      console.error('Error fetching venue layout:', error);
      throw error;
    }
  }

  static async saveLayout(layout: VenueLayout): Promise<void> {
    try {
      const data = cleanUndefined({ ...layout, updatedAt: Date.now() });
      await setItem(COLLECTION_VENUES, data as Record<string, unknown>);
    } catch (error) {
      console.error('Error saving venue layout:', error);
      throw error;
    }
  }

  static async createEmptyLayout(partyUuid: string): Promise<VenueLayout> {
    const now = Date.now();
    const layout: VenueLayout = {
      id: partyUuid,
      partyId: partyUuid,
      items: [],
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    };
    await this.saveLayout(layout);
    return layout;
  }

  static async updateLayout(partyUuid: string, updates: Partial<VenueLayout>): Promise<void> {
    try {
      const data = cleanUndefined({ id: partyUuid, ...updates, updatedAt: Date.now() });
      await updateItem(COLLECTION_VENUES, data as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating venue layout:', error);
      throw error;
    }
  }

  static async deleteLayout(partyUuid: string): Promise<void> {
    try {
      await deleteItem(COLLECTION_VENUES, partyUuid);
    } catch (error) {
      console.error('Error deleting venue layout:', error);
      throw error;
    }
  }

  static createItem(
    type: VenueItem['type'],
    x: number,
    y: number,
    options: { label: string; width: number; height: number; capacity?: number }
  ): VenueItem {
    const isTable = type === 'table-round' || type === 'table-rect';
    const maxCap = type === 'table-round' ? 12 : 20;
    const tableCapacity = isTable ? Math.max(4, Math.min(options.capacity ?? 8, maxCap)) : undefined;

    let width = options.width;
    let height = options.height;
    if (type === 'table-round' && tableCapacity) {
      const r = getTableRadius(tableCapacity);
      width = (r + 22) * 2;
      height = (r + 22) * 2;
    }

    return {
      id: uuidv4(),
      type,
      label: options.label,
      x: Math.round(x / 10) * 10,
      y: Math.round(y / 10) * 10,
      rotation: 0,
      width,
      height,
      capacity: tableCapacity,
      seats: isTable && tableCapacity ? buildSeats(tableCapacity) : undefined,
    };
  }

  static rebuildSeats(item: VenueItem, newCapacity: number): VenueItem {
    const maxCap = item.type === 'table-round' ? 12 : 20;
    const clamped = Math.max(4, Math.min(newCapacity, maxCap));
    const existing = item.seats || [];

    const newSeats: VenueSeat[] = Array.from({ length: clamped }, (_, i) => {
      const prev = existing.find((s) => s.seatNumber === i + 1);
      return prev ?? { id: `seat-${i + 1}`, seatNumber: i + 1 };
    });

    let width = item.width;
    let height = item.height;
    if (item.type === 'table-round') {
      const r = getTableRadius(clamped);
      width = (r + 22) * 2;
      height = (r + 22) * 2;
    }

    return { ...item, capacity: clamped, seats: newSeats, width, height };
  }

  static searchGuest(layout: VenueLayout, name: string): SeatSearchResult {
    if (!name.trim()) return { found: false };
    const lower = name.trim().toLowerCase();
    for (const item of layout.items) {
      if (!item.seats) continue;
      for (const seat of item.seats) {
        if (seat.guestName && seat.guestName.toLowerCase().includes(lower)) {
          return { found: true, guestName: seat.guestName, item, seat, tableLabel: item.label, seatNumber: seat.seatNumber };
        }
      }
    }
    return { found: false };
  }

  /** Busca el asiento asignado a un usuario por su ID (más fiable que por nombre) */
  static searchGuestById(layout: VenueLayout, userId: string): SeatSearchResult {
    if (!userId) return { found: false };
    for (const item of layout.items) {
      if (!item.seats) continue;
      for (const seat of item.seats) {
        if (seat.guestId === userId) {
          return { found: true, guestName: seat.guestName, item, seat, tableLabel: item.label, seatNumber: seat.seatNumber };
        }
      }
    }
    return { found: false };
  }
}
