/* eslint-disable no-restricted-syntax */
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { addService } from 'src/actions/services/add-service';
import { getService } from 'src/actions/services/get-services';
import { updateService } from 'src/actions/services/update-service';
import RequiredIndicator from 'src/components/form/required-indicator';
import { VehicleSize } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import { services } from 'src/schema';
import { handleSafeActionError } from 'src/utils/error-handling';

import { vehicleSizeOptions } from '../../../pos/components/data-table-options';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircleIcon, XIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ComponentProps, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { twJoin } from 'tailwind-merge';
import { useImmer } from 'use-immer';
import { create } from 'zustand';

type ValidationError = {
  [Field in keyof typeof services.$inferSelect]?: string;
};

export const useServiceFormStore = create<{
  isDialogOpen: boolean;
  serviceIdToEdit: null | string;
}>(() => ({
  isDialogOpen: false,
  serviceIdToEdit: null,
}));

const getDefaultPriceMatrix = () => ({
  vehicleSize: undefined,
  price: 0,
});

const ServiceForm = ({ serviceIdToEdit }: { serviceIdToEdit?: string | null }) => {
  const queryClient = useQueryClient();
  const [parent] = useAutoAnimate();
  const [priceMatrix, setPriceMatrix] = useImmer<{ vehicleSize?: VehicleSize; price: number }[]>(
    () => [getDefaultPriceMatrix()]
  );

  const [error, setError] = useState<ValidationError>({});

  const isEdit = Boolean(serviceIdToEdit);

  const {
    data: service,
    isLoading: isFetchingServiceToEdit,
    error: serviceQueryError,
  } = useQuery({
    queryKey: [Entity.Services, serviceIdToEdit],
    queryFn: async () => {
      const { data, serverError, validationErrors } = await getService(serviceIdToEdit as string);

      if (serverError || validationErrors) {
        toast.error(validationErrors ? 'Validation error' : 'Server Error', {
          description: serverError || 'Invalid service id',
        });
      }

      return data;
    },
    enabled: !!serviceIdToEdit,
    refetchOnWindowFocus: false,
  });

  if ((isEdit && service === null) || serviceQueryError) {
    notFound();
  }

  useEffect(() => {
    if (isEdit && service?.priceMatrix) {
      setPriceMatrix(service.priceMatrix);
    }
  }, [isEdit, service?.priceMatrix, setPriceMatrix]);

  const { mutate: mutateAddService, isPending: isAddingService } = useMutation({
    mutationFn: addService,
    mutationKey: [Entity.Services],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        setError((result.validationErrors as ValidationError) || {});
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Services] });
      toast.success('Service created successfully.');
      useServiceFormStore.setState({ isDialogOpen: false });
    },
  });

  const { mutate: mutateUpdateService, isPending: isUpdatingService } = useMutation({
    mutationFn: updateService,
    mutationKey: [Entity.Services, serviceIdToEdit],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        setError((result.validationErrors as ValidationError) || {});
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Services] });
      toast.success('Service updated successfully.');
      useServiceFormStore.setState({ isDialogOpen: false, serviceIdToEdit: null });
    },
  });

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formEntries: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      formEntries[key] = value;
    }

    const data = formEntries as typeof services.$inferInsert;
    const payload = {
      ...data,
      serviceCutPercentage: Number(data.serviceCutPercentage),
      priceMatrix: priceMatrix as typeof services.$inferInsert.priceMatrix,
    };

    if (serviceIdToEdit) {
      mutateUpdateService({
        ...payload,
        id: serviceIdToEdit,
      });
    } else {
      mutateAddService(payload);
    }
  };

  if (isEdit && isFetchingServiceToEdit) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="loading loading-ring loading-lg text-foreground" />
      </div>
    );
  }

  const isSaving = isAddingService || isUpdatingService;

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit' : 'Add'} Service</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Edit' : 'Add new'} service here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="serviceName" className="col-span-2 flex justify-end">
            Service Name
            <RequiredIndicator />
          </Label>
          <Input
            id="serviceName"
            name="serviceName"
            required
            className={twJoin('col-span-4', error.serviceName && 'border-destructive-200')}
            defaultValue={service?.serviceName || ''}
          />
        </div>
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="description" className="col-span-2 flex justify-end">
            Description <RequiredIndicator />
          </Label>
          <Input
            id="description"
            type="text"
            name="description"
            required
            className={twJoin('col-span-4', error.description && 'border-destructive-200')}
            defaultValue={service?.description || ''}
            maxLength={160}
          />
        </div>
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="serviceCutPercentage" className="col-span-2 flex justify-end">
            Service Cut %
          </Label>
          <Input
            id="serviceCutPercentage"
            name="serviceCutPercentage"
            defaultValue={service?.serviceCutPercentage || 0}
            type="number"
            min={-99}
            max={99}
            className={twJoin('col-span-4', error.serviceCutPercentage && 'border-destructive-200')}
          />
        </div>

        <div className="py-2 font-semibold leading-none tracking-tight">Price Matrix</div>

        <div ref={parent} className="flex flex-col gap-4">
          {priceMatrix.map((matrix, index) => (
            <div
              key={matrix.vehicleSize || index}
              className="flex flex-col gap-4 rounded-lg border border-border p-4 pt-2"
            >
              <div className="flex flex-row place-content-between items-center">
                <div className="font-semibold leading-none tracking-tight">Service {index + 1}</div>
                <Button
                  className=""
                  variant="ghost"
                  type="button"
                  disabled={isSaving || priceMatrix.length === 1}
                  onClick={() => setPriceMatrix((prevState) => prevState.toSpliced(index, 1))}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label className="col-span-2 flex justify-end">
                  Service <RequiredIndicator />
                </Label>
                <Select
                  defaultValue={matrix.vehicleSize || undefined}
                  onValueChange={(vehicleSize: VehicleSize) =>
                    setPriceMatrix((prevState) => {
                      prevState[index].vehicleSize = vehicleSize;
                    })
                  }
                  disabled={isSaving}
                  required
                >
                  <SelectTrigger className="col-span-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleSizeOptions
                      .filter(({ value }) => {
                        const selectedVehicleSizes = priceMatrix.map(
                          ({ vehicleSize }) => vehicleSize
                        );
                        return (
                          value === matrix.vehicleSize || !selectedVehicleSizes.includes(value)
                        );
                      })
                      .map(({ value, icon: Icon, label }) => (
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
                <Label className="col-span-2 text-right">Price</Label>
                <Input
                  defaultValue={matrix.price || 0}
                  type="number"
                  className="col-span-4"
                  required
                  min={1}
                  max={100000}
                  step={0.01}
                  onChange={(e) =>
                    setPriceMatrix((prevState) => {
                      prevState[index].price = Number(e.target.value);
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          className="gap-2 text-center"
          variant="outline"
          onClick={() =>
            setPriceMatrix((prevState) => {
              prevState.push(getDefaultPriceMatrix());
            })
          }
          type="button"
        >
          <PlusCircleIcon className="h-4 w-4" /> Add Price Matrix
        </Button>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={
            isAddingService || isUpdatingService || (!!serviceIdToEdit && isFetchingServiceToEdit)
          }
        >
          {(isAddingService || isUpdatingService) && (
            <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};

export const ServiceFormDialog = () => {
  const isDialogOpen = useServiceFormStore((state) => state.isDialogOpen);
  const serviceId = useServiceFormStore((state) => state.serviceIdToEdit);

  const onOpenChange = (dialogOpen: boolean) => {
    useServiceFormStore.setState({ isDialogOpen: dialogOpen });

    if (!dialogOpen) {
      useServiceFormStore.setState({ serviceIdToEdit: null });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-min">
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-full overflow-auto sm:max-w-[525px]  md:max-h-[720px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <ServiceForm serviceIdToEdit={serviceId} />
      </DialogContent>
    </Dialog>
  );
};
