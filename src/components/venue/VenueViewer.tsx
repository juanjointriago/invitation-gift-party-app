import React from 'react';
import type { VenueLayout } from '../../types/venue.types';
import { VenueCanvas } from './VenueCanvas';

interface Props {
  layout: VenueLayout;
  highlightItemId?: string;
  highlightSeatId?: string;
  title?: string;
}

export const VenueViewer: React.FC<Props> = ({ layout, highlightItemId, highlightSeatId, title }) => (
  <div className="flex flex-col gap-2">
    {title && (
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <button onClick={() => window.print()} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">🖨️ Imprimir plano</button>
      </div>
    )}
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
      <VenueCanvas
        layout={layout} selectedItemId={null} isEditing={false}
        onMoveItem={() => {}} onSelectItem={() => {}} onSeatsClick={() => {}}
        highlightItemId={highlightItemId} highlightSeatId={highlightSeatId}
      />
    </div>
    {highlightItemId && <p className="text-xs text-center text-gray-400 dark:text-gray-500">Tu asiento está marcado en morado ↑</p>}
  </div>
);
