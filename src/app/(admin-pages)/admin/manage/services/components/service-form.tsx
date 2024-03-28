import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
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
import { addService } from 'src/actions/services/add-service';
import { updateService } from 'src/actions/services/update-service';
import { VehicleSize } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import { createServiceSchema } from 'src/schemas/services';
import { handleSafeActionError } from 'src/utils/error-handling';

import { useServiceFormStore } from './data-form-dialog';
import ServiceMatrixForm from './service-matrix-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = createServiceSchema;
export type ServiceFormValues = z.input<typeof formSchema>;

const defaultValues: Partial<ServiceFormValues> = {
  serviceCutPercentage: 0,
  priceMatrix: [{ price: 0, vehicleSize: VehicleSize.Motorcycle }],
};

const ServiceForm = ({
  service,
  serviceId,
}: {
  service?: ServiceFormValues;
  serviceId?: string | null;
}) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(service);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: service || defaultValues,
    shouldFocusError: true,
  });

  const { mutate: mutateAddService, isPending: isAddingService } = useMutation({
    mutationFn: addService,
    mutationKey: [Entity.Services],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Services] });
      toast.success('Service created successfully.');
      useServiceFormStore.setState({ isDialogOpen: false });
    },
  });

  const { mutate: mutateUpdateService, isPending: isUpdatingService } = useMutation({
    mutationFn: updateService,
    mutationKey: [Entity.Services, serviceId],
    onSuccess: async (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [Entity.Services] });
      toast.success('Service updated successfully.');
      useServiceFormStore.setState({ isDialogOpen: false, selectedId: null });
    },
  });

  const onSubmit = (payload: ServiceFormValues) => {
    if (isEdit && serviceId) {
      mutateUpdateService({ ...payload, id: serviceId });
    } else {
      mutateAddService(payload);
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="serviceName"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serviceCutPercentage"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Service Cut %</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        <ServiceMatrixForm form={form} />

        <DialogFooter>
          <Button type="submit" disabled={isAddingService || isUpdatingService}>
            {(isAddingService || isUpdatingService) && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ServiceForm;
