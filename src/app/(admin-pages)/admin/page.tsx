import { getPageSession } from 'src/components/auth/get-page-session';
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';

import TabsContainer from './components/tabs-container';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin',
};

const Dashboard = async () => {
  const session = await getPageSession();

  if (session && ![Role.Admin].includes(session.user.role)) {
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
