'use client';

import useClientSession from 'src/hooks/use-client-session';

import CrewEarningsTable from './components/data-table';

import { notFound } from 'next/navigation';

const TransactionPage = () => {
  const { data: user, isLoading } = useClientSession();

  if (isLoading) {
    return (
      <div className="flex h-screen items-start justify-center">
        <span className="loading loading-ring loading-lg mt-44 text-foreground" />
      </div>
    );
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6 bg-background p-4 pb-16 sm:p-10">
      <main className="space-y-6 bg-background">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Crew Earnings</h3>
        </div>

        <CrewEarningsTable userId={user.id} role={user.role} />
      </main>
    </div>
  );
};

export default TransactionPage;
