import { Button } from '@/components/ui/button';
import { transactionSchema } from 'src/schemas/transactions';

import CrewFormItem from './crew-form-item';
import { defaultServiceByItem } from './service-list';

import { PlusCircleIcon } from 'lucide-react';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

const CrewList = ({
  serviceIndex,
  form,
}: {
  serviceIndex: number;
  form: UseFormReturn<z.input<typeof transactionSchema>>;
}) => {
  const watchedData = useWatch();

  const formState = useMemo(
    () => ({
      ...watchedData,
      ...form.getValues(),
    }),
    [form, watchedData]
  );

  const serviceState = formState.transactionServices[serviceIndex];

  const onAddCrew = () => {
    // TODO: auto compute/auto fill crew earned amount field upon adding crew in edit transaction form
    // TODO: do not recompute crew earned amount when change the service price since the computation will already handle
    // it and since this is override. They just have to enter the desired override amount.
    // TODO: do not recompute crew earned amount when adding a crew
    const state = [...formState.transactionServices];
    state[serviceIndex].serviceBy.push(defaultServiceByItem);
    form.setValue('transactionServices', state);
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold">Assign Crews</div>
      <div className="space-y-2">
        {serviceState.serviceBy.map(({ id }, index) => (
          <CrewFormItem key={id} index={index} serviceIndex={serviceIndex} form={form} />
        ))}
      </div>
      <Button className="w-full" type="button" variant="outline" onClick={onAddCrew}>
        <PlusCircleIcon className="mr-1 size-4 text-muted-foreground" />
        Add Crew
      </Button>
    </div>
  );
};

export default CrewList;
