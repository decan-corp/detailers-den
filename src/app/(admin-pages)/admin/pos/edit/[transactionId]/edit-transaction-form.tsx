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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { updateTransaction } from 'src/actions/transactions/update-transaction';
import { ModeOfPayment, Role, TransactionStatus, VehicleSize } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import useClientSession from 'src/hooks/use-client-session';
import { transactionSchema, updateTransactionSchema } from 'src/schemas/transactions';
import { handleSafeActionError } from 'src/utils/error-handling';

import ServiceList, { defaultTransactionServiceItem } from '../../components/form/service-list';
import TransactionBaseForm from '../../components/form/transaction-base-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
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

const EditTransactionForm = ({ data }: { data?: UpdateTransactionFormValues }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useClientSession();

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
      void queryClient.invalidateQueries({ queryKey: [Entity.CrewEarnings] });
      void queryClient.invalidateQueries({ queryKey: [Entity.Metrics] });
      toast.success('Transaction created successfully.');
      router.push(AdminRoute.POS);
    },
  });

  const onSubmit = (payload: UpdateTransactionFormValues) => {
    mutateUpdate(payload);
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
                {session && [Role.Admin, Role.Cashier, Role.Accounting].includes(session.role) && (
                  <FormField
                    control={form.control}
                    name="createdAt"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            value={dayjs(field?.value).format('YYYY-MM-DDTHH:mm')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <TransactionBaseForm
                  form={form as UseFormReturn<z.input<typeof transactionSchema>>}
                />

                <Separator className="opacity-70" />

                <ServiceList form={form as UseFormReturn<z.input<typeof transactionSchema>>} />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isPending || !form.formState.isDirty}>
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

export default EditTransactionForm;
