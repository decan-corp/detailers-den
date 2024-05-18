import { validateRequest } from 'src/components/auth/validate-request';
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';

import TabsContainer from './components/tabs-container';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin',
};

const Dashboard = async () => {
  const { user } = await validateRequest();

  if (user && ![Role.Admin, Role.Cashier].includes(user.role)) {
    redirect(AdminRoute.POS);
  }

  return (
    <main className="flex-1 space-y-4 bg-background p-4 pt-6 sm:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <TabsContainer />
    </main>
  );
};

export default Dashboard;
