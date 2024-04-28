import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useServiceOptions } from 'src/queries/services';
import { transactionSchema } from 'src/schemas/transactions';

import CrewList from './crew-list';
import SelectServiceField from './select-service-field';

import { XIcon } from 'lucide-react';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

const ServiceFormItem = ({
  index,
  form,
  onDelete,
}: {
  index: number;
  form: UseFormReturn<z.input<typeof transactionSchema>>;
  onDelete: () => void;
}) => {
  const { data: serviceOptionsRef = [] } = useServiceOptions();

  const watchedData = useWatch();

  const formState = useMemo(
    () => ({
      ...watchedData,
      ...form.getValues(),
    }),
    [form, watchedData]
  );

  const itemState = formState.transactionServices[index];

  const selectedService = useMemo(
    () => serviceOptionsRef.find(({ id }) => id === itemState.serviceId),
    [itemState.serviceId, serviceOptionsRef]
  );

  const price = useMemo(
    () =>
      selectedService?.priceMatrix.find(({ vehicleSize }) => vehicleSize === formState.vehicleSize)
        ?.price || 0,
    [formState.vehicleSize, selectedService?.priceMatrix]
  );

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex place-content-between">
        <div className="font-semibold">Service {index + 1}</div>
        <Button
          variant="ghost"
          type="button"
          disabled={formState.transactionServices.length === 1}
          onClick={onDelete}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <SelectServiceField form={form} index={index} />

        <div className="space-y-2">
          <Label>Price</Label>
          <Input disabled value={price} />
        </div>

        <Separator />

        <CrewList form={form} serviceIndex={index} />
      </div>
    </div>
  );
};

export default ServiceFormItem;
