import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { PartyAssistanceGift } from '../types/party';

interface AssistancesTableProps {
  data: PartyAssistanceGift[];
  isLoading?: boolean;
}

export const AssistancesTable: React.FC<AssistancesTableProps> = ({ data, isLoading = false }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }, // Ordenar por fecha descendente por defecto
  ]);
  const [filtering, setFiltering] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const columnHelper = createColumnHelper<PartyAssistanceGift>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('guest_user_id', {
        header: 'Invitado',
        cell: (info) => (
          <div className="truncate">
            <p className="font-medium text-text">{info.getValue()}</p>
          </div>
        ),
      }),
      columnHelper.accessor('selectedGiftNameSnapshot', {
        header: 'Regalo Seleccionado',
        cell: (info) => (
          <div className="max-w-xs">
            <p className="text-sm text-text truncate">{info.getValue()}</p>
          </div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Fecha de Confirmación',
        cell: (info) => (
          <p className="text-sm text-text-muted">
            {info.getValue()
              ? new Date(info.getValue()!).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '-'}
          </p>
        ),
        sortingFn: 'datetime',
      }),
      columnHelper.accessor((row) => row.answersToQuestions?.length || 0, {
        id: 'answersCount',
        header: 'Preguntas Respondidas',
        cell: (info) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filtering,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
    onPaginationChange: setPagination,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-background rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">No hay asistencias registradas aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro de búsqueda */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por invitado o regalo..."
          value={filtering}
          onChange={(e) => setFiltering(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold text-text cursor-pointer hover:bg-background/80 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-xs">
                          {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border hover:bg-background/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Información y paginación */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-text-muted">
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          de {table.getFilteredRowModel().rows.length} resultados
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Anterior
          </Button>

          <div className="flex items-center gap-2">
            <select
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => table.setPageIndex(parseInt(e.target.value) - 1)}
              className="px-2 py-1 text-sm border border-border rounded bg-white"
            >
              {[...Array(table.getPageCount())].map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="text-sm text-text-muted">de {table.getPageCount()}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente →
          </Button>
        </div>
      </div>
    </div>
  );
};
