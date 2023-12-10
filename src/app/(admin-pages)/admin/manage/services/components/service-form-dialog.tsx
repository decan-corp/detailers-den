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
import { useToast } from '@/components/ui/use-toast';
import RequiredIndicator from 'src/components/form/required-indicator';
import { Entity } from 'src/constants/entities';
import { services } from 'src/schema';

import { addService, updateService, getService } from '../actions';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ComponentProps, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { create } from 'zustand';

type ServiceValidationError = {
  [Field in keyof typeof services.$inferSelect]?: string;
};

export const useServiceFormStore = create<{
  isDialogOpen: boolean;
  serviceIdToEdit: null | string;
}>(() => ({
  isDialogOpen: false,
  serviceIdToEdit: null,
}));

const ServiceForm = ({ serviceIdToEdit }: { serviceIdToEdit?: string | null }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [error, setError] = useState<ServiceValidationError>({});

  const isEdit = Boolean(serviceIdToEdit);

  const { data: service, isLoading: isFetchingServiceToEdit } = useQuery({
    queryKey: [Entity.Services, serviceIdToEdit],
    queryFn: async () => {
      const { data, serverError, validationError } = await getService(serviceIdToEdit as string);

      if (serverError || validationError) {
        toast({
          title: validationError ? 'Validation error' : 'Server Error',
          description: serverError || 'Invalid service id',
        });
      }

      return data;
    },
    enabled: !!serviceIdToEdit,
  });

  const { mutate: mutateAddService, isPending: isAddingService } = useMutation({
    mutationFn: addService,
    mutationKey: [Entity.Services],
    onSuccess: async (result) => {
      if (result.validationError) {
        toast({
          title: 'Invalid Input',
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
          variant: 'destructive',
        });

        setError(result.validationError as ServiceValidationError);
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

      await queryClient.invalidateQueries({ queryKey: [Entity.Services] });
      toast({
        title: 'Success!',
        description: 'Service created successfully.',
      });
      useServiceFormStore.setState({ isDialogOpen: false });
    },
  });

  const { mutate: mutateUpdateService, isPending: isUpdatingService } = useMutation({
    mutationFn: updateService,
    mutationKey: [Entity.Services, serviceIdToEdit],
    onSuccess: async (result) => {
      if (result.validationError) {
        toast({
          title: 'Invalid Input',
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
          variant: 'destructive',
        });

        setError(result.validationError as ServiceValidationError);
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

      await queryClient.invalidateQueries({ queryKey: [Entity.Services] });
      toast({
        title: 'Success!',
        description: 'Service updated successfully.',
      });
      useServiceFormStore.setState({ isDialogOpen: false, serviceIdToEdit: null });
    },
  });

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }

    if (serviceIdToEdit) {
      const updateData = payload as typeof services.$inferSelect;
      mutateUpdateService({
        ...updateData,
        price: Number(updateData.price),
        id: serviceIdToEdit,
      });
    } else {
      const addData = payload as typeof services.$inferInsert;
      mutateAddService({ ...addData, price: Number(addData.price) });
    }
  };

  if (isEdit && isFetchingServiceToEdit) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit' : 'Add'} User</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Edit' : 'Add new'} user here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="name" className="col-span-2 flex justify-end">
            Service Name
            <RequiredIndicator />
          </Label>
          <Input
            name="serviceName"
            required
            className="col-span-4"
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
            className="col-span-4"
            defaultValue={service?.description || ''}
            maxLength={160}
          />
        </div>
        <div>
          <div className="grid grid-cols-6 items-center gap-4">
            <Label htmlFor="serviceCutPercentage" className="col-span-2 text-right">
              Price
            </Label>
            <Input
              name="price"
              defaultValue={service?.price || 0}
              type="number"
              min={1}
              max={100000}
              className={twJoin('col-span-4', error.price && 'border-destructive-200')}
              required
            />
          </div>
        </div>
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
        <Button variant="outline">Add Service</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <ServiceForm serviceIdToEdit={serviceId} />
      </DialogContent>
    </Dialog>
  );
};
