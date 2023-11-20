import { Separator } from '@/components/ui/separator';

import UsersTable from './components/users-table';

const Management = () => (
  <main className="space-y-6 bg-background">
    <div>
      <h3 className="text-lg font-medium">Users</h3>
    </div>
    <Separator />
    <UsersTable />
  </main>
);

export default Management;
