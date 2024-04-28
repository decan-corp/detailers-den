'use client';

import { getTransactionAndEarnings } from 'src/actions/transactions/get-transaction-and-services';
import { Entity } from 'src/constants/entities';

import EditForm from './edit-form';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

const Page = ({ params }: { params: { transactionId: string } }) => {
  const { transactionId } = params;

  const { data: transaction, isLoading } = useQuery({
    queryKey: [Entity.Transactions, 'edit', transactionId],
    queryFn: async () => {
      const { data } = await getTransactionAndEarnings(transactionId);
      return data;
    },
    enabled: !!transactionId,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="loading loading-ring loading-lg text-foreground" />
      </div>
    );
  }

  if (!transaction) {
    notFound();
  }

  return <EditForm data={transaction} />;
};

export default Page;
