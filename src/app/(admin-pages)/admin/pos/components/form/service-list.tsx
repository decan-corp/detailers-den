import { Button } from '@/components/ui/button';
import { transactionServicesSchema } from 'src/schemas/transaction-services';
import { transactionSchema } from 'src/schemas/transactions';

import ServiceFormItem from './service-form-item';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { createId } from '@paralleldrive/cuid2';
import { PlusCircleIcon } from 'lucide-react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

export const makeDefaultServiceByItem = (): z.input<
  typeof transactionServicesSchema
>['serviceBy'][number] => ({ id: createId(), crewId: '', amount: 0 });

export const makeDefaultTransactionServiceItem = (): z.input<typeof transactionServicesSchema> => ({
  id: createId(),
  serviceId: '',
  serviceBy: [makeDefaultServiceByItem()],
});

const ServiceList = ({ form }: { form: UseFormReturn<z.input<typeof transactionSchema>> }) => {
  const [parent] = useAutoAnimate({
    duration: 250,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactionServices',
  });

  const serviceListError = form.formState.errors.transactionServices?.root;
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="font-semibold leading-none tracking-tight">Services</div>
        {serviceListError && (
          <div className="text-sm font-medium text-destructive">{serviceListError.message}</div>
        )}
      </div>
      <div className="space-y-8" ref={parent}>
        {fields.map((item, index) => (
          <ServiceFormItem key={item.id} form={form} index={index} onDelete={() => remove(index)} />
        ))}
      </div>
      <Button
        className="w-full"
        type="button"
        variant="outline"
        onClick={() => append(makeDefaultTransactionServiceItem())}
      >
        <PlusCircleIcon className="mr-1 size-4 text-muted-foreground" />
        Add Service
      </Button>
    </div>
  );
};

export default ServiceList;
