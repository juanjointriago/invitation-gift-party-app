import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { VenueItem, VenueLayout } from '../../types/venue.types';
import { GRID_SIZE } from '../../types/venue.types';
import { RoundTableItem } from './RoundTableItem';
import { RectTableItem } from './RectTableItem';
import { VenueCanvasItem } from './VenueCanvasItem';

interface DragState {
  id: string;
  startPointerX: number;
  startPointerY: number;
  startItemX: number;
  startItemY: number;
}

interface Props {
  layout: VenueLayout;
  selectedItemId: string | null;
  isEditing: boolean;
  onMoveItem: (id: string, x: number, y: number) => void;
  onSelectItem: (id: string | null) => void;
  onSeatsClick: (item: VenueItem) => void;
  highlightItemId?: string;
  highlightSeatId?: string;
}

export const VenueCanvas: React.FC<Props> = ({
  layout, selectedItemId, isEditing, onMoveItem, onSelectItem, onSeatsClick,
  highlightItemId, highlightSeatId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState<DragState | null>(null);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setScale(Math.min(containerRef.current.clientWidth / layout.canvasWidth, 1));
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [layout.canvasWidth]);

  const handleItemPointerDown = useCallback((e: React.PointerEvent, item: VenueItem) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging({ id: item.id, startPointerX: e.clientX, startPointerY: e.clientY, startItemX: item.x, startItemY: item.y });
  }, [isEditing]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = (e.clientX - dragging.startPointerX) / scale;
    const dy = (e.clientY - dragging.startPointerY) / scale;
    const sx = Math.round((dragging.startItemX + dx) / GRID_SIZE) * GRID_SIZE;
    const sy = Math.round((dragging.startItemY + dy) / GRID_SIZE) * GRID_SIZE;
    onMoveItem(dragging.id, sx, sy);
  }, [dragging, scale, onMoveItem]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden bg-gray-100 dark:bg-zinc-900 min-h-0">
      <div
        style={{
          width: layout.canvasWidth, height: layout.canvasHeight,
          transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative',
        }}
        className="bg-white dark:bg-zinc-800"
        onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-vi]')) onSelectItem(null); }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
          <defs>
            <pattern id="vg" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-zinc-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vg)" />
        </svg>

        {layout.items.map((item) => {
          const sel = selectedItemId === item.id || highlightItemId === item.id;
          const common = { item, isSelected: sel, isEditing, onPointerDown: handleItemPointerDown, onSelect: onSelectItem };
          if (item.type === 'table-round')
            return <div key={item.id} data-vi="1"><RoundTableItem {...common} onSeatsClick={onSeatsClick} highlightSeatId={sel && highlightItemId === item.id ? highlightSeatId : undefined} /></div>;
          if (item.type === 'table-rect')
            return <div key={item.id} data-vi="1"><RectTableItem {...common} onSeatsClick={onSeatsClick} highlightSeatId={sel && highlightItemId === item.id ? highlightSeatId : undefined} /></div>;
          return <div key={item.id} data-vi="1"><VenueCanvasItem {...common} /></div>;
        })}

        {layout.items.length === 0 && isEditing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-3xl mb-2">🏛️</p>
              <p className="text-gray-400 dark:text-zinc-500 text-sm">Agrega elementos desde el panel izquierdo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
