/* eslint-disable react-hooks/rules-of-hooks */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from 'src/components/table/data-table-column-header';
import { Role } from 'src/constants/common';
import { DATE_TABLE_DATE_FORMAT } from 'src/constants/date-format';
import useClientSession from 'src/hooks/use-client-session';
import { servicesTable } from 'src/schema';
import { formatAmount } from 'src/utils/format';

import { useServiceFormStore } from './data-form-dialog';
import { useServiceAlertDialogStore } from './data-table';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { MoreHorizontal } from 'lucide-react';

export type ServiceColumnType = Pick<
  typeof servicesTable.$inferSelect,
  'id' | 'serviceName' | 'description' | 'createdAt' | 'updatedAt' | 'priceMatrix'
> & { serviceCutMatrix?: typeof servicesTable.$inferSelect.serviceCutMatrix };

export const serviceColumns: ColumnDef<ServiceColumnType>[] = [
  {
    accessorKey: 'serviceName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service Name" />,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const { description } = row.original;

      return <div className="max-w-80 whitespace-pre-wrap break-words">{description}</div>;
    },
  },
  {
    accessorKey: 'serviceCutMatrix',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service Cut Matrix" />,
    cell: ({ row }) => {
      const { serviceCutMatrix } = row.original;
      return (
        <div className="space-y-1">
          {serviceCutMatrix?.map((serviceCut) => (
            <div key={serviceCut.role} className="flex place-content-between gap-2">
              <div>{serviceCut.role}</div>
              <div>{serviceCut.cutPercentage}%</div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'priceMatrix',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price Matrix" />,
    cell: ({ row }) => {
      const { priceMatrix } = row.original;
      return (
        <div className="space-y-1">
          {priceMatrix.map((matrix) => (
            <div key={matrix.vehicleSize} className="flex place-content-between gap-2">
              <div>{matrix.vehicleSize}</div>
              <div>{formatAmount(matrix.price)}</div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    accessorFn: ({ createdAt }) => dayjs(createdAt).format(DATE_TABLE_DATE_FORMAT),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date Created" />,
  },
  {
    accessorKey: 'updatedAt',
    accessorFn: ({ updatedAt }) =>
      updatedAt ? dayjs(updatedAt).format(DATE_TABLE_DATE_FORMAT) : '',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const service = row.original;
      const { data: user } = useClientSession();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(service.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user?.role === Role.Admin && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    useServiceFormStore.setState({
                      isDialogOpen: true,
                      selectedId: service.id,
                    })
                  }
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    useServiceAlertDialogStore.setState({
                      isDeleteDialogOpen: true,
                      serviceIdToDelete: service.id,
                    });
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
