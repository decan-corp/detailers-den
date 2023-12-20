import { Separator } from '@/components/ui/separator';

import TransactionsTable from './components/transactions-table';

const Management = () => (
  <div className="space-y-6 bg-background p-10  pb-16">
    <main className="space-y-6 bg-background">
      <div>
        <h3 className="text-lg font-medium">Transactions</h3>
      </div>
      <Separator />
      <TransactionsTable />
    </main>
  </div>
);

export default Management;
