export type VenueItemType =
  | 'table-round'
  | 'table-rect'
  | 'stage'
  | 'dance-floor'
  | 'bar'
  | 'dj-booth'
  | 'entrance'
  | 'exit'
  | 'decoration';

export interface VenueSeat {
  id: string;
  seatNumber: number;
  guestName?: string;
  guestId?: string;
  guestPhotoURL?: string;
  companionName?: string;
}

export interface VenueItem {
  id: string;
  type: VenueItemType;
  label: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  capacity?: number;
  seats?: VenueSeat[];
  color?: string;
}

export interface VenueLayout {
  id: string;
  partyId: string;
  items: VenueItem[];
  canvasWidth: number;
  canvasHeight: number;
  isPublished: boolean;
  updatedAt: number;
  createdAt: number;
}

export interface SeatSearchResult {
  found: boolean;
  guestName?: string;
  item?: VenueItem;
  seat?: VenueSeat;
  tableLabel?: string;
  seatNumber?: number;
}

export interface PaletteItem {
  type: VenueItemType;
  label: string;
  icon: string;
  defaultCapacity?: number;
  defaultWidth: number;
  defaultHeight: number;
  description: string;
}

export const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'table-round', label: 'Mesa redonda', icon: '⭕', defaultCapacity: 8, defaultWidth: 150, defaultHeight: 150, description: '4–12 asientos' },
  { type: 'table-rect', label: 'Mesa rectangular', icon: '⬜', defaultCapacity: 8, defaultWidth: 200, defaultHeight: 100, description: '4–20 asientos' },
  { type: 'stage', label: 'Tarima', icon: '🎭', defaultWidth: 220, defaultHeight: 90, description: 'Tarima principal' },
  { type: 'dance-floor', label: 'Pista de baile', icon: '🕺', defaultWidth: 180, defaultHeight: 180, description: 'Pista de baile' },
  { type: 'bar', label: 'Barra / Bar', icon: '🍸', defaultWidth: 160, defaultHeight: 55, description: 'Barra o bar' },
  { type: 'dj-booth', label: 'Cabina DJ', icon: '🎵', defaultWidth: 90, defaultHeight: 90, description: 'Cabina de DJ' },
  { type: 'entrance', label: 'Entrada', icon: '🚪', defaultWidth: 70, defaultHeight: 50, description: 'Entrada principal' },
  { type: 'exit', label: 'Salida', icon: '🚪', defaultWidth: 70, defaultHeight: 50, description: 'Salida' },
  { type: 'decoration', label: 'Decoración', icon: '🌿', defaultWidth: 50, defaultHeight: 50, description: 'Planta, columna, etc.' },
];

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
export const GRID_SIZE = 10;

export const getTableRadius = (capacity: number): number => {
  if (capacity <= 6) return 38;
  if (capacity <= 10) return 52;
  return 66;
};

export const getItemColor = (type: VenueItemType): string => {
  const colors: Record<VenueItemType, string> = {
    'table-round': '#d4a76a',
    'table-rect': '#d4a76a',
    'stage': '#6366f1',
    'dance-floor': '#ec4899',
    'bar': '#f59e0b',
    'dj-booth': '#8b5cf6',
    'entrance': '#10b981',
    'exit': '#ef4444',
    'decoration': '#84cc16',
  };
  return colors[type];
};
