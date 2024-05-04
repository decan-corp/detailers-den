'use client';

import { getEditTransactionData } from 'src/actions/transactions/get-edit-transaction-data';
import { Entity } from 'src/constants/entities';
import useClientSession from 'src/hooks/use-client-session';

import EditTransactionForm from './edit-transaction-form';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

const Page = ({ params }: { params: { transactionId: string } }) => {
  const { transactionId } = params;

  const { data: transaction, isLoading } = useQuery({
    queryKey: [Entity.Transactions, 'edit', transactionId],
    queryFn: async () => {
      const { data } = await getEditTransactionData(transactionId);
      return data;
    },
    enabled: !!transactionId,
    refetchOnWindowFocus: false,
  });
  const { isLoading: isFetchingSession } = useClientSession();

  if (isLoading || isFetchingSession) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="loading loading-ring loading-lg text-foreground" />
      </div>
    );
  }

  if (!transaction) {
    notFound();
  }

  return <EditTransactionForm data={transaction} />;
};

export default Page;
