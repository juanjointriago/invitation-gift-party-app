import React from 'react';
import { PALETTE_ITEMS } from '../../types/venue.types';
import type { PaletteItem } from '../../types/venue.types';

interface Props {
  onAddItem: (item: PaletteItem) => void;
}

const GROUPS = [
  { label: 'Mesas', types: ['table-round', 'table-rect'] },
  { label: 'Zonas', types: ['stage', 'dance-floor', 'bar', 'dj-booth'] },
  { label: 'Accesos', types: ['entrance', 'exit'] },
  { label: 'Decoración', types: ['decoration'] },
];

export const VenueItemPalette: React.FC<Props> = ({ onAddItem }) => (
  <div className="w-44 shrink-0 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex flex-col overflow-y-auto">
    <div className="p-3 border-b border-gray-200 dark:border-zinc-700">
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Elementos</p>
    </div>
    <div className="flex-1 p-2 space-y-3">
      {GROUPS.map((g) => {
        const items = PALETTE_ITEMS.filter((p) => g.types.includes(p.type));
        return (
          <div key={g.label}>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1">{g.label}</p>
            {items.map((item) => (
              <button
                key={item.type}
                onClick={() => onAddItem(item)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-left"
              >
                <span className="text-base leading-none">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{item.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  </div>
);
