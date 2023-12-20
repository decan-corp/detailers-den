'use client';

import TransactionForm from '../../components/transactions-form';

const EditTransaction = ({ params }: { params: { transactionId: string } }) => (
  <TransactionForm transactionId={params.transactionId} />
);

export default EditTransaction;
