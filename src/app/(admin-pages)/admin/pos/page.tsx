import { Separator } from '@/components/ui/separator';

import TransactionTable from './components/data-table';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POS',
};

const TransactionPage = () => (
  <div className="space-y-6 bg-background p-4 pb-16 sm:p-10">
    <main className="space-y-6 bg-background">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Transactions</h3>
      </div>
      <Separator />
      <TransactionTable />
    </main>
  </div>
);

export default TransactionPage;
