import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getService } from 'src/actions/services/get-services';
import { Role } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import useClientSession from 'src/hooks/use-client-session';

import ServiceForm from './service-form';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { toast } from 'sonner';
import { create } from 'zustand';

export const useServiceFormStore = create<{
  isDialogOpen: boolean;
  selectedId: null | string;
}>(() => ({
  isDialogOpen: false,
  selectedId: null,
}));

export const ServiceFormDialog = () => {
  const isDialogOpen = useServiceFormStore((state) => state.isDialogOpen);
  const serviceId = useServiceFormStore((state) => state.selectedId);
  const { data: user } = useClientSession();

  const isEdit = Boolean(serviceId);

  const { data: service, isLoading: isFetchingService } = useQuery({
    queryKey: [Entity.Services, serviceId],
    queryFn: async () => {
      const { data, serverError, validationErrors } = await getService(serviceId as string);

      if (serverError || validationErrors) {
        toast.error(validationErrors ? 'Validation error' : 'Server Error', {
          description: serverError || 'Invalid service id',
        });
      }

      return data;
    },
    enabled: !!serviceId,
  });

  if (isEdit && service === null) {
    notFound();
  }

  const onOpenChange = (dialogOpen: boolean) => {
    useServiceFormStore.setState({ isDialogOpen: dialogOpen });

    if (!dialogOpen) {
      useServiceFormStore.setState({ selectedId: null });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {user?.role === Role.Admin && (
          <Button variant="outline" size="sm" className="w-min">
            Add Service
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-h-full overflow-auto sm:max-w-[525px]  md:max-h-[720px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add'} Service</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Edit' : 'Add new'} service here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {isEdit && isFetchingService ? (
          <div className="flex h-96 items-center justify-center">
            <span className="loading loading-ring loading-lg text-foreground" />
          </div>
        ) : (
          <ServiceForm service={service} serviceId={serviceId} />
        )}
      </DialogContent>
    </Dialog>
  );
};
