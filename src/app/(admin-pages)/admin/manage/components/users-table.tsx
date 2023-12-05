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
import { DataTablePagination } from 'src/components/table/data-table-pagination';
import { Entity } from 'src/constants/entities';
import { Role } from 'src/constants/roles';
import { UserSelect } from 'src/types/schema';

import { userColumns } from './data-columns';
import { DataTableToolbar } from './data-table-toolbar';

import { getUsers, getUsersCount } from '../actions';

import { useQuery } from '@tanstack/react-query';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';

const defaultUserData: UserSelect[] = [];

const UsersTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageSize: 10, pageIndex: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useDebounce(
    () => {
      const search = columnFilters.find((filter) => filter.id === 'email')?.value as
        | string
        | undefined;
      setDebouncedSearch(search || '');
    },
    250,
    [columnFilters]
  );

  const roleFilter = useMemo(
    () => columnFilters.find((filter) => filter.id === 'role')?.value as Role[] | undefined,
    [columnFilters]
  );

  const { data: users, isLoading } = useQuery({
    queryKey: [Entity.Users, roleFilter, debouncedSearch],
    queryFn: async () => {
      const { data = [] } = await getUsers({
        ...(roleFilter && { role: roleFilter }),
        ...(debouncedSearch && { name: debouncedSearch }),
        ...(debouncedSearch && { email: debouncedSearch }),
      });
      return data;
    },
  });

  const { data: count = 0 } = useQuery({
    queryKey: [Entity.Users, 'count', roleFilter, debouncedSearch],
    queryFn: async () => {
      const { data = 0 } = await getUsersCount({
        ...(roleFilter && { role: roleFilter }),
        ...(debouncedSearch && { name: debouncedSearch }),
        ...(debouncedSearch && { email: debouncedSearch }),
      });
      return data;
    },
  });

  const table = useReactTable({
    data: users || defaultUserData,
    columns: userColumns,
    pageCount: Math.ceil(count / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(), // TODO: sort via database
    onColumnFiltersChange: setColumnFilters,
    // manualFiltering: true,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
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
                    {userColumns.map((_column, columnIndex) => (
                      <TableCell
                        key={Symbol(columnIndex).toString()}
                        colSpan={1}
                        className="h-2 text-center"
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
            {!isLoading && table.getRowModel().rows?.length === 0 && (
              <TableRow>
                <TableCell colSpan={userColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
};

export default UsersTable;
