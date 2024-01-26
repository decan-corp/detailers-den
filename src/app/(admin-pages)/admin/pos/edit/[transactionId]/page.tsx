'use client';

import TransactionForm from '../../components/data-form';

const EditTransaction = ({ params }: { params: { transactionId: string } }) => (
  <TransactionForm transactionId={params.transactionId} />
);

export default EditTransaction;
