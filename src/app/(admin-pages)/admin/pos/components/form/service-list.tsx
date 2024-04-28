import { Button } from '@/components/ui/button';
import { transactionSchema } from 'src/schemas/transactions';

import ServiceFormItem from './service-form-item';

import { createId } from '@paralleldrive/cuid2';
import { PlusCircleIcon } from 'lucide-react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

export const defaultServiceByItem = { id: createId(), crewId: '' };
export const defaultTransactionServiceItem = {
  id: createId(),
  serviceId: '',
  serviceBy: [defaultServiceByItem],
};

const ServiceList = ({ form }: { form: UseFormReturn<z.input<typeof transactionSchema>> }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactionServices',
  });

  return (
    <div className="space-y-6">
      <div className="font-semibold leading-none tracking-tight">Services</div>
      <div className="space-y-4">
        <div className="space-y-4">
          {fields.map((item, index) => (
            <ServiceFormItem
              key={item.id}
              form={form}
              index={index}
              onDelete={() => remove(index)}
            />
          ))}
        </div>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={() => append(defaultTransactionServiceItem)}
        >
          <PlusCircleIcon className="mr-1 size-4 text-muted-foreground" />
          Add Service
        </Button>
      </div>
    </div>
  );
};

export default ServiceList;
