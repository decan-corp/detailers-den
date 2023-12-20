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
import { AdminRoute } from 'src/constants/routes';
import { transactions } from 'src/schema';

import { useTransactionAlertDialogStore } from './transactions-table';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export const transactionColumns: ColumnDef<
  Pick<
    typeof transactions.$inferSelect,
    | 'id'
    | 'customerName'
    | 'plateNumber'
    | 'status'
    | 'totalPrice'
    | 'vehicleSize'
    | 'modeOfPayment'
    | 'createdAt'
    | 'updatedAt'
  >
>[] = [
  {
    accessorKey: 'customerName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer Name" />,
  },
  {
    accessorKey: 'plateNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plate Number" />,
  },
  {
    accessorKey: 'totalPrice',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Price" />,
  },
  {
    accessorKey: 'vehicleSize',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle Size" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
  },
  {
    accessorKey: 'modeOfPayment',
    header: ({ column }) => <DataTableColumnHeader column={column} title="MOP" />,
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
      const transaction = row.original;

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
              onClick={() => navigator.clipboard.writeText(transaction.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`${AdminRoute.EditTransaction}/${transaction.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                useTransactionAlertDialogStore.setState({
                  isDeleteDialogOpen: true,
                  userIdToDelete: transaction.id,
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
