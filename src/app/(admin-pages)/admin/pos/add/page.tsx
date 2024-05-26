'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import { addTransaction } from 'src/actions/transactions/add-transaction';
import { ModeOfPayment, TransactionStatus, VehicleSize } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import { createTransactionSchema } from 'src/schemas/transactions';
import { handleSafeActionError } from 'src/utils/error-handling';

import ServiceList, { makeDefaultTransactionServiceItem } from '../components/form/service-list';
import TransactionBaseForm from '../components/form/transaction-base-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = createTransactionSchema;
export type CreateTransactionFormValues = z.input<typeof formSchema>;

const defaultValues: Partial<CreateTransactionFormValues> = {
  discount: 0,
  tip: 0,
  status: TransactionStatus.Pending,
  vehicleSize: VehicleSize.Motorcycle,
  modeOfPayment: ModeOfPayment.Cash,
};

const Page = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      transactionServices: [makeDefaultTransactionServiceItem()],
    },
    shouldFocusError: true,
  });

  const { mutate: mutateAdd, isPending } = useMutation({
    mutationFn: addTransaction,
    mutationKey: [Entity.Transactions],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Transactions] });
      await queryClient.invalidateQueries({ queryKey: [Entity.Metrics] });
      toast.success('Transaction created successfully.');
      router.push(AdminRoute.POS);
    },
  });

  const onSubmit = (payload: CreateTransactionFormValues) => {
    mutateAdd(payload);
  };

  return (
    <main className="flex-1 space-y-4 bg-background pt-10 md:p-8">
      <div className="flex items-center justify-center">
        <Form {...form}>
          <form
            className="flex w-full flex-col gap-4 md:w-[600px]"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Card className="rounded-none border-0 shadow-none md:rounded-xl md:border md:shadow">
              <CardHeader>
                <CardTitle>Add Transaction</CardTitle>
                <CardDescription>
                  Add new transaction here. Click save when you&apos;re done.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <TransactionBaseForm form={form} />

                <Separator className="opacity-70" />

                <ServiceList form={form} />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default Page;
