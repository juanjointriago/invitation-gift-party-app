import React from 'react';
import type { VenueItem } from '../../types/venue.types';
import { getTableRadius } from '../../types/venue.types';

interface Props {
  item: VenueItem;
  isSelected: boolean;
  isEditing: boolean;
  onPointerDown: (e: React.PointerEvent, item: VenueItem) => void;
  onSelect: (id: string) => void;
  onSeatsClick: (item: VenueItem) => void;
  highlightSeatId?: string;
}

export const RoundTableItem: React.FC<Props> = ({
  item, isSelected, isEditing, onPointerDown, onSelect, onSeatsClick, highlightSeatId,
}) => {
  const capacity = item.capacity || 8;
  const r = getTableRadius(capacity);
  const seatR = 14;
  const orbit = r + seatR + 6;
  const cx = item.width / 2;
  const cy = item.height / 2;

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
      {/* Table */}
      <div
        className={`absolute rounded-full flex flex-col items-center justify-center border-2 ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-amber-600/60'}`}
        style={{
          left: cx - r, top: cy - r, width: r * 2, height: r * 2,
          background: 'radial-gradient(circle at 35% 35%, #e8c77a, #b8860b)',
          cursor: isEditing ? 'grab' : 'pointer',
        }}
        onClick={(e) => { e.stopPropagation(); onSeatsClick(item); }}
      >
        <span className="text-xs font-bold text-amber-100 text-center leading-tight px-1">{item.label}</span>
        <span className="text-xs text-amber-200/80">{capacity} pers.</span>
      </div>

      {/* Seats */}
      {item.seats?.map((seat) => {
        const angle = (2 * Math.PI * (seat.seatNumber - 1)) / capacity - Math.PI / 2;
        const sx = cx + Math.cos(angle) * orbit - seatR;
        const sy = cy + Math.sin(angle) * orbit - seatR;
        const isHL = highlightSeatId === seat.id;
        const hasGuest = !!seat.guestName;
        return (
          <div
            key={seat.id}
            style={{ position: 'absolute', left: sx, top: sy, width: seatR * 2, height: seatR * 2, zIndex: isHL ? 25 : 15 }}
            className={`rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer transition-all overflow-hidden
              ${isHL ? 'border-purple-600 scale-125 shadow-lg shadow-purple-500/50'
                : hasGuest ? 'border-green-600'
                : 'bg-gray-100 dark:bg-zinc-600 border-gray-300 dark:border-zinc-500 text-gray-600 dark:text-gray-300'}`}
            title={seat.guestName ? `${seat.guestName} · Asiento ${seat.seatNumber}` : `Asiento ${seat.seatNumber}: Libre`}
            onClick={(e) => { e.stopPropagation(); onSeatsClick(item); }}
          >
            {seat.guestPhotoURL ? (
              <img src={seat.guestPhotoURL} alt={seat.guestName} className={`w-full h-full object-cover ${isHL ? 'opacity-80' : ''}`} />
            ) : hasGuest ? (
              <span className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${isHL ? 'bg-purple-500' : 'bg-green-500'}`}>
                {seat.guestName![0].toUpperCase()}
              </span>
            ) : (
              seat.seatNumber
            )}
          </div>
        );
      })}
    </div>
  );
};
