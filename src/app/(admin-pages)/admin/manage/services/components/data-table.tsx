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
import { softDeleteService } from 'src/actions/services/delete-service';
import { getServices, getServicesCount } from 'src/actions/services/get-services';
import { ConfirmDialog } from 'src/components/dialog/confirmation-dialog';
import { DataTablePagination } from 'src/components/table/data-table-pagination';
import { Entity } from 'src/constants/entities';
import useQueryParams from 'src/hooks/use-query-params';
import useSetSearchParams from 'src/hooks/use-set-search-params';
import { services } from 'src/schema';
import { handleSafeActionError } from 'src/utils/error-handling';

import { serviceColumns } from './data-columns';
import { DataTableToolbar } from './data-table-toolbar';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import { toast } from 'sonner';
import { create } from 'zustand';

export const useServiceAlertDialogStore = create<{
  isDeleteDialogOpen: boolean;
  serviceIdToDelete: string | null;
}>(() => ({
  isDeleteDialogOpen: false,
  serviceIdToDelete: null,
}));

const emptyArray: (typeof services.$inferSelect)[] = [];

const ServicesTable = () => {
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useQueryParams<SortingState>('sorting', [
    { id: 'createdAt', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useQueryParams<ColumnFiltersState>('columnFilters', []);
  const [pagination, setPagination] = useQueryParams<PaginationState>('pagination', {
    pageSize: 10,
    pageIndex: 0,
  });
  const [globalFilter, setGlobalFilter] = useQueryParams('globalFilter', '');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isDeleteDialogOpen = useServiceAlertDialogStore((state) => state.isDeleteDialogOpen);
  const serviceIdToDelete = useServiceAlertDialogStore((state) => state.serviceIdToDelete);

  useSetSearchParams({
    sorting,
    columnFilters,
    pagination,
    globalFilter: debouncedSearch,
  });

  useDebounce(() => setDebouncedSearch(globalFilter || ''), 300, [globalFilter]);

  const { mutate: mutateSoftDeleteService } = useMutation({
    mutationFn: softDeleteService,
    onMutate: () => {
      useServiceAlertDialogStore.setState({
        isDeleteDialogOpen: false,
        serviceIdToDelete: null,
      });
    },
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [Entity.Services],
      });

      toast.success('Success soft deleting service');
    },
  });

  const { data: servicesData, isLoading } = useQuery({
    queryKey: [Entity.Services, debouncedSearch, pagination, sorting],
    queryFn: async () => {
      const { data = [] } = await getServices({
        ...(debouncedSearch && { serviceName: debouncedSearch }),
        pageSize: pagination.pageSize,
        pageIndex: pagination.pageIndex,
        sortBy: sorting,
      });
      return data;
    },
  });

  const { data: count = 0 } = useQuery({
    queryKey: [Entity.Services, 'count', debouncedSearch],
    queryFn: async () => {
      const { data = 0 } = await getServicesCount({
        ...(debouncedSearch && { serviceName: debouncedSearch }),
      });
      return data;
    },
  });

  const table = useReactTable({
    data: servicesData || emptyArray,
    columns: serviceColumns,
    pageCount: Math.ceil(count / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      pagination,
      globalFilter,
    },
  });

  const onDeleteDialogChange = (open: boolean) => {
    useServiceAlertDialogStore.setState({ isDeleteDialogOpen: open });
  };

  const serviceToDelete = useMemo(() => {
    if (!serviceIdToDelete) {
      return undefined;
    }
    return servicesData?.find((service) => service.id === serviceIdToDelete);
  }, [servicesData, serviceIdToDelete]);

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        hideButtonTrigger
        title={`Are you sure you want to delete service "${serviceToDelete?.serviceName}"?`}
        description={`This action will perform soft delete. Soft deletion will mark the service as inactive while retaining their data for potential reactivation.
This action helps maintain historical records and allows for data recovery if needed.`}
        onClickConfirm={() => mutateSoftDeleteService(serviceIdToDelete as string)}
      />
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
            {!isLoading && table.getRowModel().rows?.length === 0 && (
              <TableRow>
                <TableCell colSpan={serviceColumns.length} className="h-24 text-center">
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

export default ServicesTable;
