import { Separator } from '@/components/ui/separator';

import TransactionsTable from './components/transactions-table';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POS',
};

const Management = () => (
  <div className="space-y-6 bg-background p-10  pb-16">
    <main className="space-y-6 bg-background">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Transactions</h3>
      </div>
      <Separator />
      <TransactionsTable />
    </main>
  </div>
);

export default Management;
