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
import { generateResetPasswordToken } from 'src/actions/auth/reset-password';
import { softDeleteUser } from 'src/actions/users/delete-user';
import { getUsers, getUsersCount } from 'src/actions/users/get-users';
import { ConfirmDialog } from 'src/components/dialog/confirmation-dialog';
import { DataTablePagination } from 'src/components/table/data-table-pagination';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import { UserSelect } from 'src/types/schema';
import { handleSafeActionError } from 'src/utils/error-handling';

import { userColumns } from './data-columns';
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

export const useUserAlertDialogStore = create<{
  selectedUserId: string | null;
  isDeleteDialogOpen: boolean;
  isResetPasswordDialogOpen: boolean;
}>(() => ({
  selectedUserId: null,
  isDeleteDialogOpen: false,
  isResetPasswordDialogOpen: false,
}));

const emptyArray: UserSelect[] = [];

const UsersTable = () => {
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageSize: 10, pageIndex: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { isDeleteDialogOpen, selectedUserId, isResetPasswordDialogOpen } =
    useUserAlertDialogStore();

  const { mutate: mutateSoftDeleteUser } = useMutation({
    mutationFn: softDeleteUser,
    onMutate: () => {
      useUserAlertDialogStore.setState({
        isDeleteDialogOpen: false,
        selectedUserId: null,
      });
    },
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [Entity.Users],
      });

      toast.success('Success soft deleting user');
    },
  });

  const { mutate: mutateGenerateResetPasswordToken } = useMutation({
    mutationFn: generateResetPasswordToken,
    onMutate: () => {
      useUserAlertDialogStore.setState({
        isResetPasswordDialogOpen: false,
        selectedUserId: null,
      });
    },
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      if (result.data) {
        await navigator.clipboard.writeText(
          `${window.location.origin}${AdminRoute.ResetPassword}/${result.data}`
        );
        toast.info('Password reset link copied!');
      }
    },
  });

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

  const filters = useMemo(
    () =>
      columnFilters
        .filter(({ id }) => id !== 'email') // searching with email is handled with debounce
        .reduce(
          (acc, filter) => ({ ...acc, [filter.id]: filter.value }),
          {} as Pick<Parameters<typeof getUsers>[0], 'role'>
        ),
    [columnFilters]
  );

  const { data: users, isLoading } = useQuery({
    queryKey: [
      Entity.Users,
      filters,
      debouncedSearch,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: async () => {
      const { data = [] } = await getUsers({
        ...filters,
        ...(debouncedSearch && { name: debouncedSearch, email: debouncedSearch }),
        pageSize: pagination.pageSize,
        pageIndex: pagination.pageIndex,
        sortBy: sorting,
      });
      return data;
    },
  });

  const { data: count = 0 } = useQuery({
    queryKey: [Entity.Users, 'count', filters, debouncedSearch],
    queryFn: async () => {
      const { data = 0 } = await getUsersCount({
        ...filters,
        ...(debouncedSearch && { name: debouncedSearch, email: debouncedSearch }),
      });
      return data;
    },
  });

  const table = useReactTable({
    data: users || emptyArray,
    columns: userColumns,
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

  const selectedUserInfo = useMemo(() => {
    if (!selectedUserId) {
      return undefined;
    }
    return users?.find((user) => user.id === selectedUserId);
  }, [users, selectedUserId]);

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open: boolean) =>
          useUserAlertDialogStore.setState({
            isDeleteDialogOpen: open,
            ...(open === false && { selectedUserId: null }),
          })
        }
        hideButtonTrigger
        title={`Are you sure you want to delete user "${selectedUserInfo?.name}"?`}
        description={`This action will perform soft delete. Soft deletion will mark the user as inactive while retaining their data for potential reactivation.
This action helps maintain historical records and allows for data recovery if needed.`}
        onClickConfirm={() => mutateSoftDeleteUser(selectedUserId as string)}
      />
      <ConfirmDialog
        isOpen={isResetPasswordDialogOpen}
        onOpenChange={(open: boolean) =>
          useUserAlertDialogStore.setState({
            isResetPasswordDialogOpen: open,
            ...(open === false && { selectedUserId: null }),
          })
        }
        hideButtonTrigger
        title={`Confirm password reset link generation for "${selectedUserInfo?.name}"`}
        description={`Are you sure you want to generate a password reset link for ${selectedUserInfo?.name}? 
This link will allow the user to reset their password. 
Please ensure that the link is securely communicated to the user.`}
        onClickConfirm={() => mutateGenerateResetPasswordToken(selectedUserId as string)}
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
                    {userColumns.map((_column, columnIndex) => (
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
