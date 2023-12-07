'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserFormDialog } from 'src/app/(admin-pages)/admin/manage/components/user-form-dialog';
import { DataTableFacetedFilter } from 'src/components/table/data-table-faceted-filter';

import { roles } from './data-table-options';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search users by email or name"
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('role') && (
          <DataTableFacetedFilter column={table.getColumn('role')} title="Role" options={roles} />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <UserFormDialog />
    </div>
  );
};
