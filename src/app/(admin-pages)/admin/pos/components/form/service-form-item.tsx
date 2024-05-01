import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';
import useClientSession from 'src/hooks/use-client-session';
import { useServiceOptions } from 'src/queries/services';
import { transactionSchema } from 'src/schemas/transactions';

import CrewList from './crew-list';
import SelectServiceField from './select-service-field';

import { XIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const watchedData = useWatch();
  const { data: session } = useClientSession();
  const { data: serviceOptions = [] } = useServiceOptions();

  const formState = useMemo(
    () => ({
      ...watchedData,
      ...form.getValues(),
    }),
    [form, watchedData]
  );

  const itemState = formState.transactionServices[index];

  const isEdit = pathname.startsWith(AdminRoute.EditTransaction);
  const allowedToEditPrice =
    !!session && [Role.Admin, Role.Accounting, Role.Cashier].includes(session?.role);

  const selectedService = useMemo(
    () => serviceOptions.find(({ id }) => id === itemState.serviceId),
    [itemState.serviceId, serviceOptions]
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

        <FormField
          control={form.control}
          name={`transactionServices.${index}.price`}
          disabled={!isEdit || !allowedToEditPrice}
          defaultValue={price}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={0.01} {...field} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <CrewList form={form} serviceIndex={index} />
      </div>
    </div>
  );
};

export default ServiceFormItem;
