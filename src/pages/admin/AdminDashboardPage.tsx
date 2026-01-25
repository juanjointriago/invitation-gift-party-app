import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { PartyService } from '../../services/party.service';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import type { Party, PartyAssistanceGift } from '../../types/party';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import type { SortingState, PaginationState } from '@tanstack/react-table';
import { ArrowUpDown, Search, Calendar, Users, Gift, MessageSquare, Trash2, Archive, Eye } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [partyMetrics, setPartyMetrics] = useState<Record<string, { attendances: number; gifts: number }>>({});
  const tableRef = useRef<AdminPartiesTableHandle>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const partiesData = await PartyService.getAllParties();
        setParties(partiesData);

        // Cargar asistencias de todas las fiestas publicadas
        const allAssistances: PartyAssistanceGift[] = [];
        for (const party of partiesData.filter((p) => p.status === 'published')) {
          const partyAssistances = await PartyAssistanceService.getAssistancesByParty(party.party_uuid);
          allAssistances.push(...partyAssistances);
        }

        // Build per-party metrics
        const perParty: Record<string, { attendances: number; gifts: number }> = {};
        for (const party of partiesData) {
          const partyAssistances = allAssistances.filter((a) => a.party_uuid === party.party_uuid && a.attendanceConfirmed);
          perParty[party.party_uuid] = {
            attendances: partyAssistances.length,
            gifts: partyAssistances.reduce((sum, a) => sum + (a.quantity || 1), 0),
          };
        }
        setPartyMetrics(perParty);
      } catch (err) {
        setError('Error cargando datos. Intenta de nuevo.');
        toast.error('Error cargando datos del admin');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalGifts = parties.reduce((sum, p) => sum + (p.giftList?.length || 0), 0);
  const totalQuestions = parties.reduce((sum, p) => sum + (p.questions?.length || 0), 0);
  const totalAttendances = Object.values(partyMetrics).reduce((sum, m) => sum + m.attendances, 0);
  const totalGiftsSelected = Object.values(partyMetrics).reduce((sum, m) => sum + m.gifts, 0);

  const statusCounts = {
    published: parties.filter((p) => p.status === 'published').length,
    draft: parties.filter((p) => p.status === 'draft').length,
    archived: parties.filter((p) => p.status === 'archived').length,
  };

  const filteredParties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return parties
      .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter((p) => {
        if (!term) return true;
        return (
          p.title.toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term) ||
          (p.location || '').toLowerCase().includes(term)
        );
      });
  }, [parties, searchTerm, statusFilter]);

  const handleArchiveParty = async (partyUuid: string) => {
    if (!confirm('¿Archivar esta fiesta?')) return;
    try {
      await PartyService.archiveParty(partyUuid);
      setParties((prev) => prev.map((p) => (p.party_uuid === partyUuid ? { ...p, status: 'archived' as const } : p)));
      toast.success('Fiesta archivada');
    } catch (err) {
      toast.error('Error al archivar');
    }
  };

  const handleDeleteParty = async (partyUuid: string) => {
    if (!confirm('¿Eliminar permanentemente esta fiesta? Esta acción no se puede deshacer.')) return;
    try {
      await PartyService.deleteParty(partyUuid);
      setParties((prev) => prev.filter((p) => p.party_uuid !== partyUuid));
      toast.success('Fiesta eliminada');
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-text">Panel de administrador</h1>
        <p className="text-text-muted">Resumen general de fiestas, invitados y estadísticas.</p>
      </motion.div>

      {error && <div className="bg-error/10 border border-error text-error p-4 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-text-muted">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Estadísticas principales */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardBody className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Total fiestas</p>
                  <p className="text-2xl font-bold text-text">{parties.length}</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-success/10">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Asistencias</p>
                  <p className="text-2xl font-bold text-text">{totalAttendances}</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Regalos elegidos</p>
                  <p className="text-2xl font-bold text-text">{totalGiftsSelected}</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-warning/10">
                  <Gift className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Regalos totales</p>
                  <p className="text-2xl font-bold text-text">{totalGifts}</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-info/10">
                  <MessageSquare className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Preguntas</p>
                  <p className="text-2xl font-bold text-text">{totalQuestions}</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Estado de fiestas y top */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-text">Estado de fiestas</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-primary/5 rounded-md">
                    <p className="text-3xl font-bold text-primary">{statusCounts.published}</p>
                    <p className="text-sm text-text-muted mt-1">Publicadas</p>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-md">
                    <p className="text-3xl font-bold text-warning">{statusCounts.draft}</p>
                    <p className="text-sm text-text-muted mt-1">Borradores</p>
                  </div>
                  <div className="text-center p-4 bg-text-muted/5 rounded-md">
                    <p className="text-3xl font-bold text-text-muted">{statusCounts.archived}</p>
                    <p className="text-sm text-text-muted mt-1">Archivadas</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-text">Top 5 fiestas más populares</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {parties
                    .map((p) => ({ ...p, count: partyMetrics[p.party_uuid]?.attendances || 0 }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((p) => {
                      const maxCount = Math.max(...parties.map((party) => partyMetrics[party.party_uuid]?.attendances || 0), 1);
                      const percentage = (p.count / maxCount) * 100;
                      return (
                        <div key={p.party_uuid}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-text truncate">{p.title}</span>
                            <span className="text-text-muted">{p.count}</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-success to-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Tabla completa de fiestas */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Todas las fiestas</h2>
              <p className="text-text-muted text-sm">Gestión completa de fiestas en la plataforma</p>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título, descripción o ubicación"
                  className="md:w-1/2"
                  icon={<Search className="w-4 h-4" />}
                />
                <div className="flex gap-3">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft' | 'archived')}
                    options={[
                      { value: 'all', label: 'Todos los estados' },
                      { value: 'published', label: 'Publicadas' },
                      { value: 'draft', label: 'Borradores' },
                      { value: 'archived', label: 'Archivadas' },
                    ]}
                    className="md:w-52"
                  />
                  <Button
                    variant="outline"
                    onClick={() => tableRef.current?.exportCSV()}
                  >
                    Exportar
                  </Button>
                </div>
              </div>
              <AdminPartiesTable
                parties={filteredParties}
                pagination={pagination}
                onPaginationChange={setPagination}
                partyMetrics={partyMetrics}
                onArchive={handleArchiveParty}
                onDelete={handleDeleteParty}
                ref={tableRef}
              />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

// Admin table component
const columnHelper = createColumnHelper<Party>();

interface AdminPartiesTableProps {
  parties: Party[];
  pagination: PaginationState;
  onPaginationChange: (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  partyMetrics: Record<string, { attendances: number; gifts: number }>;
  onArchive: (uuid: string) => void;
  onDelete: (uuid: string) => void;
}

export interface AdminPartiesTableHandle {
  exportCSV: () => void;
}

const AdminPartiesTable = React.forwardRef<AdminPartiesTableHandle, AdminPartiesTableProps>(
  ({ parties, pagination, onPaginationChange, partyMetrics, onArchive, onDelete }, ref) => {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo(
      () => [
        columnHelper.accessor('title', {
          header: ({ column }) => (
            <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()}>
              <span>Título</span>
              <ArrowUpDown className="w-4 h-4 text-text-muted" />
            </button>
          ),
          cell: (info) => <span className="font-medium text-text">{info.getValue()}</span>,
        }),
        columnHelper.accessor('status', {
          header: ({ column }) => (
            <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()}>
              <span>Estado</span>
              <ArrowUpDown className="w-4 h-4 text-text-muted" />
            </button>
          ),
          cell: (info) => {
            const s = info.getValue();
            const color = s === 'published' ? 'text-success' : s === 'draft' ? 'text-warning' : 'text-text-muted';
            const label = s === 'published' ? 'Publicada' : s === 'draft' ? 'Borrador' : 'Archivada';
            return <span className={`text-sm ${color}`}>{label}</span>;
          },
        }),
        columnHelper.accessor('date', {
          header: ({ column }) => (
            <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()}>
              <span>Fecha</span>
              <ArrowUpDown className="w-4 h-4 text-text-muted" />
            </button>
          ),
          cell: (info) => new Date(info.getValue()).toLocaleDateString('es-ES'),
        }),
        columnHelper.accessor((row) => partyMetrics[row.party_uuid]?.attendances || 0, {
          id: 'attendances',
          header: ({ column }) => (
            <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()}>
              <span>Asistencias</span>
              <ArrowUpDown className="w-4 h-4 text-text-muted" />
            </button>
          ),
          cell: ({ getValue }) => <span className="text-success font-semibold">{getValue()}</span>,
        }),
        columnHelper.accessor((row) => row.giftList?.length || 0, {
          id: 'gifts',
          header: ({ column }) => (
            <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()}>
              <span>Regalos</span>
              <ArrowUpDown className="w-4 h-4 text-text-muted" />
            </button>
          ),
          cell: ({ getValue }) => <span>{getValue()}</span>,
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Acciones',
          cell: ({ row }) => (
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(`/party/${row.original.party_uuid}?p_uuid=${row.original.party_uuid}`, '_blank')}
                title="Ver fiesta"
              >
                <Eye className="w-4 h-4" />
              </Button>
              {row.original.status !== 'archived' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onArchive(row.original.party_uuid)}
                  title="Archivar"
                >
                  <Archive className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(row.original.party_uuid)}
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4 text-error" />
              </Button>
            </div>
          ),
        }),
      ],
      [onArchive, onDelete, partyMetrics]
    );

    const table = useReactTable({
      data: parties,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      state: {
        sorting,
        pagination,
      },
      onSortingChange: setSorting,
      onPaginationChange,
    });

    React.useImperativeHandle(ref, () => ({
      exportCSV: () => {
        const rows = table.getSortedRowModel().rows;
        const headers = ['Título', 'Estado', 'Fecha', 'Asistencias', 'Regalos'];
        const csv = [
          headers.join(','),
          ...rows.map((r) => {
            const p = r.original;
            const cols = [
              p.title,
              p.status === 'published' ? 'Publicada' : p.status === 'draft' ? 'Borrador' : 'Archivada',
              new Date(p.date).toLocaleDateString('es-ES'),
              String(partyMetrics[p.party_uuid]?.attendances || 0),
              String(p.giftList?.length || 0),
            ];
            return cols.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',');
          }),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'admin-fiestas.csv';
        link.click();
        URL.revokeObjectURL(url);
      },
    }));

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-left px-3 py-2 text-text-muted">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-text-muted">
                  Sin resultados para los filtros actuales.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm text-text-muted">
          <span>
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <span>
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
