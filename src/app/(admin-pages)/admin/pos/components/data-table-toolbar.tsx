'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from 'src/components/table/data-table-faceted-filter';
import { AdminRoute } from 'src/constants/routes';

import {
  modeOfPaymentOptions,
  transactionStatusOptions,
  vehicleSizeOptions,
} from './data-table-options';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import Link from 'next/link';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search by name or plate number"
          value={(table.getColumn('customerName')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('customerName')?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={transactionStatusOptions}
          />
        )}

        {table.getColumn('vehicleSize') && (
          <DataTableFacetedFilter
            column={table.getColumn('vehicleSize')}
            title="Vehicle Size"
            options={vehicleSizeOptions}
          />
        )}

        {table.getColumn('modeOfPayment') && (
          <DataTableFacetedFilter
            column={table.getColumn('modeOfPayment')}
            title="Mode of Payment"
            options={modeOfPaymentOptions}
          />
        )}

        {/* TODO: filter by crew/detailer/stay-in-crew */}

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
      <Link href={AdminRoute.AddTransaction}>
        <Button variant="outline">Add Transaction</Button>
      </Link>
    </div>
  );
};
