/* eslint-disable no-restricted-syntax */

'ues client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import { addTransaction } from 'src/actions/transactions/add-transaction';
import { getTransaction } from 'src/actions/transactions/get-transactions';
import { updateTransaction } from 'src/actions/transactions/update-transaction';
import { VehicleSize } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import useClientSession from 'src/hooks/use-client-session';
import { transactionServicesTable, transactionsTable } from 'src/schema';
import { transactionSchema, updateTransactionSchema } from 'src/schemas/transactions';
import { handleSafeActionError } from 'src/utils/error-handling';

import AvailedServices from './form/availed-services';
import TransactionBaseInfo from './form/transaction-base-info';

import cuid2 from '@paralleldrive/cuid2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { notFound, useRouter } from 'next/navigation';
import { ComponentProps } from 'react';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { z } from 'zod';

type ValidationError = {
  [Field in keyof typeof transactionsTable.$inferSelect]?: string;
};

type ServiceEntry = Pick<
  typeof transactionServicesTable.$inferSelect,
  'price' | 'serviceBy' | 'serviceId' | 'id'
>;

export const getDefaultServiceValue = () => ({
  serviceBy: [''],
  price: '0',
  serviceId: '',
  id: cuid2.createId(),
});

export interface TransactionFormState {
  selectedVehicleSize: VehicleSize;
  transactionServices: ServiceEntry[];
  recentSelectedCrew: string[];
  recentSelectedService: string[];
  error: ValidationError;
}

// TODO: rewrite with react-hook-form
const TransactionForm = ({ transactionId }: { transactionId?: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useImmer<TransactionFormState>(() => ({
    selectedVehicleSize: VehicleSize.Motorcycle,
    transactionServices: [getDefaultServiceValue()],
    recentSelectedCrew: [],
    recentSelectedService: [],
    error: {},
  }));

  const isEdit = Boolean(transactionId);
  const { isLoading: isFetchingSession } = useClientSession(); // prefetch session and block UI to render createdAt field

  const {
    data: transaction,
    isLoading: isFetchingTransactionToEdit,
    error: fetchingTransactionError,
  } = useQuery({
    queryKey: [Entity.Transactions, transactionId],
    queryFn: async () => {
      const { data } = await getTransaction(transactionId as string);
      return data;
    },
    enabled: !!transactionId,
    refetchOnWindowFocus: false,
  });

  if ((isEdit && transaction === null) || fetchingTransactionError) {
    notFound();
  }

  const { mutate: mutateAddTransaction, isPending: isAddingTransaction } = useMutation({
    mutationFn: addTransaction,
    mutationKey: [Entity.Transactions],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        setFormState((prevState) => {
          prevState.error = (result.validationErrors as ValidationError) || {};
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Transactions] });
      await queryClient.invalidateQueries({ queryKey: [Entity.Metrics] });
      toast.success('Transaction created successfully.');
      router.push(AdminRoute.POS);
    },
  });

  const { mutate: mutateUpdateTransaction, isPending: isUpdatingTransaction } = useMutation({
    mutationFn: updateTransaction,
    mutationKey: [Entity.Transactions, transactionId],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        setFormState((prevState) => {
          prevState.error = (result.validationErrors as ValidationError) || {};
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Transactions] });
      await queryClient.invalidateQueries({ queryKey: [Entity.CrewEarnings, transactionId] });
      await queryClient.invalidateQueries({ queryKey: [Entity.Metrics] });
      toast.success('Transaction updated successfully.');
      router.push(AdminRoute.POS);
    },
  });

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formEntries: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      formEntries[key] = value;
    }

    const data = formEntries as z.input<typeof transactionSchema>;
    const payload = {
      ...data,
      transactionServices: formState.transactionServices,
    };

    if (transactionId) {
      const updateData = payload as z.input<typeof updateTransactionSchema>;
      mutateUpdateTransaction({
        ...updateData,
        ...(updateData.createdAt && { createdAt: dayjs(updateData.createdAt).toDate() }),
        id: transactionId,
      });
    } else {
      mutateAddTransaction(payload);
    }
  };

  if ((isEdit && isFetchingTransactionToEdit) || isFetchingSession) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="loading loading-ring loading-lg text-foreground" />
      </div>
    );
  }

  const isSaving = isAddingTransaction || isUpdatingTransaction;

  return (
    <main className="flex-1 space-y-4 bg-background pt-10 md:p-8">
      <div className="flex items-center justify-center">
        <form onSubmit={onSubmit} className="w-full md:w-[600px]">
          <Card className="rounded-none border-0  shadow-none md:rounded-xl md:border md:shadow">
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit' : 'Add'} Transaction</CardTitle>
              <CardDescription>
                {isEdit ? 'Edit' : 'Add new'} transaction here. Click save when you&apos;re done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 py-4">
              <TransactionBaseInfo
                formState={formState}
                setFormState={setFormState}
                transactionId={transactionId}
              />

              <Separator className="opacity-70" />

              <AvailedServices
                formState={formState}
                setFormState={setFormState}
                isSaving={isSaving}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving || (!!transactionId && isFetchingTransactionToEdit)}
              >
                {isSaving && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </main>
  );
};

export default TransactionForm;
