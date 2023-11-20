'use client';

import { users } from 'src/schema';

import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<typeof users.$inferSelect>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Email',
    accessorKey: 'email',
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
  },
  {
    header: 'Updated At',
    accessorKey: 'updatedAt',
  },
];
