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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { addTransaction } from 'src/actions/transactions/add-transaction';
import { getTransaction } from 'src/actions/transactions/get-transactions';
import { updateTransaction } from 'src/actions/transactions/update-transaction';
import RequiredIndicator from 'src/components/form/required-indicator';
import { ModeOfPayment, Role, TransactionStatus } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import { transactionServices, transactions } from 'src/schema';

import {
  modeOfPaymentOptions,
  transactionStatusOptions,
  vehicleSizeOptions,
} from './data-table-options';

import { getUsers } from '../../manage/actions';
import { getServices } from '../../manage/services/actions';

import cuid2 from '@paralleldrive/cuid2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircleIcon, XIcon } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { ComponentProps, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { useImmer } from 'use-immer';

type UserValidationError = {
  [Field in keyof typeof transactions.$inferSelect]?: string;
};

type Service = Pick<
  typeof transactionServices.$inferSelect,
  'price' | 'serviceBy' | 'serviceId' | 'id'
>;

const getDefaultServiceValue = () => ({
  serviceBy: [''],
  price: '0',
  serviceId: '',
  id: cuid2.createId(),
});

const TransactionForm = ({ transactionId }: { transactionId?: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [transactionServicesState, setTransactionServicesState] = useImmer<Service[]>(() => [
    getDefaultServiceValue(),
  ]);

  const [error, setError] = useState<UserValidationError>({});

  const isEdit = Boolean(transactionId);

  const {
    data: transaction,
    isLoading: isFetchingTransactionToEdit,
    error: fetchingTransactionError,
  } = useQuery({
    queryKey: [Entity.Transactions, transactionId],
    queryFn: async () => {
      const { data, serverError, validationError } = await getTransaction(transactionId as string);

      if (serverError || validationError) {
        toast({
          title: validationError ? 'Validation error' : 'Server Error',
          description: serverError || 'Invalid user id',
        });
      }

      return data;
    },
    enabled: !!transactionId,
    refetchOnWindowFocus: false,
  });

  if ((isEdit && transaction === null) || fetchingTransactionError) {
    notFound();
  }

  const { data: serviceOptions = [], isLoading: isFetchingServices } = useQuery({
    queryKey: [Entity.Services],
    queryFn: async () => {
      const { data } = await getServices({});
      return data;
    },
  });

  const { data: crewOptions = [], isLoading: isFetchingCrews } = useQuery({
    queryKey: [Entity.Users, 'crews'],
    queryFn: async () => {
      const { data } = await getUsers({ role: [Role.Crew, Role.Detailer, Role.StayInCrew] });
      return data;
    },
  });

  const { mutate: mutateAddTransaction, isPending: isAddingTransaction } = useMutation({
    mutationFn: addTransaction,
    mutationKey: [Entity.Transactions],
    onSuccess: async (result) => {
      if (result.validationError) {
        toast({
          title: 'Invalid Input',
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
          variant: 'destructive',
        });

        setError(result.validationError as UserValidationError);
        return;
      }

      if (result?.serverError) {
        toast({
          title: 'Something went wrong',
          description: result.serverError,
          variant: 'destructive',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Transactions] });
      toast({
        title: 'Success!',
        description: 'User created successfully.',
      });
      router.push(AdminRoute.POS);
    },
  });

  const { mutate: mutateUpdateTransaction, isPending: isUpdatingTransaction } = useMutation({
    mutationFn: updateTransaction,
    mutationKey: [Entity.Transactions, transactionId],
    onSuccess: async (result) => {
      if (result.validationError) {
        toast({
          title: 'Invalid Input',
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
          variant: 'destructive',
        });

        setError(result.validationError as UserValidationError);
        return;
      }

      if (result?.serverError) {
        toast({
          title: 'Something went wrong',
          description: result.serverError,
          variant: 'destructive',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Transactions] });
      toast({
        title: 'Success!',
        description: 'User updated successfully.',
      });
      router.push(AdminRoute.POS);
    },
  });

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }

    if (transactionId) {
      const data = payload as typeof transactions.$inferSelect;
      mutateUpdateTransaction({
        ...data,
        id: transactionId,
        plateNumber: data.plateNumber.toUpperCase(),
        transactionServices: transactionServicesState,
      });
    } else {
      const data = payload as typeof transactions.$inferInsert;
      mutateAddTransaction({
        ...data,
        plateNumber: data.plateNumber.toUpperCase(),
        transactionServices: transactionServicesState,
      });
    }
  };

  if (isEdit && isFetchingTransactionToEdit) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-4 bg-background p-8 pt-10">
      <div className="flex items-center justify-center">
        <form onSubmit={onSubmit} className="md:w-[600px]">
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit' : 'Add'} Transaction</CardTitle>
              <CardDescription>
                {isEdit ? 'Edit' : 'Add new'} user here. Click save when you&apos;re done.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4">
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="customerName" className="col-span-2 flex justify-end">
                  Customer Name
                </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  className="col-span-4"
                  defaultValue={transaction?.customerName || ''}
                />
              </div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="plateNumber" className="col-span-2 flex justify-end">
                  Plate Number <RequiredIndicator />
                </Label>
                <Input
                  id="plateNumber"
                  type="text"
                  name="plateNumber"
                  required
                  className="col-span-4"
                  minLength={6}
                  maxLength={7}
                  defaultValue={transaction?.plateNumber || ''}
                />
              </div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="status" className="col-span-2 flex justify-end">
                  Status <RequiredIndicator />
                </Label>
                <Select
                  required
                  name="status"
                  defaultValue={transaction?.status || TransactionStatus.Pending}
                >
                  <SelectTrigger id="status" className="col-span-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionStatusOptions.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="modeOfPayment" className="col-span-2 flex justify-end">
                  Mode of Payment <RequiredIndicator />
                </Label>
                <Select
                  required
                  name="modeOfPayment"
                  defaultValue={transaction?.modeOfPayment || ModeOfPayment.Cash}
                >
                  <SelectTrigger id="modeOfPayment" className="col-span-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modeOfPaymentOptions.map(({ value, label, icon: Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex flex-row items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="vehicleSize" className="col-span-2 flex justify-end">
                  Vehicle Size <RequiredIndicator />
                </Label>
                <Select required name="vehicleSize" defaultValue={transaction?.vehicleSize}>
                  <SelectTrigger id="vehicleSize" className="col-span-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleSizeOptions.map(({ value, label, icon: Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex flex-row items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="grid grid-cols-6 items-center gap-4">
                  <Label htmlFor="discount" className="col-span-2 text-right">
                    Discount (in PHP)
                  </Label>
                  <Input
                    id="discount"
                    name="discount"
                    defaultValue={transaction?.discount || 0}
                    type="number"
                    min={0}
                    className={twJoin('col-span-4', error.discount && 'border-destructive-200')}
                  />
                </div>
                {error.discount && (
                  <div className="grid grid-cols-6">
                    <div className="col-span-4 col-start-3 ml-2 text-sm text-destructive dark:text-destructive-200">
                      {error.discount}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="tip" className="col-span-2 text-right">
                  Tip
                </Label>
                <Input
                  id="tip"
                  name="tip"
                  defaultValue={transaction?.tip || 0}
                  type="number"
                  min={0}
                  className="col-span-4"
                />
              </div>

              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="note" className="col-span-2 flex justify-end">
                  Note
                </Label>
                <Textarea
                  id="note"
                  name="note"
                  className="col-span-4"
                  defaultValue={transaction?.note || ''}
                  maxLength={360}
                />
              </div>
              {transactionServicesState.map((service, index) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 pl-6"
                >
                  <div className="flex flex-row place-content-between items-center">
                    <div>Service {index + 1}</div>
                    <Button
                      className=""
                      variant="ghost"
                      type="button"
                      disabled={transactionServicesState.length === 1}
                      onClick={() =>
                        setTransactionServicesState((prevState) => prevState.toSpliced(index, 1))
                      }
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-6 items-center gap-4">
                    <Label className="col-span-2 flex justify-end">
                      Service <RequiredIndicator />
                    </Label>
                    <Select
                      required
                      defaultValue={service.serviceId || undefined}
                      onValueChange={(serviceId) =>
                        setTransactionServicesState((prevState) => {
                          const serviceOption = serviceOptions.find(({ id }) => id === serviceId);
                          prevState[index].serviceId = serviceId;
                          prevState[index].price = String(serviceOption?.price || 0);
                        })
                      }
                      disabled={isFetchingServices}
                    >
                      <SelectTrigger className="col-span-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions
                          .filter(({ id }) => {
                            const serviceIds = transactionServicesState.map(
                              ({ serviceId }) => serviceId
                            );
                            return id === service.serviceId || !serviceIds.includes(id);
                          })
                          .map(({ id, serviceName, description }) => (
                            <SelectItem key={id} value={id}>
                              <div className="flex flex-row items-center gap-3">
                                {serviceName} - {description?.slice(0, 36 - serviceName.length)}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-6 items-center gap-4">
                    <Label className="col-span-2 text-right">Price</Label>
                    <Input value={service.price} type="number" disabled className="col-span-4" />
                  </div>
                  {service.serviceBy.map((serviceById, serviceByIndex) => (
                    <div
                      key={serviceById || serviceByIndex}
                      className="grid grid-cols-6 items-center gap-4"
                    >
                      <Label className="col-span-2 flex justify-end">
                        Crew #{serviceByIndex + 1} <RequiredIndicator />
                      </Label>
                      <Select
                        required
                        defaultValue={serviceById || undefined}
                        onValueChange={(id) =>
                          setTransactionServicesState((prevState) => {
                            prevState[index].serviceBy[serviceByIndex] = id;
                          })
                        }
                        disabled={isFetchingCrews}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {crewOptions
                            .filter(
                              ({ id }) => id === serviceById || !service.serviceBy.includes(id)
                            )
                            .map(({ id, name, role }) => (
                              <SelectItem key={id} value={id}>
                                <div className="flex flex-row items-center gap-3">
                                  {name} - {role}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        className="col-span-1 w-fit"
                        variant="ghost"
                        type="button"
                        disabled={service.serviceBy.length === 1}
                        onClick={() =>
                          setTransactionServicesState((prevState) => {
                            prevState[index].serviceBy.splice(serviceByIndex, 1);
                          })
                        }
                      >
                        <XIcon className="w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    className="gap-2 text-center"
                    variant="outline"
                    type="button"
                    onClick={() =>
                      setTransactionServicesState((prevState) => {
                        prevState[index].serviceBy.push('');
                      })
                    }
                  >
                    <PlusCircleIcon className="h-4 w-4" /> Add Crew
                  </Button>
                </div>
              ))}
              <Button
                className="gap-2 text-center"
                variant="outline"
                onClick={() =>
                  setTransactionServicesState((prevState) => {
                    prevState.push(getDefaultServiceValue());
                  })
                }
                type="button"
              >
                <PlusCircleIcon className="h-4 w-4" /> Add Service
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  isAddingTransaction ||
                  isUpdatingTransaction ||
                  (!!transactionId && isFetchingTransactionToEdit)
                }
              >
                {(isAddingTransaction || isUpdatingTransaction) && (
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
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
