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
import { toast } from '@/components/ui/use-toast';
import { ConfirmDialog } from 'src/components/auth/dialog/confirmation-dialog';
import { DataTablePagination } from 'src/components/table/data-table-pagination';
import { Entity } from 'src/constants/entities';
import { Role } from 'src/constants/roles';
import { UserSelect } from 'src/types/schema';

import { userColumns } from './data-columns';
import { DataTableToolbar } from './data-table-toolbar';

import { getUsers, getUsersCount, softDeleteUser } from '../actions';

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
import { create } from 'zustand';

export const useUserAlertDialogStore = create<{
  isDeleteDialogOpen: boolean;
  userIdToDelete: string | null;
}>(() => ({
  isDeleteDialogOpen: false,
  userIdToDelete: null,
}));

const emptyArray: UserSelect[] = [];

const UsersTable = () => {
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageSize: 10, pageIndex: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isDeleteDialogOpen = useUserAlertDialogStore((state) => state.isDeleteDialogOpen);
  const userIdToDelete = useUserAlertDialogStore((state) => state.userIdToDelete);

  const { mutate: mutateSoftDeleteUser } = useMutation({
    mutationFn: softDeleteUser,
    onMutate: () => {
      useUserAlertDialogStore.setState({
        isDeleteDialogOpen: false,
        userIdToDelete: null,
      });
    },
    onSuccess: async (result) => {
      if (result.validationError) {
        toast({
          title: 'Invalid Input',
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
          variant: 'destructive',
        });

        return;
      }

      if (result?.serverError) {
        toast({
          title: 'Something went wrong',
          description: result.serverError,
          variant: 'destructive',
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [Entity.Users],
      });

      toast({
        title: 'Success!',
        description: 'Success soft deleting user',
      });
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

  const roleFilter = useMemo(
    () => columnFilters.find((filter) => filter.id === 'role')?.value as Role[] | undefined,
    [columnFilters]
  );

  const { data: users, isLoading } = useQuery({
    queryKey: [
      Entity.Users,
      roleFilter,
      debouncedSearch,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: async () => {
      const { data = [] } = await getUsers({
        ...(roleFilter && { role: roleFilter }),
        ...(debouncedSearch && { name: debouncedSearch }),
        ...(debouncedSearch && { email: debouncedSearch }),
        pageSize: pagination.pageSize,
        pageIndex: pagination.pageIndex,
        sortBy: sorting,
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

  const onDeleteDialogChange = (open: boolean) => {
    useUserAlertDialogStore.setState({ isDeleteDialogOpen: open });
  };

  const onClickConfirmDelete = () => {
    if (!userIdToDelete) {
      toast({
        title: 'Missing user id',
        description: 'User id is required to delete a user.',
        variant: 'destructive',
      });
      return;
    }

    mutateSoftDeleteUser(userIdToDelete);
  };

  const userToDelete = useMemo(() => {
    if (!userIdToDelete) {
      return undefined;
    }
    return users?.find((user) => user.id === userIdToDelete);
  }, [users, userIdToDelete]);

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        hideButtonTrigger
        title={`Are you sure you want to delete user "${userToDelete?.name}"?`}
        description={`This action will perform soft delete. Soft deletion will mark the user as inactive while retaining their data for potential reactivation.
This action helps maintain historical records and allows for data recovery if needed.`}
        onClickConfirm={onClickConfirmDelete}
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
