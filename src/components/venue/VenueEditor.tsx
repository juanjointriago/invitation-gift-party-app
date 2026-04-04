import React, { useEffect, useState, useCallback } from 'react';
import { useVenueStore } from '../../stores/venue.store';
import { VenueItemPalette } from './VenueItemPalette';
import { VenueCanvas } from './VenueCanvas';
import { SeatAssignmentModal } from './SeatAssignmentModal';
import { Button } from '../ui/button';
import { VenueService } from '../../services/venue.service';
import type { VenueItem, PaletteItem } from '../../types/venue.types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../types/venue.types';
import { toast } from 'sonner';
import { Save, Eye, EyeOff, Trash2, RotateCw, ChevronLeft, Printer } from 'lucide-react';

interface Props {
  partyUuid: string;
  partyTitle: string;
  confirmedGuests: Array<{ id: string; name: string; photoURL?: string }>;
  onBack: () => void;
}

export const VenueEditor: React.FC<Props> = ({ partyUuid, partyTitle, confirmedGuests, onBack }) => {
  const {
    layout, selectedItemId, loading, saving,
    loadLayout, saveLayout, addItem, updateItem, removeItem,
    moveItem, rotateItem, updateSeats, setCapacity, selectItem, publishLayout, clearLayout,
  } = useVenueStore();

  const [assigningItem, setAssigningItem] = useState<VenueItem | null>(null);

  useEffect(() => {
    loadLayout(partyUuid);
    return () => { clearLayout(); };
  }, [partyUuid, loadLayout, clearLayout]);

  const handleAddItem = useCallback((p: PaletteItem) => {
    if (!layout) return;
    const isTable = p.type === 'table-round' || p.type === 'table-rect';
    const tableCount = isTable ? layout.items.filter((i) => i.type === 'table-round' || i.type === 'table-rect').length + 1 : 0;
    const label = isTable ? `Mesa ${tableCount}` : p.label;
    const item = VenueService.createItem(p.type, Math.round((CANVAS_WIDTH / 2 - p.defaultWidth / 2) / 10) * 10, Math.round((CANVAS_HEIGHT / 2 - p.defaultHeight / 2) / 10) * 10, { label, width: p.defaultWidth, height: p.defaultHeight, capacity: p.defaultCapacity });
    addItem(item);
    selectItem(item.id);
  }, [layout, addItem, selectItem]);

  const handleSave = async () => {
    try {
      await saveLayout();
      toast.success('Plano guardado');
    } catch {
      toast.error('Error al guardar el plano. Intenta de nuevo.');
    }
  };

  const handlePrintList = () => {
    if (!layout) return;
    const tables = layout.items.filter((i) => i.type === 'table-round' || i.type === 'table-rect');
    const allAssignments: Array<{ guestName: string; tableLabel: string; seatNumber: number }> = [];
    tables.forEach((table) => {
      (table.seats || []).forEach((seat) => {
        if (seat.guestName) {
          allAssignments.push({ guestName: seat.guestName, tableLabel: table.label, seatNumber: seat.seatNumber });
        }
      });
    });

    const rows = allAssignments.length > 0
      ? allAssignments.map((a) => `<tr><td style="padding:8px 16px;border-bottom:1px solid #e5e7eb;font-weight:600">${a.guestName}</td><td style="padding:8px 16px;border-bottom:1px solid #e5e7eb">${a.tableLabel}</td><td style="padding:8px 16px;border-bottom:1px solid #e5e7eb;text-align:center">Silla ${a.seatNumber}</td></tr>`).join('')
      : '<tr><td colspan="3" style="padding:16px;text-align:center;color:#6b7280">No hay invitados asignados aún</td></tr>';

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Distribución de mesas - ${partyTitle}</title>
      <style>body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#111}h1{font-size:22px;margin-bottom:4px}p{color:#6b7280;margin-bottom:20px}table{width:100%;border-collapse:collapse}thead{background:#f3f4f6}th{padding:10px 16px;text-align:left;font-size:13px;color:#374151;text-transform:uppercase;letter-spacing:.05em}@media print{button{display:none}}</style>
      </head><body>
      <h1>Distribución de mesas</h1><p>${partyTitle} · ${allAssignments.length} invitados asignados</p>
      <button onclick="window.print()" style="margin-bottom:16px;padding:8px 16px;background:#7c3aed;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimir</button>
      <table><thead><tr><th>Invitado</th><th>Mesa</th><th>Lugar</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    win.document.close();
  };

  const handlePublish = async () => {
    if (!layout) return;
    await publishLayout(partyUuid, !layout.isPublished);
    toast.success(layout.isPublished ? 'Plano ocultado' : 'Plano publicado para invitados');
  };

  const selectedItem = layout?.items.find((i) => i.id === selectedItemId);
  const isTable = selectedItem?.type === 'table-round' || selectedItem?.type === 'table-rect';

  const openSeatsModal = (item: VenueItem) => setAssigningItem(item);

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-zinc-900" style={{ height: '100vh' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex-wrap shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <ChevronLeft className="w-4 h-4" />Volver
        </button>
        <div className="h-5 w-px bg-gray-200 dark:bg-zinc-700" />
        <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs">Plano · {partyTitle}</h1>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {selectedItemId && (
            <>
              <Button size="sm" variant="ghost" onClick={() => rotateItem(selectedItemId)} title="Rotar 45°"><RotateCw className="w-4 h-4" /></Button>
              <Button size="sm" variant="danger" onClick={() => removeItem(selectedItemId)}><Trash2 className="w-4 h-4" /></Button>
              <div className="h-5 w-px bg-gray-200 dark:bg-zinc-700" />
            </>
          )}
          <Button size="sm" variant="outline" onClick={handlePrintList} title="Imprimir listado completo" leftIcon={<Printer className="w-4 h-4" />}>
            Listado
          </Button>
          <Button size="sm" variant="outline" onClick={handlePublish} isLoading={loading} leftIcon={layout?.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}>
            {layout?.isPublished ? 'Ocultar' : 'Publicar'}
          </Button>
          <Button size="sm" onClick={handleSave} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>Guardar</Button>
        </div>
      </div>

      {/* Selected item bar */}
      {selectedItem && (
        <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 flex-wrap text-sm shrink-0">
          <span className="text-purple-600 dark:text-purple-400 font-medium capitalize">{selectedItem.type.replace('-', ' ')}</span>
          <div className="flex items-center gap-2">
            <label className="text-gray-600 dark:text-gray-400">Etiqueta:</label>
            <input type="text" value={selectedItem.label} onChange={(e) => updateItem(selectedItemId!, { label: e.target.value })}
              className="border border-gray-300 dark:border-zinc-600 rounded px-2 py-0.5 text-sm bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 w-28" />
          </div>
          {isTable && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-gray-600 dark:text-gray-400">Asientos:</label>
                <input type="number" min={4} max={selectedItem.type === 'table-round' ? 12 : 20} value={selectedItem.capacity || 8}
                  onChange={(e) => setCapacity(selectedItemId!, parseInt(e.target.value))}
                  className="border border-gray-300 dark:border-zinc-600 rounded px-2 py-0.5 text-sm bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 w-14" />
              </div>
              <Button size="sm" variant="outline" onClick={() => openSeatsModal(selectedItem)}>Asignar invitados</Button>
            </>
          )}
          {selectedItem.type === 'table-rect' && (
            <>
              <div className="flex items-center gap-1">
                <label className="text-gray-600 dark:text-gray-400 text-xs">W:</label>
                <input type="number" min={80} max={600} step={10} value={selectedItem.width}
                  onChange={(e) => updateItem(selectedItemId!, { width: Math.round(parseInt(e.target.value) / 10) * 10 })}
                  className="border border-gray-300 dark:border-zinc-600 rounded px-2 py-0.5 text-sm bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-gray-600 dark:text-gray-400 text-xs">H:</label>
                <input type="number" min={60} max={400} step={10} value={selectedItem.height}
                  onChange={(e) => updateItem(selectedItemId!, { height: Math.round(parseInt(e.target.value) / 10) * 10 })}
                  className="border border-gray-300 dark:border-zinc-600 rounded px-2 py-0.5 text-sm bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 w-16" />
              </div>
            </>
          )}
          {!isTable && (
            <>
              <div className="flex items-center gap-1">
                <label className="text-gray-600 dark:text-gray-400 text-xs">W:</label>
                <input type="number" min={30} max={600} step={10} value={selectedItem.width}
                  onChange={(e) => updateItem(selectedItemId!, { width: Math.round(parseInt(e.target.value) / 10) * 10 })}
                  className="border border-gray-300 dark:border-zinc-600 rounded px-2 py-0.5 text-sm bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-gray-600 dark:text-gray-400 text-xs">H:</label>
                <input type="number" min={30} max={400} step={10} value={selectedItem.height}
                  onChange={(e) => updateItem(selectedItemId!, { height: Math.round(parseInt(e.target.value) / 10) * 10 })}
                  className="border border-gray-300 dark:border-zinc-600 rounded px-2 py-0.5 text-sm bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 w-16" />
              </div>
            </>
          )}
          <span className="text-gray-400 dark:text-gray-500 ml-auto">Rot: {selectedItem.rotation}°</span>
        </div>
      )}

      {/* Canvas area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <VenueItemPalette onAddItem={handleAddItem} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" /><p className="text-gray-500 dark:text-gray-400">Cargando...</p></div>
          </div>
        ) : layout ? (
          <VenueCanvas layout={layout} selectedItemId={selectedItemId} isEditing onMoveItem={moveItem} onSelectItem={selectItem} onSeatsClick={openSeatsModal} />
        ) : null}
      </div>

      {/* Seat modal — re-read item from store to get latest state */}
      {assigningItem && layout && (() => {
        const liveItem = layout.items.find((i) => i.id === assigningItem.id) || assigningItem;
        return (
          <SeatAssignmentModal
            item={liveItem}
            confirmedGuests={confirmedGuests}
            onSave={(seats) => updateSeats(liveItem.id, seats)}
            onCapacityChange={(c) => setCapacity(liveItem.id, c)}
            onClose={() => setAssigningItem(null)}
          />
        );
      })()}
    </div>
  );
};
