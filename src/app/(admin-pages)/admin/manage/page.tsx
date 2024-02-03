import { Separator } from '@/components/ui/separator';
import { validateRequest } from 'src/components/auth/validate-request';
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';

import UsersTable from './components/data-table';

import { redirect } from 'next/navigation';

const Management = async () => {
  const { user } = await validateRequest();

  if (user && ![Role.Admin].includes(user.role)) {
    redirect(AdminRoute.POS);
  }

  return (
    <main className="space-y-6 bg-background">
      <div>
        <h3 className="text-lg font-medium">Users</h3>
      </div>
      <Separator />
      <UsersTable />
    </main>
  );
};

export default Management;
