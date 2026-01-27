import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import { useUsersStore } from '../../stores/users.store';
import type { PartyAssistanceGift, Question } from '../../types/party';
import type { IUser } from '../../interfaces/users.interface';
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
  BarChart3,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  File,
  ChevronRight,
  X,
} from 'lucide-react';

export const PartyResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const { fullParty } = usePartyLoader(p_uuid);
  const [assistances, setAssistances] = useState<PartyAssistanceGift[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, IUser>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGift, setSelectedGift] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<SortingState>([]);
  const { getUsersByIds } = useUsersStore();

  useEffect(() => {
    if (!p_uuid) return;

    const loadAssistances = async () => {
      setLoading(true);
      try {
        const data = await PartyAssistanceService.getAssistancesByParty(p_uuid);
        setAssistances(data);
        
        // Cargar información de usuarios desde el store
        const userIds = [...new Set(data.map(a => a.guest_user_id))];
        if (userIds.length > 0) {
          const users = await getUsersByIds(userIds);
          setUsersMap(users);
        }
      } catch (error) {
        console.error('Error loading assistances:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssistances();
  }, [p_uuid, getUsersByIds]);

  const getResponsesForQuestion = (question: Question) => {
    const responses: Record<string, number> = {};
    let totalResponses = 0;

    assistances.forEach((a) => {
      if (a.answersToQuestions) {
        const answer = a.answersToQuestions.find((ans: any) => ans.questionId === question.id);
        if (answer) {
          totalResponses++;
          if (Array.isArray(answer.answer)) {
            answer.answer.forEach((opt: string) => {
              responses[opt] = (responses[opt] || 0) + 1;
            });
          } else {
            const key = answer.answer || 'Sin respuesta';
            responses[key] = (responses[key] || 0) + 1;
          }
        }
      }
    });

    return { responses, totalResponses };
  };

  // Filter assistances
  const filteredAssistances = useMemo(() => {
    let filtered = [...assistances];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((a) => {
        const user = usersMap.get(a.guest_user_id);
        return (
          a.guest_user_id?.toLowerCase().includes(term) ||
          a.selectedGiftNameSnapshot?.toLowerCase().includes(term) ||
          user?.name?.toLowerCase().includes(term) ||
          user?.lastName?.toLowerCase().includes(term) ||
          user?.email?.toLowerCase().includes(term)
        );
      });
    }

    // Gift filter
    if (selectedGift !== 'all') {
      filtered = filtered.filter((a) => a.selectedGiftNameSnapshot === selectedGift);
    }

    // Question answered filter
    if (selectedQuestion !== 'all') {
      const questionId = selectedQuestion;
      filtered = filtered.filter((a) => {
        if (!a.answersToQuestions) return false;
        return a.answersToQuestions.some((ans: any) => ans.questionId === questionId);
      });
    }

    return filtered;
  }, [assistances, searchTerm, selectedGift, selectedQuestion]);

  // Get unique gifts
  const uniqueGifts = useMemo(
    () => Array.from(new Set(assistances.map((a) => a.selectedGiftNameSnapshot).filter(Boolean))),
    [assistances]
  );

  // Table columns
  const columns = useMemo<ColumnDef<PartyAssistanceGift>[]>(
    () => [
      {
        id: 'expander',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={() => {
              const newExpandedRows = new Set(expandedRows);
              if (newExpandedRows.has(row.id)) {
                newExpandedRows.delete(row.id);
              } else {
                newExpandedRows.add(row.id);
              }
              setExpandedRows(newExpandedRows);
            }}
            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-surface-light transition-colors"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${expandedRows.has(row.id) ? 'rotate-90' : ''}`}
            />
          </button>
        ),
      },
      {
        accessorKey: 'guest_user_id',
        header: 'Invitado',
        cell: (info) => {
          const userId = info.getValue() as string;
          const user = usersMap.get(userId);
          return user ? (
            <div>
              <p className="font-medium text-gray-900 dark:text-zinc-100">
                {user.name} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {user.phone || user.email}
              </p>
            </div>
          ) : (
            <span className="font-medium text-gray-500 dark:text-zinc-400 text-xs">{userId}</span>
          );
        },
      },
      {
        accessorKey: 'selectedGiftNameSnapshot',
        header: 'Regalo Seleccionado',
        cell: (info) => (
          <span className="text-text">{(info.getValue() as string) || 'Sin especificar'}</span>
        ),
      },
      {
        accessorKey: 'answersToQuestions',
        header: 'Preguntas Respondidas',
        cell: (info) => {
          const answers = (info.getValue() as any[]) || [];
          const total = fullParty?.questions?.length || 0;
          return (
            <span className="text-text">
              {answers.length} / {total}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const row_data = row.original;
              handleExportIndividualCSV(row_data);
            }}
            className="gap-1"
          >
            <Download className="h-3 w-3" />
            Exportar
          </Button>
        ),
      },
    ],
    [expandedRows, fullParty?.questions?.length]
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

  // Export individual CSV
  const handleExportIndividualCSV = (assistance: PartyAssistanceGift) => {
    if (!fullParty) return;

    const user = usersMap.get(assistance.guest_user_id);
    const userName = user ? `${user.name} ${user.lastName}` : assistance.guest_user_id;
    const userEmail = user?.email || '';

    const headers = ['Pregunta', 'Respuesta'];
    const rows: string[][] = [];

    fullParty.questions?.forEach((q) => {
      const answer = assistance.answersToQuestions?.find((ans: any) => ans.questionId === q.id);
      const answerText = answer
        ? Array.isArray(answer.answer)
          ? answer.answer.join(', ')
          : answer.answer || 'Sin respuesta'
        : 'Sin respuesta';

      rows.push([q.question, answerText]);
    });

    const csvContent = [
      ['Respuestas de:', userName],
      ['Email:', userEmail],
      ['Regalo seleccionado:', assistance.selectedGiftNameSnapshot],
      ['Fecha confirmación:', new Date(assistance.createdAt || 0).toLocaleDateString('es-ES')],
      [],
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ]
      .map((row) => (Array.isArray(row) ? row.join(',') : row))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileName = user ? `respuestas_${user.name}_${user.lastName}` : `respuestas_${assistance.guest_user_id}`;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportCSV = () => {
    if (!fullParty) return;

    // Preparar headers
    const headers = ['Nombre', 'Email', 'Regalo Seleccionado', 'Fecha', ...(fullParty.questions?.map((q) => q.question) || [])];

    // Preparar rows
    const rows = filteredAssistances.map((a) => {
      const user = usersMap.get(a.guest_user_id);
      const rowData: string[] = [
        user ? `${user.name} ${user.lastName}` : a.guest_user_id,
        user?.email || '',
        a.selectedGiftNameSnapshot,
        new Date(a.createdAt || 0).toLocaleDateString('es-ES'),
      ];

      fullParty.questions?.forEach((q) => {
        const answer = a.answersToQuestions?.find((ans: any) => ans.questionId === q.id);
        if (answer) {
          if (Array.isArray(answer.answer)) {
            rowData.push(answer.answer.join(', '));
          } else {
            rowData.push(answer.answer);
          }
        } else {
          rowData.push('');
        }
      });

      return rowData;
    });

    // Crear CSV
    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fullParty.title}_respuestas_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-3xl font-bold text-text">Respuestas de Invitados</h1>
          <p className="text-text-muted mt-2">{fullParty?.title || 'Fiesta'} · {filteredAssistances.length} respuestas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2" disabled={filteredAssistances.length === 0}>
            <Download size={18} />
            Exportar Todo
          </Button>
          <Button onClick={() => navigate(`/host/party/${p_uuid}?p_uuid=${p_uuid}`)}>Volver</Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !fullParty?.questions || fullParty.questions.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-text-muted">Esta fiesta no tiene preguntas configuradas</p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Filtros</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Buscar invitado</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      type="text"
                      placeholder="ID o regalo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Por regalo</label>
                  <select
                    value={selectedGift}
                    onChange={(e) => setSelectedGift(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Todos los regalos ({assistances.length})</option>
                    {uniqueGifts.map((gift) => {
                      const count = assistances.filter((a) => a.selectedGiftNameSnapshot === gift).length;
                      return (
                        <option key={gift} value={gift}>
                          {gift} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Por pregunta respondida</label>
                  <select
                    value={selectedQuestion}
                    onChange={(e) => setSelectedQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Todas las preguntas</option>
                    {fullParty?.questions?.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.question.substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(searchTerm || selectedGift !== 'all' || selectedQuestion !== 'all') && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-text-muted">Filtros activos</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedGift('all');
                      setSelectedQuestion('all');
                    }}
                    className="gap-1"
                  >
                    <X className="h-3 w-3" />
                    Limpiar
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Responses Table */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Tabla de Respuestas</h2>
              <p className="text-sm text-text-muted mt-1">
                Mostrando {filteredAssistances.length} de {assistances.length} respuestas
              </p>
            </CardHeader>
            <CardBody>
              {filteredAssistances.length === 0 ? (
                <div className="text-center py-12">
                  <File className="h-12 w-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted">No hay respuestas que coincidan con los filtros</p>
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
                          <React.Fragment key={row.id}>
                            <tr className="hover:bg-surface-light/50 transition-colors">
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-4 py-3 text-sm">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                            {expandedRows.has(row.id) && (
                              <tr className="bg-surface-light/30 border-l-4 border-primary">
                                <td colSpan={row.getVisibleCells().length} className="px-4 py-4">
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3"
                                  >
                                    <h4 className="font-semibold text-text mb-3">Respuestas Detalladas</h4>
                                    {fullParty?.questions?.map((q) => {
                                      const answer = row.original.answersToQuestions?.find(
                                        (ans: any) => ans.questionId === q.id
                                      );
                                      return (
                                        <div key={q.id} className="space-y-1 pb-3 border-b border-border last:border-b-0">
                                          <p className="text-sm font-medium text-text">{q.question}</p>
                                          <p className="text-sm text-text-muted">
                                            {answer ? (
                                              Array.isArray(answer.answer) ? (
                                                <span className="bg-primary/10 text-primary px-2 py-1 rounded inline-block">
                                                  {answer.answer.join(', ')}
                                                </span>
                                              ) : (
                                                <span className="text-text italic">"{answer.answer}"</span>
                                              )
                                            ) : (
                                              <span className="text-error">Sin respuesta</span>
                                            )}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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
                      de {filteredAssistances.length} respuestas
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Question Stats */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-text">Análisis de Preguntas</h2>
            <div className="grid grid-cols-1 gap-6">
              {fullParty.questions.map((question) => {
                const { responses, totalResponses } = getResponsesForQuestion(question);
                const responseArray = Object.entries(responses).sort(([, a], [, b]) => b - a);

                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-text">{question.question}</h3>
                            <p className="text-sm text-text-muted mt-1">
                              Tipo:{' '}
                              <span className="font-medium">
                                {question.type === 'text'
                                  ? 'Texto libre'
                                  : question.type === 'single-choice'
                                    ? 'Opción única'
                                    : 'Múltiple opción'}
                              </span>
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                            <BarChart3 size={16} />
                            {totalResponses}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        {question.type === 'text' ? (
                          <div className="space-y-3">
                            <p className="text-sm text-text-muted mb-4">
                              {totalResponses} respuesta{totalResponses !== 1 ? 's' : ''} recibida
                              {totalResponses !== 1 ? 's' : ''}
                            </p>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {responseArray.map(([response, count]) => (
                                <div key={response} className="p-3 bg-background rounded-lg border border-border">
                                  <p className="text-sm text-text italic">"{response}"</p>
                                  <p className="text-xs text-text-muted mt-1">
                                    {count} persona{count !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {responseArray.length > 0 ? (
                              responseArray.map(([option, count]) => {
                                const percentage = totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : 0;
                                return (
                                  <div key={option}>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="font-medium text-text">{option}</p>
                                      <span className="text-sm font-bold text-primary">
                                        {count} ({percentage}%)
                                      </span>
                                    </div>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: '100%' }}
                                      transition={{ duration: 0.5 }}
                                      className="w-full bg-surface-light rounded-full h-2.5 overflow-hidden"
                                    >
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full"
                                      />
                                    </motion.div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-text-muted text-sm">Sin respuestas aún</p>
                            )}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
