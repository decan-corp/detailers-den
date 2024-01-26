'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from 'src/components/table/data-table-faceted-filter';

import { UserFormDialog } from './data-form-dialog';
import { rolesOptions } from './data-table-options';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const router = useRouter();
  const isFiltered = table.getState().columnFilters.length > 0;

  const reset = () => {
    table.resetColumnFilters();
    table.resetPageIndex();
    table.resetGlobalFilter();
    router.replace('?');
  };

  return (
    <div className="flex flex-col-reverse justify-between gap-y-4 md:flex-row md:items-center">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search by email or name"
          value={(table.getState()?.globalFilter as string) ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('role') && (
          <DataTableFacetedFilter
            column={table.getColumn('role')}
            title="Role"
            options={rolesOptions}
          />
        )}

        {isFiltered && (
          <Button variant="ghost" onClick={reset} className="h-8 px-2 lg:px-3">
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <UserFormDialog />
    </div>
  );
};
