'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePickerWithPresets } from 'src/components/input/date-range-picker-with-presets';
import { DataTableFacetedFilter } from 'src/components/table/data-table-faceted-filter';
import DataTableViewOptions from 'src/components/table/data-table-view-options';
import { DATE_RANGE_OPTIONS } from 'src/constants/options';
import { AdminRoute } from 'src/constants/routes';
import { useServiceOptions } from 'src/queries/services';
import { useCrewOptions } from 'src/queries/users';

import {
  modeOfPaymentOptions,
  transactionStatusOptions,
  vehicleSizeOptions,
} from './data-table-options';

import cuid2 from '@paralleldrive/cuid2';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { isEmpty } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const router = useRouter();
  const isFiltered = table.getState().columnFilters.length > 0;
  const [resetKey, setResetKey] = useState(cuid2.createId());
  const { data: services = [] } = useServiceOptions();
  const { data: crews = [] } = useCrewOptions();

  const serviceOptions = useMemo(
    () => services.map((service) => ({ value: service.id, label: service.serviceName })),
    [services]
  );
  const crewOptions = useMemo(
    () => crews.map((crew) => ({ value: crew.id, label: crew.name })),
    [crews]
  );
  const reset = () => {
    table.resetColumnFilters();
    table.resetPageIndex();
    setResetKey(cuid2.createId());

    // When utilizing search parameters to maintain state during redirection,
    // it's important to reset query parameters as well to ensure a clean state.
    router.replace('?');
  };

  return (
    <div className="flex flex-col-reverse justify-between gap-x-2 gap-y-4 md:flex-row md:items-center">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name or plate number"
          value={(table.getState()?.globalFilter as string) ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn('createdAt') && (
          <DateRangePickerWithPresets
            key={resetKey}
            buttonSize="sm"
            initialDateRange={
              !isEmpty(table.getColumn('createdAt')?.getFilterValue())
                ? (table.getColumn('createdAt')?.getFilterValue() as DateRange)
                : { from: undefined, to: undefined }
            }
            placeholder="Filter by date"
            options={{
              All: {
                from: undefined,
                to: undefined,
              },
              ...DATE_RANGE_OPTIONS,
            }}
            onChange={table.getColumn('createdAt')?.setFilterValue}
          />
        )}

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

        {table.getColumn('services') && (
          <DataTableFacetedFilter
            column={table.getColumn('services')}
            title="Service"
            options={serviceOptions}
          />
        )}

        {table.getColumn('crews') && (
          <DataTableFacetedFilter
            column={table.getColumn('crews')}
            title="Crew"
            options={crewOptions}
          />
        )}

        {isFiltered && (
          <Button variant="ghost" onClick={reset} className="h-8 px-2 lg:px-3">
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-row-reverse justify-end gap-4 md:flex-row">
        <DataTableViewOptions table={table} />
        <Button className="w-max" variant="outline">
          <Link href={AdminRoute.AddTransaction}>Add Transaction</Link>
        </Button>
      </div>
    </div>
  );
};
