import React from 'react';
import type { VenueItem } from '../../types/venue.types';
import { getItemColor } from '../../types/venue.types';

const ICONS: Record<string, string> = {
  stage: '🎭', 'dance-floor': '🕺', bar: '🍸', 'dj-booth': '🎵',
  entrance: '🚪', exit: '🚪', decoration: '🌿',
};

interface Props {
  item: VenueItem;
  isSelected: boolean;
  isEditing: boolean;
  onPointerDown: (e: React.PointerEvent, item: VenueItem) => void;
  onSelect: (id: string) => void;
}

export const VenueCanvasItem: React.FC<Props> = ({ item, isSelected, isEditing, onPointerDown, onSelect }) => {
  const color = item.color || getItemColor(item.type);
  return (
    <div
      style={{
        position: 'absolute', left: item.x, top: item.y,
        width: item.width, height: item.height,
        transform: `rotate(${item.rotation}deg)`, transformOrigin: 'center center',
        touchAction: 'none', cursor: isEditing ? 'grab' : 'default',
        userSelect: 'none', zIndex: isSelected ? 20 : 10,
      }}
      onPointerDown={(e) => { if (isEditing) onPointerDown(e, item); }}
      onClick={() => onSelect(item.id)}
    >
      <div
        className={`w-full h-full rounded-lg flex flex-col items-center justify-center border-2 transition-all ${isSelected ? 'shadow-lg' : ''}`}
        style={{ backgroundColor: color + '30', borderColor: isSelected ? '#8b5cf6' : color }}
      >
        <span className="text-xl leading-none">{ICONS[item.type] || '📦'}</span>
        <span className="text-xs font-bold mt-1 text-center px-1 leading-tight" style={{ color }}>{item.label}</span>
      </div>
    </div>
  );
};
