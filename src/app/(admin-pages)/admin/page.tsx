import TabsContainer from './components/tabs-container';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
};

const Dashboard = () => (
  <main className="flex-1 space-y-4 bg-background p-8 pt-6">
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
    </div>
    <TabsContainer />
  </main>
);

export default Dashboard;
