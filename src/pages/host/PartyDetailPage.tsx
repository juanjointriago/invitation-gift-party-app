import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PartyShareButton } from '../../components/PartyShareButton';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import type { PartyAssistanceGift } from '../../types/party';
import { motion } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import {
  Users,
  Gift,
  Calendar,
  TrendingUp,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';

export const PartyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const { fullParty, error: partyError } = usePartyLoader(p_uuid);
  const [assistances, setAssistances] = useState<PartyAssistanceGift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (!p_uuid || !fullParty) return;

    const loadAssistances = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await PartyAssistanceService.getAssistancesByParty(p_uuid);
        setAssistances(data);
      } catch (err) {
        setError('Error cargando asistencias. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadAssistances();
  }, [p_uuid, fullParty]);

  // Calculate gift popularity
  const giftCounts: Record<string, number> = {};
  assistances.forEach((a) => {
    giftCounts[a.selectedGiftId] = (giftCounts[a.selectedGiftId] || 0) + 1;
  });

  const topGifts = Object.entries(giftCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);

  const maxGiftCount = topGifts.length > 0 ? topGifts[0][1] : 0;

  // Calculate questions stats
  const totalAnswered = assistances.reduce((sum, a) => sum + (a.answersToQuestions?.length || 0), 0);
  const totalQuestions = (fullParty?.questions?.length || 0) * assistances.length;
  const answerRate = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  // Filter assistances by search
  const filteredAssistances = useMemo(() => {
    if (!searchTerm) return assistances;
    const term = searchTerm.toLowerCase();
    return assistances.filter(
      (a) =>
        a.guest_user_id?.toLowerCase().includes(term) ||
        a.selectedGiftNameSnapshot?.toLowerCase().includes(term)
    );
  }, [assistances, searchTerm]);

  // Table columns
  const columns = useMemo<ColumnDef<PartyAssistanceGift>[]>(
    () => [
      {
        accessorKey: 'guest_user_id',
        header: 'Invitado',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium text-text">{info.getValue() as string}</span>
            <span className="text-xs text-text-muted">ID: {info.getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'selectedGiftNameSnapshot',
        header: 'Regalo seleccionado',
        cell: (info) => (
          <span className="text-text">{info.getValue() as string || 'Sin especificar'}</span>
        ),
      },
      {
        accessorKey: 'answersToQuestions',
        header: 'Preguntas respondidas',
        cell: (info) => {
          const answers = info.getValue() as any[] || [];
          const count = answers.length;
          const total = fullParty?.questions?.length || 0;
          return (
            <span className="text-text">
              {count} / {total}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Fecha de confirmación',
        cell: (info) => {
          const timestamp = info.getValue() as number;
          if (timestamp) {
            return new Date(timestamp).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          }
          return '-';
        },
      },
    ],
    [fullParty]
  );

  const table = useReactTable({
    data: filteredAssistances,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  // CSV Export
  const handleExportCSV = () => {
    if (assistances.length === 0) return;

    const headers = ['ID Invitado', 'Regalo', 'Preguntas Respondidas', 'Fecha Confirmación'];
    const rows = assistances.map((a) => {
      const date = a.createdAt
        ? new Date(a.createdAt).toLocaleDateString('es-ES')
        : '-';
      return [
        a.guest_user_id || '',
        a.selectedGiftNameSnapshot || '',
        `${a.answersToQuestions?.length || 0} / ${fullParty?.questions?.length || 0}`,
        date,
      ];
    });

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `asistencias_${fullParty?.title || 'fiesta'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">{fullParty?.title || 'Fiesta'}</h1>
          <p className="text-text-muted mt-2">
            {assistances.length} confirmadas · {fullParty?.giftList?.length || 0} regalos
          </p>
        </div>
        <div className="flex gap-3">
          <PartyShareButton partyUuid={p_uuid} partyTitle={fullParty?.title} />
          {fullParty?.questions && fullParty.questions.length > 0 && (
            <Button variant="outline" onClick={() => navigate(`/host/party/${p_uuid}/responses?p_uuid=${p_uuid}`)}>
              📊 Ver Respuestas
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/host/party/${p_uuid}/editor?p_uuid=${p_uuid}`)}>
            Editar fiesta
          </Button>
          <Button onClick={() => navigate('/host')}>Volver</Button>
        </div>
      </motion.div>

      {partyError && <div className="bg-error/10 border border-error text-error p-4 rounded-md">{partyError}</div>}
      {error && <div className="bg-error/10 border border-error text-error p-4 rounded-md">{error}</div>}

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-text-muted">Total Asistencias</h3>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-bold text-primary">{assistances.length}</div>
            <p className="text-xs text-text-muted mt-2">invitados confirmados</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-text-muted">Regalos Seleccionados</h3>
            <Gift className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-bold text-primary">{Object.keys(giftCounts).length}</div>
            <p className="text-xs text-text-muted mt-2">
              de {fullParty?.giftList?.length || 0} disponibles
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-text-muted">% Preguntas Respondidas</h3>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-bold text-primary">{answerRate}%</div>
            <p className="text-xs text-text-muted mt-2">
              {totalAnswered} de {totalQuestions} respuestas
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-text-muted">Fecha Evento</h3>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardBody>
            <div className="text-lg font-bold text-text">
              {fullParty?.date
                ? new Date(fullParty.date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Sin fecha'}
            </div>
            <p className="text-xs text-text-muted mt-2">{fullParty?.location || 'Sin ubicación'}</p>
          </CardBody>
        </Card>
      </div>

      {/* Gift Popularity Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-text">Regalos Más Populares</h2>
          <p className="text-sm text-text-muted">Top 5 regalos más seleccionados</p>
        </CardHeader>
        <CardBody>
          {topGifts.length > 0 ? (
            <div className="space-y-4">
              {topGifts.map(([giftId, count], index) => {
                const gift = fullParty?.giftList?.find((g) => g.id === giftId);
                const percentage = maxGiftCount > 0 ? (count / maxGiftCount) * 100 : 0;
                const colors = [
                  'bg-gradient-to-r from-primary to-primary/70',
                  'bg-gradient-to-r from-primary/90 to-primary/60',
                  'bg-gradient-to-r from-primary/80 to-primary/50',
                  'bg-gradient-to-r from-primary/70 to-primary/40',
                  'bg-gradient-to-r from-primary/60 to-primary/30',
                ];
                return (
                  <div key={giftId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-text truncate flex-1 mr-4">
                        {index + 1}. {gift?.name || giftId}
                      </span>
                      <span className="text-primary font-semibold">{count} selecciones</span>
                    </div>
                    <div className="w-full bg-surface-light rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className={`h-full rounded-full ${colors[index]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-muted text-center py-8">No hay regalos seleccionados aún</p>
          )}
        </CardBody>
      </Card>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text">Lista de Asistentes</h2>
              <p className="text-sm text-text-muted mt-1">{filteredAssistances.length} invitados confirmados</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type="text"
                  placeholder="Buscar invitado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={assistances.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredAssistances.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">
                {searchTerm ? 'No se encontraron invitados con ese criterio' : 'Aún no hay asistencias confirmadas'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-light border-b border-border">
                    <tr>
                      {table.getHeaderGroups().map((headerGroup) =>
                        headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-3 text-left text-sm font-semibold text-text cursor-pointer hover:bg-surface-dark/10 transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className="flex items-center gap-2">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && (
                                <span className="text-text-muted">
                                  {header.column.getIsSorted() === 'asc' ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : header.column.getIsSorted() === 'desc' ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronsUpDown className="h-4 w-4" />
                                  )}
                                </span>
                              )}
                            </div>
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-light/50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3 text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="text-sm text-text-muted">
                  Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    filteredAssistances.length
                  )}{' '}
                  de {filteredAssistances.length} asistencias
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-text">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
