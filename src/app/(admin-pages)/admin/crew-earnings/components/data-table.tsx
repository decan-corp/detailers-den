'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCrewEarningsBreakdown } from 'src/actions/crew-earnings/get-breakdown';
import { DataTablePagination } from 'src/components/table/data-table-pagination';
import { Role, managerialRole } from 'src/constants/common';
import { getEarningsStatementQuery } from 'src/queries/earnings';

import { CrewEarningsColumnType, serviceColumns } from './data-columns';
import { CrewEarningsToolbar } from './data-table-toolbar';

import { useQuery } from '@tanstack/react-query';
import {
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

export interface CrewEarningsGlobalFilter {
  crewId: string | null;
}

const emptyArray: CrewEarningsColumnType[] = [];

const CrewEarningsTable = ({ userId, role }: { userId: string | null; role: Role }) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<CrewEarningsGlobalFilter>(() => {
    if (managerialRole.includes(role)) {
      return { crewId: null };
    }
    return { crewId: userId };
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: 'createdAt',
      value: {
        from: dayjs().startOf('week').toISOString(),
        to: dayjs().endOf('week').toISOString(),
      },
    },
  ]);

  const filters = useMemo(
    () =>
      columnFilters.reduce(
        (acc, filter) => ({ ...acc, [filter.id]: filter.value }),
        globalFilter as Pick<Parameters<typeof getCrewEarningsBreakdown>[0], 'createdAt' | 'crewId'>
      ),
    [columnFilters, globalFilter]
  );

  const { data: crewEarnings, isLoading: isLoadingRecords } = useQuery(
    getEarningsStatementQuery(filters)
  );

  const table = useReactTable({
    data: crewEarnings || emptyArray,
    columns: serviceColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    manualFiltering: true,
    state: {
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      globalFilter,
    },
  });

  const isLoading = isLoadingRecords;

  return (
    <div className="space-y-4">
      <CrewEarningsToolbar table={table} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array(table.getState().pagination.pageSize)
                .fill(null)
                .map((_, index) => (
                  <TableRow key={Symbol(index).toString()}>
                    {serviceColumns.map((_column, columnIndex) => (
                      <TableCell
                        key={Symbol(columnIndex).toString()}
                        colSpan={1}
                        className="h-10 text-center"
                      >
                        <Skeleton className="h-4 w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            {!isLoading &&
              table.getRowModel().rows?.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading &&
              table.getRowModel().rows?.length === 0 &&
              (columnFilters.length === 0 || !globalFilter.crewId ? (
                <TableRow>
                  <TableCell
                    colSpan={serviceColumns.length}
                    className="h-24 text-center font-semibold"
                  >
                    Select crew and date range first.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={serviceColumns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
};

export default CrewEarningsTable;
