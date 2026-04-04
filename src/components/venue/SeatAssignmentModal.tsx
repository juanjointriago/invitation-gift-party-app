import React, { useState } from 'react';
import type { VenueItem, VenueSeat } from '../../types/venue.types';
import { getTableRadius } from '../../types/venue.types';
import { Button } from '../ui/button';

interface Props {
  item: VenueItem;
  confirmedGuests: Array<{ id: string; name: string; photoURL?: string }>;
  onSave: (seats: VenueSeat[]) => void;
  onClose: () => void;
  onCapacityChange: (capacity: number) => void;
  allowCompanions?: boolean;
}

export const SeatAssignmentModal: React.FC<Props> = ({ item, confirmedGuests, onSave, onClose, onCapacityChange, allowCompanions }) => {
  const [seats, setSeats] = useState<VenueSeat[]>(item.seats || []);
  const [cap, setCap] = useState(item.capacity || 8);
  const isRound = item.type === 'table-round';
  const minCap = 4;
  const maxCap = isRound ? 12 : 20;

  const updateSeat = (num: number, name: string) => {
    const guest = confirmedGuests.find((g) => g.name === name);
    setSeats((p) => p.map((s) => s.seatNumber !== num ? s : {
      ...s,
      guestName: name || undefined,
      guestId: guest?.id ?? (name ? s.guestId : undefined),
      guestPhotoURL: guest?.photoURL ?? (name ? s.guestPhotoURL : undefined),
    }));
  };

  const updateCompanion = (num: number, companionName: string) =>
    setSeats((p) => p.map((s) => (s.seatNumber === num ? { ...s, companionName: companionName || undefined } : s)));

  const changeCap = (n: number) => {
    const c = Math.max(minCap, Math.min(n, maxCap));
    setCap(c);
    onCapacityChange(c);
    setSeats(Array.from({ length: c }, (_, i) => {
      const ex = seats.find((s) => s.seatNumber === i + 1);
      return ex ?? { id: `seat-${i + 1}`, seatNumber: i + 1 };
    }));
  };

  const autoAssign = () => {
    const used = new Set(seats.map((s) => s.guestName).filter(Boolean));
    const available = confirmedGuests.filter((g) => !used.has(g.name));
    let idx = 0;
    setSeats((p) => p.map((s) => {
      if (s.guestName || idx >= available.length) return s;
      const g = available[idx++];
      return { ...s, guestName: g.name, guestId: g.id, guestPhotoURL: g.photoURL };
    }));
  };

  const r = isRound ? getTableRadius(cap) : 0;
  const previewSize = isRound ? (r + 32) * 2 : 0;
  const pc = previewSize / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Asignar invitados · {item.label}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{isRound ? 'Mesa redonda' : 'Mesa rectangular'} · {cap} asientos</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">×</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Capacity */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Capacidad:</span>
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 rounded-full border border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-center" onClick={() => changeCap(cap - 1)} disabled={cap <= minCap}>−</button>
              <span className="text-base font-bold text-gray-900 dark:text-white w-6 text-center">{cap}</span>
              <button className="w-7 h-7 rounded-full border border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-center" onClick={() => changeCap(cap + 1)} disabled={cap >= maxCap}>+</button>
              <span className="text-xs text-gray-400">({minCap}–{maxCap})</span>
            </div>
            <div className="flex gap-2 ml-auto">
              {confirmedGuests.length > 0 && <Button size="sm" variant="outline" onClick={autoAssign}>Auto-asignar</Button>}
              <Button size="sm" variant="ghost" onClick={() => setSeats((p) => p.map((s) => ({ id: s.id, seatNumber: s.seatNumber })))}>Limpiar</Button>
            </div>
          </div>

          {/* Round table preview */}
          {isRound && (
            <div className="flex justify-center py-2 overflow-visible">
              <div style={{ width: previewSize, height: previewSize, position: 'relative' }}>
                <div className="absolute rounded-full flex items-center justify-center" style={{ left: pc - r, top: pc - r, width: r * 2, height: r * 2, background: 'radial-gradient(circle at 35% 35%, #e8c77a, #b8860b)' }}>
                  <span className="text-xs font-bold text-amber-100">{item.label}</span>
                </div>
                {seats.map((s) => {
                  const angle = (2 * Math.PI * (s.seatNumber - 1)) / cap - Math.PI / 2;
                  const sx = pc + Math.cos(angle) * (r + 18) - 13;
                  const sy = pc + Math.sin(angle) * (r + 18) - 13;
                  return (
                    <div key={s.id} style={{ position: 'absolute', left: sx, top: sy, width: 26, height: 26 }}
                      title={s.guestName || `Asiento ${s.seatNumber}`}
                      className={`rounded-full flex items-center justify-center text-xs font-bold border-2 overflow-hidden ${s.guestName ? 'border-green-600' : 'bg-gray-200 dark:bg-zinc-600 border-gray-300 dark:border-zinc-500 text-gray-600 dark:text-gray-300'}`}>
                      {s.guestPhotoURL ? (
                        <img src={s.guestPhotoURL} alt={s.guestName} className="w-full h-full object-cover" />
                      ) : s.guestName ? (
                        <span className="w-full h-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                          {s.guestName[0].toUpperCase()}
                        </span>
                      ) : (
                        s.seatNumber
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seat list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {seats.map((s) => (
              <div key={s.id} className="flex flex-col gap-1 p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700/50">
                <div className="flex items-center gap-2">
                  {/* Seat avatar: photo or initials or number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 overflow-hidden ${s.guestName ? 'border-green-500' : 'bg-gray-200 dark:bg-zinc-600 border-gray-300 dark:border-zinc-500 text-gray-500 dark:text-gray-300'}`}>
                    {s.guestPhotoURL ? (
                      <img src={s.guestPhotoURL} alt={s.guestName} className="w-full h-full object-cover" />
                    ) : s.guestName ? (
                      <span className="w-full h-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                        {s.guestName[0].toUpperCase()}
                      </span>
                    ) : (
                      s.seatNumber
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre del invitado..."
                    value={s.guestName || ''}
                    onChange={(e) => updateSeat(s.seatNumber, e.target.value)}
                    list={`gl-${s.id}`}
                    className="flex-1 min-w-0 text-sm bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <datalist id={`gl-${s.id}`}>{confirmedGuests.map((g) => <option key={g.id} value={g.name} />)}</datalist>
                  {s.guestName && <button className="text-gray-400 hover:text-red-400 text-sm shrink-0" onClick={() => updateSeat(s.seatNumber, '')}>×</button>}
                </div>
                {allowCompanions && s.guestName && (
                  <div className="pl-9 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">+ Acompañante</span>
                    <input
                      type="text"
                      placeholder="Nombre del acompañante (opcional)"
                      value={s.companionName || ''}
                      onChange={(e) => updateCompanion(s.seatNumber, e.target.value)}
                      className="flex-1 min-w-0 text-xs bg-transparent border-b border-gray-300 dark:border-zinc-600 outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 py-0.5"
                    />
                    {s.companionName && (
                      <button className="text-gray-400 hover:text-red-400 text-xs shrink-0" onClick={() => updateCompanion(s.seatNumber, '')}>×</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-zinc-700">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onSave(seats); onClose(); }}>Guardar asignaciones</Button>
        </div>
      </div>
    </div>
  );
};
