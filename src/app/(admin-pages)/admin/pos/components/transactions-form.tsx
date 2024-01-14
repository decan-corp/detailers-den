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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getServices } from 'src/actions/services/get-services';
import { addTransaction } from 'src/actions/transactions/add-transaction';
import { getTransaction } from 'src/actions/transactions/get-transactions';
import { updateTransaction } from 'src/actions/transactions/update-transaction';
import { getUsers } from 'src/actions/users/get-users';
import RequiredIndicator from 'src/components/form/required-indicator';
import { ModeOfPayment, Role, TransactionStatus, VehicleSize } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import { LocalStorageKey } from 'src/constants/storage-keys';
import { transactionServices, transactions } from 'src/schema';
import { handleSafeActionError } from 'src/utils/error-handling';
import LocalStorage from 'src/utils/local-storage';

import {
  modeOfPaymentOptions,
  transactionStatusOptions,
  vehicleSizeOptions,
} from './data-table-options';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import cuid2 from '@paralleldrive/cuid2';
import { SelectGroup } from '@radix-ui/react-select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircleIcon, XIcon } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { ComponentProps, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { twJoin } from 'tailwind-merge';
import { useImmer } from 'use-immer';

const MAX_LENGTH_RECENT_LIST = 2;

type ValidationError = {
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

// TODO: optimize and create components for transaction services
const TransactionForm = ({ transactionId }: { transactionId?: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [parent] = useAutoAnimate();
  const [transactionServicesState, setTransactionServicesState] = useImmer<Service[]>(() => [
    getDefaultServiceValue(),
  ]);
  const [recentSelectedCrew, setRecentSelectedCrew] = useImmer<string[]>([]);
  const [recentSelectedService, setRecentSelectedService] = useImmer<string[]>([]);
  const [selectedVehicleSize, setSelectedVehicleSize] = useState<VehicleSize>(
    VehicleSize.Motorcycle
  );

  const [error, setError] = useState<ValidationError>({});

  const isEdit = Boolean(transactionId);

  const savedRecentCrewList = useMemo(() => {
    const savedList = LocalStorage.get<string[]>(LocalStorageKey.RecentSelectedCrew);
    if (!savedList || !Array.isArray(savedList)) return [];

    return savedList;
  }, []);

  const savedRecentServiceList = useMemo(() => {
    const savedList = LocalStorage.get<string[]>(LocalStorageKey.RecentSelectedService);
    if (!savedList || !Array.isArray(savedList)) return [];

    return savedList;
  }, []);

  const {
    data: transaction,
    isLoading: isFetchingTransactionToEdit,
    error: fetchingTransactionError,
  } = useQuery({
    queryKey: [Entity.Transactions, transactionId],
    queryFn: async () => {
      const { data, serverError, validationErrors } = await getTransaction(transactionId as string);

      if (serverError || validationErrors) {
        toast.error(validationErrors ? 'Validation error' : 'Server Error');
      }

      return data;
    },
    enabled: !!transactionId,
    refetchOnWindowFocus: false,
  });

  if ((isEdit && transaction === null) || fetchingTransactionError) {
    notFound();
  }

  useEffect(() => {
    if (isEdit && transaction) {
      setTransactionServicesState(transaction.transactionServices);
    }
  }, [isEdit, transaction, setTransactionServicesState]);

  const { data: serviceOptions = [], isLoading: isFetchingServices } = useQuery({
    queryKey: [Entity.Services],
    queryFn: async () => {
      const { data } = await getServices({
        sortBy: { id: 'serviceName', desc: false },
      });
      return data;
    },
  });

  const { data: crewOptions = [], isLoading: isFetchingCrews } = useQuery({
    queryKey: [Entity.Users, 'crews'],
    queryFn: async () => {
      const { data } = await getUsers({
        role: [Role.Crew, Role.Detailer, Role.StayInCrew],
        sortBy: { id: 'name', desc: false },
      });
      return data;
    },
  });

  const { mutate: mutateAddTransaction, isPending: isAddingTransaction } = useMutation({
    mutationFn: addTransaction,
    mutationKey: [Entity.Transactions],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        setError((result.validationErrors as ValidationError) || {});
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
        setError((result.validationErrors as ValidationError) || {});
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Transactions] });
      await queryClient.invalidateQueries({ queryKey: [Entity.CrewEarnings, transactionId] });
      await queryClient.invalidateQueries({ queryKey: [Entity.Metrics] });
      toast.success('Transaction updated successfully.');
      router.push(AdminRoute.POS);
    },
  });

  const saveRecentSelectedCrew = () => {
    const combinedList = [...savedRecentCrewList, ...recentSelectedCrew];
    const derivedList = combinedList.slice(
      combinedList.length - MAX_LENGTH_RECENT_LIST,
      combinedList.length
    );

    LocalStorage.set(LocalStorageKey.RecentSelectedCrew, derivedList);
  };

  const saveRecentSelectedService = () => {
    const combinedList = [...savedRecentServiceList, ...recentSelectedService];
    const derivedList = combinedList.slice(
      combinedList.length - MAX_LENGTH_RECENT_LIST,
      combinedList.length
    );

    LocalStorage.set(LocalStorageKey.RecentSelectedService, derivedList);
  };

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

    saveRecentSelectedCrew();
    saveRecentSelectedService();
  };

  const savedTransactionServiceIds = useMemo(
    () => transaction?.transactionServices.map((transactionService) => transactionService.id) || [],
    [transaction?.transactionServices]
  );

  if (isEdit && isFetchingTransactionToEdit) {
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
                  maxLength={12}
                  defaultValue={transaction?.plateNumber || ''}
                  onKeyDown={(e) => {
                    if (e.code === 'Space') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    e.currentTarget.value = e.currentTarget.value.toUpperCase();
                  }}
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
                <Select
                  required
                  name="vehicleSize"
                  defaultValue={transaction?.vehicleSize || selectedVehicleSize}
                  onValueChange={(value) => {
                    setSelectedVehicleSize(value as VehicleSize);
                    setTransactionServicesState((prevState) => {
                      const newState = prevState.filter(({ serviceId }) => {
                        if (serviceId === '') return true;

                        const service = serviceOptions.find(({ id }) => id === serviceId);
                        const priceMatrixByVehicleSize = service?.priceMatrix.find(
                          ({ vehicleSize }) => vehicleSize === (value as VehicleSize)
                        );

                        return !!priceMatrixByVehicleSize;
                      });
                      return newState.map((data) => {
                        if (data.serviceId === '') return data;
                        const service = serviceOptions.find(({ id }) => id === data.serviceId);
                        const priceMatrix = service?.priceMatrix.find(
                          ({ vehicleSize }) => vehicleSize === (value as VehicleSize)
                        );

                        if (!service || !priceMatrix) return data;

                        return {
                          ...data,
                          price: priceMatrix.price,
                        };
                      });
                    });
                  }}
                >
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
                  className="col-span-4 min-h-[100px] [field-sizing:content]"
                  defaultValue={transaction?.note || ''}
                  maxLength={360}
                />
              </div>

              <div className="py-2 font-semibold leading-none tracking-tight">Services</div>

              <div ref={parent} className="flex flex-col gap-4">
                {transactionServicesState.map((service, index) => {
                  const derivedServiceOptions = serviceOptions
                    .filter(({ priceMatrix }) => {
                      const availableVehicleSizes = priceMatrix.map(
                        ({ vehicleSize }) => vehicleSize
                      );
                      return availableVehicleSizes.includes(selectedVehicleSize);
                    })
                    .filter(({ id }) => {
                      const serviceIds = transactionServicesState.map(({ serviceId }) => serviceId);
                      return id === service.serviceId || !serviceIds.includes(id);
                    });

                  const mostRecentServices = derivedServiceOptions.filter(({ id }) =>
                    savedRecentServiceList.includes(id)
                  );
                  const orderedServiceOptions = derivedServiceOptions.filter(
                    ({ id }) => !savedRecentServiceList.includes(id)
                  );
                  const hasBothServiceOptions =
                    mostRecentServices.length > 0 && orderedServiceOptions.length > 0;
                  return (
                    <div
                      key={service.id}
                      className="flex flex-col gap-4 rounded-lg border border-border p-4 pl-5 pt-2"
                    >
                      <div className="flex flex-row place-content-between items-center">
                        <div className="font-semibold leading-none tracking-tight">
                          Service {index + 1}
                        </div>
                        <Button
                          className=""
                          variant="ghost"
                          type="button"
                          disabled={
                            transactionServicesState.length === 1 ||
                            isSaving ||
                            savedTransactionServiceIds.includes(service.id)
                          }
                          onClick={() =>
                            setTransactionServicesState((prevState) =>
                              prevState.toSpliced(index, 1)
                            )
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
                          onValueChange={(serviceId) => {
                            setTransactionServicesState((prevState) => {
                              const serviceOption = serviceOptions.find(
                                ({ id }) => id === serviceId
                              );
                              const priceMatrix = serviceOption?.priceMatrix.find(
                                ({ vehicleSize }) => vehicleSize === selectedVehicleSize
                              );
                              prevState[index].serviceId = serviceId;
                              prevState[index].price = String(priceMatrix?.price || 0);
                            });
                            setRecentSelectedService((prevState) => {
                              prevState.push(serviceId);
                            });
                          }}
                          disabled={isFetchingServices}
                        >
                          <SelectTrigger className="col-span-4">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {hasBothServiceOptions && (
                                <SelectLabel className="text-muted-foreground/60">
                                  Most Recent
                                </SelectLabel>
                              )}
                              {mostRecentServices.map(({ id, serviceName, description }) => (
                                <SelectItem key={id} value={id}>
                                  <div className="flex flex-row items-center gap-3">
                                    {serviceName} - {description?.slice(0, 36 - serviceName.length)}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            {hasBothServiceOptions && <Separator className="my-1" />}
                            <SelectGroup>
                              {orderedServiceOptions.map(({ id, serviceName, description }) => (
                                <SelectItem key={id} value={id}>
                                  <div className="flex flex-row items-center gap-3">
                                    {serviceName} - {description?.slice(0, 36 - serviceName.length)}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-6 items-center gap-4">
                        <Label className="col-span-2 text-right">Price</Label>
                        <Input
                          value={service.price}
                          type="number"
                          disabled
                          className="col-span-4"
                        />
                      </div>
                      <div ref={parent} className="flex flex-col gap-2">
                        {service.serviceBy.map((serviceById, serviceByIndex) => {
                          const isDisabled =
                            !!transaction?.transactionServices[index] &&
                            transaction?.transactionServices[index].serviceBy.length >
                              serviceByIndex;
                          const derivedCrewOptions = crewOptions.filter(
                            ({ id }) => id === serviceById || !service.serviceBy.includes(id)
                          );
                          const mostRecentCrewOptions = derivedCrewOptions.filter(({ id }) =>
                            savedRecentCrewList.includes(id)
                          );
                          const orderedCrewOptions = derivedCrewOptions.filter(
                            ({ id }) => !savedRecentCrewList.includes(id)
                          );
                          const hasBothCrewOptions =
                            mostRecentCrewOptions.length > 0 && orderedCrewOptions.length > 0;
                          return (
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
                                onValueChange={(id) => {
                                  setTransactionServicesState((prevState) => {
                                    prevState[index].serviceBy[serviceByIndex] = id;
                                  });

                                  setRecentSelectedCrew((prevState) => {
                                    prevState.push(id);
                                  });
                                }}
                                disabled={isFetchingCrews || isDisabled}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {hasBothCrewOptions && (
                                      <SelectLabel className="text-muted-foreground/60">
                                        Most Recent
                                      </SelectLabel>
                                    )}
                                    {mostRecentCrewOptions.map(({ id, name, role }) => (
                                      <SelectItem key={id} value={id}>
                                        <div className="flex flex-row items-center gap-3">
                                          {name} - {role}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                  {hasBothCrewOptions && <Separator className="my-1" />}
                                  <SelectGroup>
                                    {orderedCrewOptions.map(({ id, name, role }) => (
                                      <SelectItem key={id} value={id}>
                                        <div className="flex flex-row items-center gap-3">
                                          {name} - {role}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Button
                                className="col-span-1 w-fit"
                                variant="ghost"
                                type="button"
                                disabled={service.serviceBy.length === 1 || isSaving || isDisabled}
                                onClick={() =>
                                  setTransactionServicesState((prevState) => {
                                    prevState[index].serviceBy.splice(serviceByIndex, 1);
                                  })
                                }
                              >
                                <XIcon className="w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
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
                  );
                })}
              </div>

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
