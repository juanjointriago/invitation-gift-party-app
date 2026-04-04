import React from 'react';
import type { VenueItem, VenueSeat } from '../../types/venue.types';

interface Props {
  item: VenueItem;
  isSelected: boolean;
  isEditing: boolean;
  onPointerDown: (e: React.PointerEvent, item: VenueItem) => void;
  onSelect: (id: string) => void;
  onSeatsClick: (item: VenueItem) => void;
  highlightSeatId?: string;
}

interface SeatProps {
  num: number;
  x: number;
  y: number;
  seats: VenueSeat[];
  highlightSeatId?: string;
  ss: number;
  onSeatsClick: (item: VenueItem) => void;
  item: VenueItem;
}

const SeatDot: React.FC<SeatProps> = ({ num, x, y, seats, highlightSeatId, ss, onSeatsClick, item }) => {
  const seat = seats.find((s) => s.seatNumber === num);
  const isHL = !!(seat && highlightSeatId === seat.id);
  const hasGuest = !!(seat && seat.guestName);
  return (
    <div
      style={{ position: 'absolute', left: x, top: y, width: ss, height: ss }}
      className={`rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer transition-all overflow-hidden
        ${isHL ? 'border-purple-600 scale-110 shadow-lg shadow-purple-500/50'
          : hasGuest ? 'border-green-600'
          : 'bg-gray-100 dark:bg-zinc-600 border-gray-300 dark:border-zinc-500 text-gray-600 dark:text-gray-300'}`}
      title={seat?.guestName ? `${seat.guestName} · Asiento ${num}` : `Asiento ${num}: Libre`}
      onClick={(e) => { e.stopPropagation(); onSeatsClick(item); }}
    >
      {seat?.guestPhotoURL ? (
        <img src={seat.guestPhotoURL} alt={seat.guestName} className={`w-full h-full object-cover ${isHL ? 'opacity-80' : ''}`} />
      ) : hasGuest ? (
        <span className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${isHL ? 'bg-purple-500' : 'bg-green-500'}`}>
          {seat!.guestName![0].toUpperCase()}
        </span>
      ) : (
        num
      )}
    </div>
  );
};

export const RectTableItem: React.FC<Props> = ({
  item, isSelected, isEditing, onPointerDown, onSelect, onSeatsClick, highlightSeatId,
}) => {
  const capacity = item.capacity || 8;
  const seatsTop = Math.ceil(capacity / 2);
  const seatsBot = Math.floor(capacity / 2);
  const ss = 26; // seat size
  const pad = ss + 6;
  const tw = item.width - pad * 2;
  const th = item.height - pad * 2;
  const seats = item.seats || [];

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
        className={`absolute flex flex-col items-center justify-center border-2 rounded-md ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-amber-600/60'}`}
        style={{ left: pad, top: pad, width: tw, height: th, background: 'linear-gradient(135deg, #e8c77a, #b8860b)', cursor: isEditing ? 'grab' : 'pointer' }}
        onClick={(e) => { e.stopPropagation(); onSeatsClick(item); }}
      >
        <span className="text-xs font-bold text-amber-100 leading-tight">{item.label}</span>
        <span className="text-xs text-amber-200/80">{capacity} pers.</span>
      </div>
      {/* Top seats */}
      {Array.from({ length: seatsTop }).map((_, i) => (
        <SeatDot
          key={`t${i}`}
          num={i + 1}
          x={pad + (tw / (seatsTop + 1)) * (i + 1) - ss / 2}
          y={0}
          seats={seats}
          highlightSeatId={highlightSeatId}
          ss={ss}
          onSeatsClick={onSeatsClick}
          item={item}
        />
      ))}
      {/* Bottom seats */}
      {Array.from({ length: seatsBot }).map((_, i) => (
        <SeatDot
          key={`b${i}`}
          num={seatsTop + i + 1}
          x={pad + (tw / (seatsBot + 1)) * (i + 1) - ss / 2}
          y={pad + th + 6}
          seats={seats}
          highlightSeatId={highlightSeatId}
          ss={ss}
          onSeatsClick={onSeatsClick}
          item={item}
        />
      ))}
    </div>
  );
};
