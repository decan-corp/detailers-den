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
import { DATE_TABLE_DATE_FORMAT } from 'src/constants/date-format';
import { services } from 'src/schema';

import { useServiceFormStore } from './service-form-dialog';
import { useServiceAlertDialogStore } from './services-table';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { MoreHorizontal } from 'lucide-react';

export const serviceColumns: ColumnDef<
  Pick<
    typeof services.$inferSelect,
    | 'id'
    | 'serviceName'
    | 'description'
    | 'price'
    | 'serviceCutPercentage'
    | 'createdAt'
    | 'updatedAt'
  >
>[] = [
  {
    accessorKey: 'serviceName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service Name" />,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
  },
  {
    accessorKey: 'serviceCutPercentage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Service Cut Percentage" />
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
  },
  {
    accessorKey: 'createdAt',
    accessorFn: ({ createdAt }) => dayjs(createdAt).format(DATE_TABLE_DATE_FORMAT),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
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
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                useServiceFormStore.setState({ isDialogOpen: true, serviceIdToEdit: service.id })
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
