'use client';

import { Button } from '@/components/ui/button';
import { ComboBoxResponsive } from 'src/components/input/combobox-responsive';
import {
  DateRangePickerWithPresets,
  StringDateRange,
} from 'src/components/input/date-range-picker-with-presets';
import { managerialRole } from 'src/constants/common';
import { DATE_RANGE_OPTIONS } from 'src/constants/options';
import useClientSession from 'src/hooks/use-client-session';
import { useCrewOptions } from 'src/queries/users';
import { formatAmount } from 'src/utils/format';

import { CrewEarningsColumnType } from './data-columns';
import { CrewEarningsGlobalFilter } from './data-table';

import { createId } from '@paralleldrive/cuid2';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { groupBy, isEmpty, startCase } from 'lodash';
import { useMemo, useState } from 'react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export const CrewEarningsToolbar = ({ table }: DataTableToolbarProps<CrewEarningsColumnType>) => {
  const { data: user, isLoading: isClientSessionLoading } = useClientSession();
  const [resetKey, setResetKey] = useState(createId());
  const { columnFilters, globalFilter } = table.getState();
  const typedGlobalFilter: CrewEarningsGlobalFilter = globalFilter;
  const hasColumnFilters = columnFilters.length > 0;
  const hasGlobalFilters = !!typedGlobalFilter.crewId;

  const records = table.getCoreRowModel().rows;

  const totalAmountEarned = useMemo(
    () => records.reduce((acc, current) => acc + Number(current.original.amount), 0),
    [records]
  );

  const { data: crews = [], isLoading: isCrewsLoading } = useCrewOptions();

  const crewOptions = useMemo(
    () =>
      groupBy(
        crews.map((option) => ({
          role: startCase(option.role),
          value: option.id,
          label: <div className="font-semibold">{option.name}</div>,
        })),
        'role'
      ),
    [crews]
  );

  const onChangeCrew = (value: string) => {
    table.setGlobalFilter({
      ...typedGlobalFilter,
      crewId: value,
    } satisfies CrewEarningsGlobalFilter);
  };

  const reset = () => {
    table.resetColumnFilters();
    table.resetPageIndex();
    table.resetGlobalFilter();
    // reset date range picker by changing key
    setResetKey(createId());
  };

  const isUserCrew = !!user && !managerialRole.includes(user.role);

  return (
    <div className="flex flex-col-reverse justify-between gap-y-4 md:flex-row md:items-center">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="w-max min-w-40 max-w-64">
          <ComboBoxResponsive
            value={typedGlobalFilter.crewId ?? ''}
            onSelect={onChangeCrew}
            placeholder="Select crew..."
            groupedOptions={crewOptions}
            disabled={isCrewsLoading || isClientSessionLoading || isUserCrew}
          />
        </div>

        <DateRangePickerWithPresets
          key={resetKey}
          mode="string"
          initialDateRange={
            !isEmpty(table.getColumn('createdAt')?.getFilterValue())
              ? (table.getColumn('createdAt')?.getFilterValue() as StringDateRange)
              : { from: undefined, to: undefined }
          }
          onChange={table.getColumn('createdAt')?.setFilterValue}
          options={DATE_RANGE_OPTIONS}
        />

        {(hasColumnFilters || hasGlobalFilters) && (
          <Button variant="ghost" onClick={reset} className="h-8 px-2 lg:px-3">
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div>
        <div className="flex gap-2">
          <div className="font-semibold">Total Amount Earned:</div>
          <div className="font-bold">{formatAmount(totalAmountEarned)}</div>
        </div>
      </div>
    </div>
  );
};
