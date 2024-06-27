'use client';

import { getCrewEarningsBreakdown } from 'src/actions/crew-earnings/get-breakdown';
import { DataTableColumnHeader } from 'src/components/table/data-table-column-header';
import { DATE_TABLE_DATE_FORMAT } from 'src/constants/date-format';
import { formatAmount } from 'src/utils/format';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

export type CrewEarningsColumnType = NonNullable<
  Awaited<ReturnType<typeof getCrewEarningsBreakdown>>['data']
>[number];

export const serviceColumns: ColumnDef<CrewEarningsColumnType>[] = [
  {
    accessorKey: 'createdAt',
    accessorFn: ({ createdAt }) => dayjs(createdAt).format(DATE_TABLE_DATE_FORMAT),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date Created" />,
  },
  {
    accessorKey: 'plateNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plate Number" />,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
  },
  {
    accessorKey: 'serviceName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />,
  },
  {
    accessorKey: 'vehicleSize',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
  },
  {
    accessorKey: 'crewCutPercentage',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Crew Cut %" />,
    cell: ({ row }) => `${row.original.crewCutPercentage}%`,
  },
  {
    accessorKey: 'computedServiceCutPercentage',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Computed Cut %" />,
    cell: ({ row }) => `${row.original.computedServiceCutPercentage}%`,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service Price" />,
    cell: ({ row }) => formatAmount(row.original.price),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount Earned" />,
    cell: ({ row }) => formatAmount(row.original.amount),
  },
];
