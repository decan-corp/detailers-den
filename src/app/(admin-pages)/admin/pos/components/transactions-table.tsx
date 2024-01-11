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
import { softDeleteTransaction } from 'src/actions/transactions/delete-transaction';
import { getTransactions, getTransactionsCount } from 'src/actions/transactions/get-transactions';
import { markAsPaidTransaction } from 'src/actions/transactions/mark-as-paid';
import { ConfirmDialog } from 'src/components/auth/dialog/confirmation-dialog';
import { DataTablePagination } from 'src/components/table/data-table-pagination';
import { Entity } from 'src/constants/entities';
import { transactions } from 'src/schema';

import { transactionColumns } from './data-columns';
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
import { omit } from 'lodash';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import { toast } from 'sonner';
import { create } from 'zustand';

export const useTransactionAlertDialogStore = create<{
  isDeleteDialogOpen: boolean;
  userIdToDelete: string | null;
  isMarkAsPaidDialogOpen: boolean;
  userIdToMarkAsPaid: string | null;
}>(() => ({
  isDeleteDialogOpen: false,
  userIdToDelete: null,
  isMarkAsPaidDialogOpen: false,
  userIdToMarkAsPaid: null,
}));

const emptyArray: (typeof transactions.$inferSelect)[] = [];

const TransactionsTable = () => {
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageSize: 10, pageIndex: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { isDeleteDialogOpen, userIdToDelete, isMarkAsPaidDialogOpen, userIdToMarkAsPaid } =
    useTransactionAlertDialogStore((state) => state);

  const { mutate: mutateSoftDeleteUser, isPending: isSoftDeletingUser } = useMutation({
    mutationFn: softDeleteTransaction,
    onMutate: () => {
      useTransactionAlertDialogStore.setState({
        isDeleteDialogOpen: false,
        userIdToDelete: null,
      });
    },
    onSuccess: async (result) => {
      if (result.validationErrors) {
        toast.warning('Invalid Input', {
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
        });

        return;
      }

      if (result?.serverError) {
        toast.error('Something went wrong', {
          description: result.serverError,
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [Entity.Transactions],
      });
      await queryClient.invalidateQueries({ queryKey: [Entity.Metrics] });

      toast.success('Success soft deleting transaction.');
    },
  });

  const { mutate: mutateMarkAsPaid, isPending: isMarkingAsPaid } = useMutation({
    mutationFn: markAsPaidTransaction,
    onMutate: () => {
      useTransactionAlertDialogStore.setState({
        isMarkAsPaidDialogOpen: false,
        userIdToMarkAsPaid: null,
      });
    },
    onSuccess: async (result) => {
      if (result.validationErrors) {
        toast.warning('Invalid Input', {
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
        });
        return;
      }

      if (result?.serverError) {
        toast.error('Something went wrong', {
          description: result.serverError,
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [Entity.Transactions],
      });
      await queryClient.invalidateQueries({ queryKey: [Entity.Metrics] });

      toast.success('Success marking transaction as paid.');
    },
  });

  const filters = useMemo(
    () =>
      columnFilters
        .filter(({ id }) => id !== 'customerName') // searching with customerName is handled with debounce
        .reduce(
          (acc, filter) => ({ ...acc, [filter.id]: filter.value }),
          {} as Pick<
            Parameters<typeof getTransactions>[0],
            'createdAt' | 'modeOfPayment' | 'status' | 'vehicleSize'
          >
        ),
    [columnFilters]
  );

  useDebounce(
    () => {
      const search = columnFilters.find(({ id }) => id === 'customerName')?.value as
        | string
        | undefined;
      setDebouncedSearch(search || '');
    },
    250,
    [columnFilters]
  );

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: [
      Entity.Transactions,
      filters,
      debouncedSearch,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: async () => {
      const { createdAt } = filters;
      const { data = [] } = await getTransactions({
        ...(debouncedSearch && { customerName: debouncedSearch, plateNumber: debouncedSearch }),
        ...omit(filters, ['createdAt']),
        ...(createdAt?.from && createdAt.to && { createdAt }),
        pageSize: pagination.pageSize,
        pageIndex: pagination.pageIndex,
        sortBy: sorting,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: count = 0 } = useQuery({
    queryKey: [Entity.Transactions, 'count', filters, debouncedSearch],
    queryFn: async () => {
      const { createdAt } = filters;
      const { data = 0 } = await getTransactionsCount({
        ...(debouncedSearch && { customerName: debouncedSearch, plateNumber: debouncedSearch }),
        ...omit(filters, ['createdAt']),
        ...(createdAt?.from && createdAt.to && { createdAt }),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const table = useReactTable({
    data: transactionsData || emptyArray,
    columns: transactionColumns,
    pageCount: Math.ceil(count / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open: boolean) =>
          useTransactionAlertDialogStore.setState({ isDeleteDialogOpen: open })
        }
        hideButtonTrigger
        title="Are you sure you want to delete this transaction?"
        description={`This action will perform soft delete. Soft deletion will mark the transaction as inactive while retaining their data for potential reactivation.
This action helps maintain historical records and allows for data recovery if needed.`}
        onClickConfirm={() => mutateSoftDeleteUser(userIdToDelete as string)}
        disableConfirm={isSoftDeletingUser}
        disableCancel={isSoftDeletingUser}
      />
      <ConfirmDialog
        isOpen={isMarkAsPaidDialogOpen}
        onOpenChange={(open) =>
          useTransactionAlertDialogStore.setState({ isMarkAsPaidDialogOpen: open })
        }
        hideButtonTrigger
        title="Are you sure you want to mark this transaction as paid? "
        description="This action signifies the completion of the service, so please ensure the payment has been made."
        onClickConfirm={() => mutateMarkAsPaid(userIdToMarkAsPaid as string)}
        disableConfirm={isMarkingAsPaid}
        disableCancel={isMarkingAsPaid}
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
                    {transactionColumns.map((_column, columnIndex) => (
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
                <TableCell colSpan={transactionColumns.length} className="h-24 text-center">
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

export default TransactionsTable;
