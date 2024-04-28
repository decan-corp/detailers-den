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
import { updateTransaction } from 'src/actions/transactions/update-transaction';
import { ModeOfPayment, TransactionStatus, VehicleSize } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import { transactionSchema, updateTransactionSchema } from 'src/schemas/transactions';
import { handleSafeActionError } from 'src/utils/error-handling';

import ServiceList, { defaultTransactionServiceItem } from '../../components/form/service-list';
import TransactionBaseInfo from '../../components/form/transaction-base-info';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = updateTransactionSchema;
export type UpdateTransactionFormValues = z.input<typeof formSchema>;

const defaultValues: Partial<UpdateTransactionFormValues> = {
  discount: 0,
  tip: 0,
  status: TransactionStatus.Pending,
  vehicleSize: VehicleSize.Motorcycle,
  modeOfPayment: ModeOfPayment.Cash,
};

const EditForm = ({ data }: { data?: UpdateTransactionFormValues }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<UpdateTransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: data || {
      ...defaultValues,
      transactionServices: [defaultTransactionServiceItem],
    },
    shouldFocusError: true,
  });

  const { mutate: mutateUpdate, isPending } = useMutation({
    mutationFn: updateTransaction,
    mutationKey: [Entity.Transactions],
    onSuccess: (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: [Entity.Transactions] });
      void queryClient.invalidateQueries({ queryKey: [Entity.Metrics] });
      toast.success('Transaction created successfully.');
      router.push(AdminRoute.POS);
    },
  });

  const onSubmit = (event: UpdateTransactionFormValues) => {
    mutateUpdate(event);
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
                <CardTitle>Edit Transaction</CardTitle>
                <CardDescription>
                  Edit transaction here. Click save when you&apos;re done.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <TransactionBaseInfo
                  form={form as UseFormReturn<z.input<typeof transactionSchema>>}
                />

                <Separator className="opacity-70" />

                <ServiceList form={form as UseFormReturn<z.input<typeof transactionSchema>>} />
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

export default EditForm;
