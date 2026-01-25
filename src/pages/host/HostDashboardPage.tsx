import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { useAuthStore } from '../../stores/auth.store';
import { PartyService } from '../../services/party.service';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import type { Party } from '../../types/party';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import type { SortingState, PaginationState } from '@tanstack/react-table';
import { ArrowUpDown, Search, Calendar, Gift, Users, MessageSquare } from 'lucide-react';

export const HostDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minGifts, setMinGifts] = useState<number | ''>('');
  const [minQuestions, setMinQuestions] = useState<number | ''>('');
  const [useServerPagination, setUseServerPagination] = useState(false);
  const [serverPageData, setServerPageData] = useState<Party[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverLoading, setServerLoading] = useState(false);
  const tableRef = useRef<HostPartiesTableHandle>(null);
  const [metrics, setMetrics] = useState({ totalAttendances: 0, totalGiftsSelected: 0, avgQuestionsAnswered: 0 });
  const [partyMetrics, setPartyMetrics] = useState<Record<string, { attendances: number; gifts: number }>>({});

  useEffect(() => {
    if (!user?.id) return;

    const loadParties = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await PartyService.getPartiesByHost(user.id);
        setParties(data);
      } catch (err) {
        setError('Error cargando fiestas. Intenta de nuevo.');
        toast.error('Error cargando fiestas');
      } finally {
        setLoading(false);
      }
    };

    loadParties();
  }, [user?.id]);

  useEffect(() => {
    if (parties.length === 0) return;

    const loadMetrics = async () => {
      try {
        let totalAttendances = 0;
        let totalGiftsSelected = 0;
        let totalQuestions = 0;
        let totalAnswers = 0;

        for (const party of parties) {
          const assistances = await PartyAssistanceService.getAssistancesByParty(party.party_uuid);
          const confirmed = assistances.filter((a) => a.attendanceConfirmed);
          totalAttendances += confirmed.length;
          totalGiftsSelected += confirmed.reduce((sum, a) => sum + (a.quantity || 1), 0);
          totalQuestions += (party.questions?.length || 0) * confirmed.length;
          totalAnswers += confirmed.reduce((sum, a) => sum + (a.answersToQuestions?.length || 0), 0);
        }

        const avgQuestionsAnswered = totalQuestions > 0 ? Math.round((totalAnswers / totalQuestions) * 100) : 0;
        setMetrics({ totalAttendances, totalGiftsSelected, avgQuestionsAnswered });

        // Build per-party metrics
        const perParty: Record<string, { attendances: number; gifts: number }> = {};
        for (const party of parties) {
          const assistances = await PartyAssistanceService.getAssistancesByParty(party.party_uuid);
          const confirmed = assistances.filter((a) => a.attendanceConfirmed);
          perParty[party.party_uuid] = {
            attendances: confirmed.length,
            gifts: confirmed.reduce((sum, a) => sum + (a.quantity || 1), 0),
          };
        }
        setPartyMetrics(perParty);
      } catch (err) {
        console.error('Error loading metrics:', err);
      }
    };

    loadMetrics();
  }, [parties]);

  const handleCreateParty = () => {
    navigate('/host/party/new');
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
          (p.date ? new Date(p.date).toLocaleDateString('es-ES').toLowerCase().includes(term) : false)
        );
      })
      .filter((p) => {
        if (fromDate) {
          const partyDate = new Date(p.date).getTime();
          if (partyDate < new Date(fromDate).getTime()) return false;
        }
        if (toDate) {
          const partyDate = new Date(p.date).getTime();
          if (partyDate > new Date(toDate).getTime()) return false;
        }
        if (minGifts !== '' && (p.giftList?.length || 0) < minGifts) return false;
        if (minQuestions !== '' && (p.questions?.length || 0) < minQuestions) return false;
        return true;
      });
  }, [fromDate, minGifts, minQuestions, parties, searchTerm, statusFilter, toDate]);

  useEffect(() => {
    if (!useServerPagination) return;
    setServerLoading(true);
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    const timer = setTimeout(() => {
      setServerPageData(filteredParties.slice(start, end));
      setServerTotal(filteredParties.length);
      setServerLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [filteredParties, pagination.pageIndex, pagination.pageSize, useServerPagination]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-text">Mis fiestas</h1>
          <p className="text-text-muted">Crea y administra tus fiestas.</p>
        </div>
        <Button onClick={handleCreateParty}>+ Nueva fiesta</Button>
      </motion.div>

      {error && <div className="bg-error/10 border border-error text-error p-4 rounded-md">{error}</div>}

      {!loading && parties.length > 0 && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-sm text-text-muted">Asistencias confirmadas</p>
                <p className="text-2xl font-bold text-text">{metrics.totalAttendances}</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Regalos seleccionados</p>
                <p className="text-2xl font-bold text-text">{metrics.totalGiftsSelected}</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <MessageSquare className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Preguntas respondidas</p>
                <p className="text-2xl font-bold text-text">{metrics.avgQuestionsAnswered}%</p>
              </div>
            </CardBody>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-text">Asistencias por fiesta</h2>
            <p className="text-text-muted text-sm">Top 5 fiestas con más confirmaciones</p>
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
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardBody>
        </Card>
        </>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-text-muted">Cargando fiestas...</p>
        </div>
      ) : parties.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-text-muted mb-4">Aún no tienes fiestas creadas.</p>
            <Button onClick={handleCreateParty}>Crear mi primera fiesta</Button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-text">Listado de fiestas</h2>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-text-muted text-sm">Resumen de tus fiestas con acciones rápidas</p>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  id="serverPagination"
                  type="checkbox"
                  checked={useServerPagination}
                  onChange={(e) => {
                    setUseServerPagination(e.target.checked);
                    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
                  }}
                />
                <label htmlFor="serverPagination">Simular paginación servidor</label>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, descripción o fecha"
                className="md:w-1/2"
                icon={<Search className="w-4 h-4" />}
              />
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
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
                <Select
                  value={pagination.pageSize.toString()}
                  onChange={(e) => setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value), pageIndex: 0 }))}
                  options={[
                    { value: '5', label: '5 por página' },
                    { value: '10', label: '10 por página' },
                    { value: '20', label: '20 por página' },
                  ]}
                  className="md:w-40"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <Input
                type="date"
                label="Desde"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <Input
                type="date"
                label="Hasta"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              <Input
                type="number"
                label="Mínimo regalos"
                min={0}
                value={minGifts === '' ? '' : minGifts}
                onChange={(e) => setMinGifts(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <Input
                type="number"
                label="Mínimo preguntas"
                min={0}
                value={minQuestions === '' ? '' : minQuestions}
                onChange={(e) => setMinQuestions(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => {
                  const metricsData = parties.map((p) => ({
                    titulo: p.title,
                    estado: p.status,
                    fecha: new Date(p.date).toLocaleDateString('es-ES'),
                    asistencias: partyMetrics[p.party_uuid]?.attendances || 0,
                    regalos: partyMetrics[p.party_uuid]?.gifts || 0,
                  }));
                  const headers = ['Título', 'Estado', 'Fecha', 'Asistencias', 'Regalos'];
                  const csv = [
                    headers.join(','),
                    ...metricsData.map((row) =>
                      [row.titulo, row.estado, row.fecha, row.asistencias, row.regalos]
                        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                        .join(',')
                    ),
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'metricas-fiestas.csv';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Exportar métricas
              </Button>
              <Button variant="outline" onClick={() => tableRef.current?.exportCSV()}>
                Exportar tabla
              </Button>
            </div>
            {useServerPagination && serverLoading ? (
              <div className="text-center py-8 text-text-muted">Cargando más fiestas...</div>
            ) : (
              <HostPartiesTable
                parties={useServerPagination ? serverPageData : filteredParties}
                onView={(uuid) => navigate(`/host/party/${uuid}?p_uuid=${uuid}`)}
                onEdit={(uuid) => navigate(`/host/party/${uuid}/editor?p_uuid=${uuid}`)}
                pagination={pagination}
                onPaginationChange={setPagination}
                totalCount={useServerPagination ? serverTotal : filteredParties.length}
                manualPagination={useServerPagination}
                partyMetrics={partyMetrics}
                ref={tableRef}
              />
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

// Tabla de fiestas del anfitrión (TanStack)
const columnHelper = createColumnHelper<Party>();

interface HostPartiesTableProps {
  parties: Party[];
  onView: (uuid: string) => void;
  onEdit: (uuid: string) => void;
  pagination: PaginationState;
  onPaginationChange: (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  totalCount: number;
  manualPagination?: boolean;
  partyMetrics: Record<string, { attendances: number; gifts: number }>;
}

export interface HostPartiesTableHandle {
  exportCSV: () => void;
}

const HostPartiesTable = React.forwardRef<HostPartiesTableHandle, HostPartiesTableProps>(
  ({ parties, onView, onEdit, pagination, onPaginationChange, totalCount, manualPagination = false, partyMetrics }, ref) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por título">
            <span>Título</span>
            <ArrowUpDown className="w-4 h-4 text-text-muted" />
          </button>
        ),
        cell: (info) => <span className="font-medium text-text">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por estado">
            <span>Estado</span>
            <ArrowUpDown className="w-4 h-4 text-text-muted" />
          </button>
        ),
        cell: (info) => {
          const s = info.getValue();
          const color = s === 'published' ? 'text-primary' : s === 'draft' ? 'text-warning' : 'text-text-muted';
          const label = s === 'published' ? 'Publicada' : s === 'draft' ? 'Borrador' : 'Archivada';
          return <span className={`text-sm ${color}`}>{label}</span>;
        },
      }),
      columnHelper.accessor('date', {
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por fecha">
            <span>Fecha</span>
            <ArrowUpDown className="w-4 h-4 text-text-muted" />
          </button>
        ),
        cell: (info) => new Date(info.getValue()).toLocaleDateString('es-ES'),
      }),
      columnHelper.accessor((row) => row.giftList?.length || 0, {
        id: 'gifts',
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por regalos">
            <span>Regalos</span>
            <ArrowUpDown className="w-4 h-4 text-text-muted" />
          </button>
        ),
        cell: ({ getValue }) => <span>{getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.questions?.length || 0, {
        id: 'questions',
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por preguntas">
            <span>Preguntas</span>
            <ArrowUpDown className="w-4 h-4 text-text-muted" />
          </button>
        ),
        cell: ({ getValue }) => <span>{getValue()}</span>,
      }),
      columnHelper.accessor((row) => partyMetrics[row.party_uuid]?.attendances || 0, {
        id: 'attendances',
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={column.getToggleSortingHandler()} aria-label="Ordenar por asistencias">
            <span>Asistencias</span>
            <ArrowUpDown className="w-4 h-4 text-text-muted" />
          </button>
        ),
        cell: ({ getValue }) => <span className="text-success font-semibold">{getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => onView(row.original.party_uuid)}>
              Ver
            </Button>
            <Button size="sm" onClick={() => onEdit(row.original.party_uuid)}>
              Editar
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onView]
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
    manualPagination,
    pageCount: manualPagination ? Math.ceil(totalCount / pagination.pageSize) || 1 : undefined,
  });

  React.useImperativeHandle(ref, () => ({
    exportCSV: () => {
      const rows = table.getSortedRowModel().rows;
      const headers = ['Título', 'Estado', 'Fecha', 'Regalos', 'Preguntas'];
      const toLabel = (s: Party['status']) =>
        s === 'published' ? 'Publicada' : s === 'draft' ? 'Borrador' : 'Archivada';
      const csv = [
        headers.join(','),
        ...rows.map((r) => {
          const p = r.original;
          const cols = [
            p.title,
            toLabel(p.status),
            p.date ? new Date(p.date).toLocaleDateString('es-ES') : '',
            String(p.giftList?.length || 0),
            String(p.questions?.length || 0),
          ];
          return cols.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',');
        }),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fiestas.csv';
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
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + table.getRowModel().rows.length} de {totalCount}
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
});